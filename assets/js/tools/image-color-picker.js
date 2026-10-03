// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMAGE COLOR PICKER  —  Vanilla JS, production-ready v3
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(function () {
  'use strict';

  // ── State ──
  let _icpImage    = null;
  let _icpPicked   = null;   // { r, g, b, hex, rgb, hsl }
  let _icpCanvas   = null;
  let _icpCtx      = null;
  let _icpDragging = false;
  let _icpRafId    = null;   // rAF handle
  let _icpPendingE = null;   // queued pick coords
  let _icpZoom     = 11;     // loupe sample size (odd number)
  let _icpFmt      = 'hex';  // active copy format: hex | rgb | hsl | tw
  let _icpHistory  = [];     // max 10 recent hex values
  let _icpCursorX  = 0, _icpCursorY = 0; // last known cursor (for nudge)
  const _icpLoupeSize = 84;

  // ── Colour helpers ──
  function icpRgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('').toUpperCase();
  }

  function icpRgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function icpFormatValue(picked, fmt) {
    if (!picked) return '—';
    switch (fmt) {
      case 'rgb': return picked.rgb;
      case 'hsl': return picked.hsl;
      case 'tw':  return `bg-[${picked.hex.toLowerCase()}]`;
      default:    return picked.hex;
    }
  }

  // ── DOM helper ──
  function $id(id) { return document.getElementById(id); }

  function _icpIsMobile() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  function icpShowPanel(hasPick) {
    $id('icp-empty-hint').style.display       = hasPick ? 'none' : '';
    $id('image-color-preview').style.display  = hasPick ? '' : 'none';
    $id('icp-copy-fmt').style.display         = hasPick ? '' : 'none';
    $id('icp-values').style.display           = hasPick ? '' : 'none';
    $id('icp-btn-apply').style.display        = hasPick ? '' : 'none';
    $id('icp-btn-clear').style.display        = _icpImage ? '' : 'none';
    $id('icp-zoom-row').style.display         = hasPick && _icpIsMobile() ? '' : 'none';
    $id('icp-history-section').style.display  = _icpHistory.length ? '' : 'none';
    $id('icp-kbd-hint').style.display         = hasPick && !_icpIsMobile() ? '' : 'none';
  }

  // ── Draw image to canvas ──
  function drawImagePreview() {
    if (!_icpImage) return;
    _icpCanvas = $id('image-preview-canvas');
    _icpCtx    = _icpCanvas.getContext('2d');

    _icpCanvas.width  = _icpImage.naturalWidth;
    _icpCanvas.height = _icpImage.naturalHeight;
    _icpCtx.drawImage(_icpImage, 0, 0);

    // Pre-size loupe canvas once (avoid resize every frame)
    const lc = $id('icp-loupe-canvas');
    lc.width = lc.height = _icpLoupeSize;

    $id('image-preview-wrapper').style.display = '';
    $id('icp-img-toolbar').style.display       = '';
    $id('icp-placeholder').style.display       = 'none';
    $id('image-drop-zone').classList.add('has-image');
    $id('icp-img-info').textContent =
      `${_icpImage.naturalWidth} × ${_icpImage.naturalHeight}px — คลิกเพื่อดูดสี`;
    $id('icp-btn-clear').style.display = '';

    if (window.EyeDropper) $id('icp-eyedropper-btn').style.display = '';
  }

  // ── Core pick logic (called inside rAF) ──
  function _icpDoPickAt(clientX, clientY, isTouch) {
    const rect   = _icpCanvas.getBoundingClientRect();
    const scaleX = _icpCanvas.width  / rect.width;
    const scaleY = _icpCanvas.height / rect.height;

    const px = Math.round((clientX - rect.left) * scaleX);
    const py = Math.round((clientY - rect.top)  * scaleY);
    const cx = Math.max(0, Math.min(_icpCanvas.width  - 1, px));
    const cy = Math.max(0, Math.min(_icpCanvas.height - 1, py));

    const pixel = _icpCtx.getImageData(cx, cy, 1, 1).data;
    const r = pixel[0], g = pixel[1], b = pixel[2];
    const hex = icpRgbToHex(r, g, b);
    const hsl = icpRgbToHsl(r, g, b);

    _icpPicked = { r, g, b, hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    };

    const marker = $id('image-picker-marker');
    const dispX  = clientX - rect.left;
    const dispY  = clientY - rect.top;

    if (isTouch) {
      // ── MOBILE: floating loupe ──
      const sampleR = Math.floor(_icpZoom / 2);
      const lc  = $id('icp-loupe-canvas');
      const lCtx = lc.getContext('2d');
      lCtx.imageSmoothingEnabled = false;
      lCtx.clearRect(0, 0, _icpLoupeSize, _icpLoupeSize);
      lCtx.drawImage(_icpCanvas,
        cx - sampleR, cy - sampleR, _icpZoom, _icpZoom,
        0, 0, _icpLoupeSize, _icpLoupeSize
      );
      marker.style.borderColor = hex;
      marker.style.boxShadow =
        `0 0 0 2px rgba(0,0,0,.5), 0 10px 28px rgba(0,0,0,.55), 0 0 0 5px ${hex}55`;
      const luma  = 0.299*r + 0.587*g + 0.114*b;
      const badge = $id('icp-loupe-hex');
      badge.textContent      = hex;
      badge.style.background = hex;
      badge.style.color      = luma > 140 ? '#000' : '#fff';
      const loupeTop = dispY - _icpLoupeSize - 20 < 6
        ? dispY + 20 : dispY - _icpLoupeSize - 20;
      marker.style.left = dispX + 'px';
      marker.style.top  = loupeTop + 'px';
    } else {
      // ── DESKTOP: small coloured dot ──
      marker.style.background  = hex;
      marker.style.borderColor = '#fff';
      marker.style.boxShadow   = `0 0 0 1.5px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.4)`;
      marker.style.left = dispX + 'px';
      marker.style.top  = dispY + 'px';
    }
    marker.style.display = 'block';

    // Update side panel
    $id('image-color-preview').style.background = hex;
    $id('image-color-hex').textContent          = hex;
    $id('image-color-rgb').textContent          = _icpPicked.rgb;
    $id('image-color-hsl').textContent          = _icpPicked.hsl;
    _icpUpdateActiveValue();
    icpShowPanel(true);
  }

  // ── rAF-throttled public pick entry ──
  function pickColorFromImage(e) {
    if (!_icpCanvas || !_icpCtx) return;
    e.stopPropagation();
    const touch = e.touches?.[0] ?? e.changedTouches?.[0] ?? null;
    const isTouch = !!touch;
    const clientX = isTouch ? touch.clientX : e.clientX;
    const clientY = isTouch ? touch.clientY : e.clientY;
    _icpPendingE = { clientX, clientY, isTouch };
    if (!_icpRafId) {
      _icpRafId = requestAnimationFrame(() => {
        _icpRafId = null;
        if (_icpPendingE) {
          const { clientX: cx, clientY: cy, isTouch: it } = _icpPendingE;
          _icpPendingE = null;
          _icpDoPickAt(cx, cy, it);
        }
      });
    }
  }

  // ── Arrow-key nudge (desktop) ──
  function _icpNudge(dx, dy) {
    if (!_icpCanvas || !_icpCtx) return;
    const rect = _icpCanvas.getBoundingClientRect();
    _icpCursorX = Math.max(rect.left, Math.min(rect.right,  _icpCursorX + dx));
    _icpCursorY = Math.max(rect.top,  Math.min(rect.bottom, _icpCursorY + dy));
    _icpDoPickAt(_icpCursorX, _icpCursorY, false);
  }

  // ── Copy format ──
  function icpSetFmt(fmt) {
    _icpFmt = fmt;
    $id('icp-copy-fmt').querySelectorAll('.icp-fmt-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.fmt === fmt);
    });
    _icpUpdateActiveValue();
  }

  function _icpUpdateActiveValue() {
    const val = icpFormatValue(_icpPicked, _icpFmt);
    const labels = { hex: 'HEX', rgb: 'RGB', hsl: 'HSL', tw: 'TW' };
    $id('icp-active-label').textContent = labels[_icpFmt] || 'HEX';
    $id('icp-active-value').textContent = val;
  }

  function icpCopyActive() {
    const val = icpFormatValue(_icpPicked, _icpFmt);
    if (val && val !== '—') copyPickedHex(val);
  }

  // ── Zoom slider ──
  function icpSetZoom(v) {
    _icpZoom = v;
    $id('icp-zoom-label').textContent = v + '×';
  }

  // ── History ──
  function _icpAddHistory(hex) {
    if (_icpHistory[0] === hex) return;
    _icpHistory = [hex, ..._icpHistory.filter(h => h !== hex)].slice(0, 10);
    _icpRenderHistory();
  }

  function _icpRenderHistory() {
    const row = $id('icp-history-row');
    row.innerHTML = '';
    _icpHistory.forEach(hex => {
      const s = document.createElement('div');
      s.className        = 'icp-history-swatch';
      s.style.background = hex;
      s.title            = hex;
      s.onclick          = () => copyPickedHex(hex);
      row.appendChild(s);
    });
    $id('icp-history-section').style.display = _icpHistory.length ? '' : 'none';
  }

  // ── EyeDropper API (desktop Chrome/Edge) ──
  async function icpUseEyeDropper() {
    if (!window.EyeDropper) return;
    try {
      const result = await new EyeDropper().open();
      const hex = result.sRGBHex.toUpperCase();
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      const hsl = icpRgbToHsl(r, g, b);
      _icpPicked = { r, g, b, hex,
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      };
      $id('image-color-preview').style.background = hex;
      $id('image-color-hex').textContent          = hex;
      $id('image-color-rgb').textContent          = _icpPicked.rgb;
      $id('image-color-hsl').textContent          = _icpPicked.hsl;
      _icpUpdateActiveValue();
      _icpAddHistory(hex);
      icpShowPanel(true);
      showToast('ดูดสี ' + hex + ' จากหน้าจอ ✓');
    } catch (_) { /* user cancelled — no-op */ }
  }

  // ── Copy helpers ──
  function icpCopyValue(elemId) {
    const text = $id(elemId).textContent;
    if (!text || text === '—') return;
    copyPickedHex(text);
  }

  function copyPickedHex(text) {
    try {
      navigator.clipboard.writeText(text)
        .then(() => showToast('คัดลอก ' + text + ' แล้ว ✓'))
        .catch(() => fallbackCopy(text));
    } catch (_) { fallbackCopy(text); }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('คัดลอก ' + text + ' แล้ว ✓'); }
    catch (_) { showToast('⚠️ คัดลอกไม่ได้'); }
    ta.remove();
  }

  // ── Apply to main Color Picker ──
  function icpApplyToMainPicker() {
    if (!_icpPicked) return;
    if (typeof updateColorUI === 'function') {
      updateColorUI({ r: _icpPicked.r, g: _icpPicked.g, b: _icpPicked.b });
      showToast('นำสี ' + _icpPicked.hex + ' เข้า Color Picker ✓');
    } else {
      const hexInput = $id('color-hex');
      if (hexInput) {
        hexInput.value = _icpPicked.hex;
        hexInput.dispatchEvent(new Event('input', { bubbles: true }));
        showToast('นำสี ' + _icpPicked.hex + ' เข้า Color Picker ✓');
      }
    }
  }

  // ── Clear ──
  function icpClearImage() {
    _icpImage = _icpPicked = null;
    _icpDragging = false;
    if (_icpCanvas && _icpCtx)
      _icpCtx.clearRect(0, 0, _icpCanvas.width, _icpCanvas.height);
    $id('image-preview-wrapper').style.display = 'none';
    $id('icp-img-toolbar').style.display       = 'none';
    $id('icp-placeholder').style.display       = '';
    $id('image-picker-marker').style.display   = 'none';
    $id('image-drop-zone').classList.remove('has-image');
    $id('image-upload-input').value            = '';
    $id('icp-eyedropper-btn').style.display    = 'none';
    icpShowPanel(false);
    showToast('ล้างภาพแล้ว');
  }

  // ── File handling ──
  function handleImageFile(file) {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      showToast('⚠️ รองรับเฉพาะ PNG, JPG, WEBP, GIF');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      _icpImage  = img;
      _icpPicked = null;
      URL.revokeObjectURL(url);
      drawImagePreview();
      icpShowPanel(false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('⚠️ โหลดภาพไม่ได้ กรุณาลองใหม่');
    };
    img.src = url;
  }

  // ── Drag & Drop ──
  function icpDragOver(e)  { e.preventDefault(); $id('image-drop-zone').classList.add('dragover'); }
  function icpDragLeave()  { $id('image-drop-zone').classList.remove('dragover'); }
  function icpDrop(e) {
    e.preventDefault();
    $id('image-drop-zone').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
    else showToast('⚠️ ไม่พบไฟล์ในที่วาง');
  }

  function icpFileInputChange(e) {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  }

  // ── Clipboard paste ──
  function handleImagePaste(e) {
    const colorTab = $id('color-tab');
    if (!colorTab?.classList.contains('active')) return;
    const items = (e.clipboardData || window.clipboardData).items;
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        handleImageFile(item.getAsFile());
        return;
      }
    }
  }

  // ── Init ──
  function initImageColorPicker() {
    document.addEventListener('paste', handleImagePaste);

    // FIX: global mouseup resets drag even if cursor leaves canvas
    document.addEventListener('mouseup', () => { _icpDragging = false; });

    // Track cursor for nudge baseline
    document.addEventListener('mousemove', (e) => {
      _icpCursorX = e.clientX;
      _icpCursorY = e.clientY;
    });

    // Keyboard shortcuts (desktop)
    document.addEventListener('keydown', (e) => {
      const colorTab = $id('color-tab');
      if (!colorTab?.classList.contains('active')) return;
      if (!_icpPicked) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // C = copy in active format
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        icpCopyActive();
        _icpAddHistory(_icpPicked.hex);
        return;
      }
      // Arrow keys = nudge 1px (Shift = 10px)
      const step = e.shiftKey ? 10 : 1;
      const nudgeMap = {
        ArrowLeft:  [-step, 0],
        ArrowRight: [ step, 0],
        ArrowUp:    [0, -step],
        ArrowDown:  [0,  step],
      };
      if (nudgeMap[e.key]) {
        e.preventDefault();
        const [dx, dy] = nudgeMap[e.key];
        _icpNudge(dx, dy);
      }
    });

    // Add to history on confirmed pick (mouseup / touchend)
    const canvas = $id('image-preview-canvas');
    if (canvas) {
      canvas.addEventListener('mouseup',  () => { if (_icpPicked) _icpAddHistory(_icpPicked.hex); });
      canvas.addEventListener('touchend', () => { if (_icpPicked) _icpAddHistory(_icpPicked.hex); });
    }

    // Expose globals for inline HTML handlers
    window.icpDragOver          = icpDragOver;
    window.icpDragLeave         = icpDragLeave;
    window.icpDrop              = icpDrop;
    window.icpFileInputChange   = icpFileInputChange;
    window.pickColorFromImage   = pickColorFromImage;
    window.icpCopyValue         = icpCopyValue;
    window.icpCopyActive        = icpCopyActive;
    window.icpSetFmt            = icpSetFmt;
    window.icpSetZoom           = icpSetZoom;
    window.icpApplyToMainPicker = icpApplyToMainPicker;
    window.icpClearImage        = icpClearImage;
    window.icpUseEyeDropper     = icpUseEyeDropper;
    window.copyPickedHex        = copyPickedHex;
    window.handleImageFile      = handleImageFile;
    window.handleImagePaste     = handleImagePaste;
    window.drawImagePreview     = drawImagePreview;
    window.rgbToHex             = icpRgbToHex;
    window.rgbToHsl             = (r, g, b) => icpRgbToHsl(r, g, b);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageColorPicker);
  } else {
    initImageColorPicker();
  }
})();
// ── END IMAGE COLOR PICKER ──
