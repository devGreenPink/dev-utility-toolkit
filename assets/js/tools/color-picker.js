// ── COLOR PICKER (Figma-style HSV) ──
// Color math helpers
function hexToRgb(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(x=>x+x).join('');return{r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16)};}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase();}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0,l=(max+min)/2;if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
function hslToRgb(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12;const a=s*Math.min(l,1-l);const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return{r:Math.round(f(0)*255),g:Math.round(f(8)*255),b:Math.round(f(4)*255)};}
// HSV (for the SV square — more natural than HSL for this UI)
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){switch(max){case r:h=((g-b)/d+6)%6;break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;}}return{h:h/6*360,s:max?d/max:0,v:max};}
function hsvToRgb(h,s,v){h/=60;const i=Math.floor(h),f=h-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);let r,g,b;switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;default:r=v;g=p;b=q;}return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)};}

// State
let currentRGB={r:99,g:102,b:241};
let currentHsv={h:239,s:0.59,v:0.95};
let currentAlpha=1.0;
let _cpDragging=null; // 'sv'|'hue'|'alpha'

// Preset swatches
const CP_PRESETS=['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6','#ffffff','#94a3b8','#1e293b'];

function initCpSwatches(){
  const el=document.getElementById('cp-swatches');if(!el)return;
  el.innerHTML=CP_PRESETS.map(hex=>`<div class="cp-swatch" style="background:${hex};" title="${hex}" onclick="onHexInput('${hex}')"></div>`).join('');
}

// Draw SV square (left=white, right=hue; top=bright, bottom=dark)
function drawSvSquare(){
  const canvas=document.getElementById('cp-sv-canvas');if(!canvas)return;
  const wrap=document.getElementById('cp-sv-wrap');
  canvas.width=wrap.offsetWidth||300;canvas.height=wrap.offsetHeight||195;
  const W=canvas.width,H=canvas.height;
  const ctx=canvas.getContext('2d');
  // Base hue color
  const hueRgb=hsvToRgb(currentHsv.h,1,1);
  // Horizontal: white → hue
  const gradH=ctx.createLinearGradient(0,0,W,0);
  gradH.addColorStop(0,'#ffffff');gradH.addColorStop(1,`rgb(${hueRgb.r},${hueRgb.g},${hueRgb.b})`);
  ctx.fillStyle=gradH;ctx.fillRect(0,0,W,H);
  // Vertical: transparent → black
  const gradV=ctx.createLinearGradient(0,0,0,H);
  gradV.addColorStop(0,'rgba(0,0,0,0)');gradV.addColorStop(1,'rgba(0,0,0,1)');
  ctx.fillStyle=gradV;ctx.fillRect(0,0,W,H);
  // Position cursor
  const cur=document.getElementById('cp-sv-cursor');if(!cur)return;
  cur.style.left=(currentHsv.s*W)+'px';
  cur.style.top=((1-currentHsv.v)*H)+'px';
}

// Draw hue bar
function drawHueBar(){
  const canvas=document.getElementById('cp-hue-canvas');if(!canvas)return;
  const track=document.getElementById('cp-hue-track');
  canvas.width=track.offsetWidth||260;canvas.height=14;
  const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
  const grad=ctx.createLinearGradient(0,0,W,0);
  [0,60,120,180,240,300,360].forEach((h,i)=>{const rgb=hsvToRgb(h,1,1);grad.addColorStop(i/6,`rgb(${rgb.r},${rgb.g},${rgb.b})`);});
  ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(0,0,W,H,7);ctx.fill();
  const thumb=document.getElementById('cp-hue-thumb');if(!thumb)return;
  thumb.style.left=(currentHsv.h/360*100)+'%';
}

