// ── NUMBER BASE CONVERTER ──
function numBaseConvert(fromBase, rawVal) {
  const errEl = document.getElementById('nb-error');
  errEl.style.display = 'none';
  const val = rawVal.trim().toUpperCase().replace(/^0[XBO]/, '').replace(/\s/g, '');
  const setIf = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
  if (!val) {
    ['nb-dec','nb-hex','nb-bin','nb-oct'].forEach(id => { if (id !== 'nb-' + fromBase) setIf(id, ''); });
    return;
  }
  let dec;
  try {
    switch (fromBase) {
      case 'dec': if (!/^\d+$/.test(val)) throw new Error('ต้องเป็นตัวเลข 0-9'); dec = parseInt(val, 10); break;
      case 'hex': if (!/^[0-9A-F]+$/.test(val)) throw new Error('ต้องเป็น 0-9, A-F'); dec = parseInt(val, 16); break;
      case 'bin': if (!/^[01]+$/.test(val)) throw new Error('ต้องเป็น 0 หรือ 1 เท่านั้น'); dec = parseInt(val, 2); break;
      case 'oct': if (!/^[0-7]+$/.test(val)) throw new Error('ต้องเป็น 0-7'); dec = parseInt(val, 8); break;
      default: return;
    }
    if (isNaN(dec) || dec < 0) throw new Error('ค่าไม่ถูกต้อง');
    if (dec > Number.MAX_SAFE_INTEGER) throw new Error('ตัวเลขใหญ่เกิน MAX_SAFE_INTEGER');
  } catch (e) {
    errEl.textContent = '⚠ ' + e.message;
    errEl.style.display = 'block';
    return;
  }
  if (fromBase !== 'dec') setIf('nb-dec', dec.toString(10));
  if (fromBase !== 'hex') setIf('nb-hex', dec.toString(16).toUpperCase());
  if (fromBase !== 'bin') setIf('nb-bin', dec.toString(2));
  if (fromBase !== 'oct') setIf('nb-oct', dec.toString(8));
}
function numBaseSet(n) { const el = document.getElementById('nb-dec'); if (el) el.value = n; numBaseConvert('dec', String(n)); }
function clearNumBase() {
  ['nb-dec','nb-hex','nb-bin','nb-oct'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const errEl = document.getElementById('nb-error'); if (errEl) errEl.style.display = 'none';
}