// Draw alpha bar
function drawAlphaBar(){
  const canvas=document.getElementById('cp-alpha-canvas');if(!canvas)return;
  const track=document.getElementById('cp-alpha-track');
  canvas.width=track.offsetWidth||260;canvas.height=14;
  const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
  // Checkerboard
  const sz=6;for(let y=0;y<H;y+=sz){for(let x=0;x<W;x+=sz){ctx.fillStyle=(Math.floor(x/sz)+Math.floor(y/sz))%2===0?'#888':'#bbb';ctx.fillRect(x,y,sz,sz);}}
  const{r,g,b}=currentRGB;
  const grad=ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0,`rgba(${r},${g},${b},0)`);grad.addColorStop(1,`rgba(${r},${g},${b},1)`);
  ctx.beginPath();ctx.roundRect(0,0,W,H,7);ctx.fillStyle=grad;ctx.fill();
  const thumb=document.getElementById('cp-alpha-thumb');if(!thumb)return;
  thumb.style.left=(currentAlpha*100)+'%';
}

// Master UI update — source of truth is currentHsv + currentAlpha
function updateColorUI(rgb,alpha){
  if(rgb){
    currentRGB={r:Math.round(Math.max(0,Math.min(255,rgb.r))),g:Math.round(Math.max(0,Math.min(255,rgb.g))),b:Math.round(Math.max(0,Math.min(255,rgb.b)))};
    const hsv=rgbToHsv(currentRGB.r,currentRGB.g,currentRGB.b);
    // Preserve hue if color is grey (s≈0)
    if(hsv.s>0.01)currentHsv.h=hsv.h;
    currentHsv.s=hsv.s;currentHsv.v=hsv.v;
  }else{
    currentRGB=hsvToRgb(currentHsv.h,currentHsv.s,currentHsv.v);
  }
  if(alpha!==undefined)currentAlpha=Math.max(0,Math.min(1,alpha));
  const{r,g,b}=currentRGB;
  const hex=rgbToHex(r,g,b);
  const hsl=rgbToHsl(r,g,b);
  const a=currentAlpha;
  // Sync inputs
  const hexEl=document.getElementById('color-hex');if(hexEl&&document.activeElement!==hexEl)hexEl.value=hex;
  const pkEl=document.getElementById('color-picker');if(pkEl)pkEl.value=hex.toLowerCase();
  const setN=(id,v)=>{const el=document.getElementById(id);if(el&&document.activeElement!==el)el.value=v;};
  setN('rgb-r-n',r);setN('rgb-g-n',g);setN('rgb-b-n',b);
  setN('hsl-h-n',hsl.h);setN('hsl-s-n',hsl.s);setN('hsl-l-n',hsl.l);
  // Preview swatch
  const sw=document.getElementById('cp-swatch');if(sw)sw.style.background=`rgba(${r},${g},${b},${a})`;
  // Cursor glow matches color
  const svCur=document.getElementById('cp-sv-cursor');if(svCur)svCur.style.background=hex;
  // Copy boxes
  const $=id=>document.getElementById(id);
  if($('cv-hex'))$('cv-hex').textContent=hex;
  if($('cv-rgb'))$('cv-rgb').textContent=`rgb(${r}, ${g}, ${b})`;
  if($('cv-hsl'))$('cv-hsl').textContent=`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  if($('cv-rgba'))$('cv-rgba').textContent=`rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  if($('cv-css'))$('cv-css').textContent=`--color: ${hex};`;
  // Opacity variants
  const opVars=$('opacity-variants');
  if(opVars)opVars.innerHTML=[0.9,0.75,0.5,0.25].map(oa=>`<div class="cp-val-btn" onclick="copyText('rgba(${r},${g},${b},${oa})')" style="background:rgba(${r},${g},${b},0.12)">rgba(${r},${g},${b},${oa})</div>`).join('');
  // Redraw canvases
  drawSvSquare();drawHueBar();drawAlphaBar();
}

// ── SV Square interaction ──
function svGetXY(e,el){
  const rect=el.getBoundingClientRect();
  const src=e.touches?e.touches[0]:e;
  return{x:Math.max(0,Math.min(rect.width,src.clientX-rect.left)),y:Math.max(0,Math.min(rect.height,src.clientY-rect.top)),W:rect.width,H:rect.height};
}
function svApply(e,el){
  const{x,y,W,H}=svGetXY(e,el);
  currentHsv.s=x/W;currentHsv.v=1-y/H;
  updateColorUI(null);
}
function svDown(e){_cpDragging='sv';svApply(e,e.currentTarget);e.preventDefault();}
function svTouchDown(e){_cpDragging='sv';svApply(e,e.currentTarget);e.preventDefault();}

// ── Hue slider ──
function hueGetX(e,el){
  const rect=el.getBoundingClientRect();
  const src=e.touches?e.touches[0]:e;
  return Math.max(0,Math.min(1,(src.clientX-rect.left)/rect.width));
}
function hueApply(e,el){currentHsv.h=hueGetX(e,el)*360;updateColorUI(null);}
function hueDown(e){_cpDragging='hue';hueApply(e,e.currentTarget);e.preventDefault();}
function hueTouchDown(e){_cpDragging='hue';hueApply(e,e.currentTarget);e.preventDefault();}

// ── Alpha slider ──
function alphaApply(e,el){
  const rect=el.getBoundingClientRect();
  const src=e.touches?e.touches[0]:e;
  currentAlpha=Math.max(0,Math.min(1,(src.clientX-rect.left)/rect.width));
  updateColorUI(null,currentAlpha);
}
function alphaDown(e){_cpDragging='alpha';alphaApply(e,e.currentTarget);e.preventDefault();}
function alphaTouchDown(e){_cpDragging='alpha';alphaApply(e,e.currentTarget);e.preventDefault();}

// ── Global move/up ──
document.addEventListener('mousemove',e=>{
  if(!_cpDragging)return;
  if(_cpDragging==='sv'){const el=document.getElementById('cp-sv-wrap');svApply(e,el);}
  if(_cpDragging==='hue'){const el=document.getElementById('cp-hue-track');hueApply(e,el);}
  if(_cpDragging==='alpha'){const el=document.getElementById('cp-alpha-track');alphaApply(e,el);}
});
document.addEventListener('touchmove',e=>{
  if(!_cpDragging)return;
  if(_cpDragging==='sv'){const el=document.getElementById('cp-sv-wrap');svApply(e,el);e.preventDefault();}
  if(_cpDragging==='hue'){const el=document.getElementById('cp-hue-track');hueApply(e,el);e.preventDefault();}
  if(_cpDragging==='alpha'){const el=document.getElementById('cp-alpha-track');alphaApply(e,el);e.preventDefault();}
},{passive:false});
document.addEventListener('mouseup',()=>{_cpDragging=null;});
document.addEventListener('touchend',()=>{_cpDragging=null;});

// ── Input handlers ──
function onHexInput(v){if(!/^#?[0-9a-fA-F]{6}$/.test(v.replace('#','')))return;try{updateColorUI(hexToRgb(v.startsWith('#')?v:'#'+v));}catch(e){}}
function onPickerInput(v){updateColorUI(hexToRgb(v));}
function onRgbNumInput(){updateColorUI({r:parseInt(document.getElementById('rgb-r-n').value)||0,g:parseInt(document.getElementById('rgb-g-n').value)||0,b:parseInt(document.getElementById('rgb-b-n').value)||0});}
function onHslNumInput(){const rgb=hslToRgb(parseInt(document.getElementById('hsl-h-n').value)||0,parseInt(document.getElementById('hsl-s-n').value)||0,parseInt(document.getElementById('hsl-l-n').value)||0);updateColorUI(rgb);}
// keep old stubs so other code doesn't break
function onRgbInput(){onRgbNumInput();}
function onHslInput(){onHslNumInput();}
function copyColorVal(id){copyText(document.getElementById(id).textContent);}
function pickRandom(){updateColorUI({r:Math.floor(Math.random()*256),g:Math.floor(Math.random()*256),b:Math.floor(Math.random()*256)});}
function resetColor(){currentAlpha=1;updateColorUI({r:99,g:102,b:241});}
function initColorWheel(){
  initCpSwatches();
  // Wait for layout so canvas dimensions are correct
  requestAnimationFrame(()=>{updateColorUI(currentRGB);});
}
function cpSetMode(mode){
  const isRgb=mode==='rgb';
  document.getElementById('cp-rgb-inputs').style.display=isRgb?'':'none';
  document.getElementById('cp-hsl-inputs').style.display=isRgb?'none':'';
  document.getElementById('cp-mode-rgb').classList.toggle('active',isRgb);
  document.getElementById('cp-mode-hsl').classList.toggle('active',!isRgb);
}
