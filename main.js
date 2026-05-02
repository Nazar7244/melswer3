/* ═══════════════════════════════
   MELS WEAR — Main JavaScript
   ═══════════════════════════════ */

// ══ АУДАРМА ЖҮЙЕСІ ══
const I18N = {
  ru: {
    'nav-home':       'ГЛАВНАЯ',
    'nav-catalog':    'КАТАЛОГ',
    'nav-constructor':'КОНСТРУКТОР',
    'nav-cart':       '🛒 КОРЗИНА',
    'hero-sub':       'АВТОРСКИЕ ДИЗАЙНЫ С DTF-ПЕЧАТЬЮ',
    'btn-catalog':    'КАТАЛОГ',
    'btn-mydesign':   'СВОЙ ДИЗАЙН',
    'hits-title':     'ХИТЫ ПРОДАЖ',
    'stat1-label':    'ЗАКАЗОВ ВЫПОЛНЕНО',
    'stat2-label':    'УНИКАЛЬНЫХ ДИЗАЙНОВ',
    'stat3-label':    'ГОРОДОВ КАЗАХСТАНА',
    'promo-title':    'СОЗДАЙ<br/>СВОЙ ДИЗАЙН',
    'promo-desc':     'Используй наш конструктор для создания уникальных принтов с DTF-печатью.',
    'promo-btn':      'КОНСТРУКТОР →',
  },
  kz: {
    'nav-home':       'БАСТЫ БЕТ',
    'nav-catalog':    'КАТАЛОГ',
    'nav-constructor':'КОНСТРУКТОР',
    'nav-cart':       '🛒 СЕБЕТ',
    'hero-sub':       'АВТОРЛЫҚ ДИЗАЙНДАР · DTF БАСЫП ШЫҒАРУ',
    'btn-catalog':    'КАТАЛОГ',
    'btn-mydesign':   'ӨЗ ДИЗАЙНЫМ',
    'hits-title':     'САТЫЛЫМ ХИТТЕРІ',
    'stat1-label':    'ТАПСЫРЫС ОРЫНДАЛДЫ',
    'stat2-label':    'БІРЕГЕЙ ДИЗАЙН',
    'stat3-label':    'ҚАЗАҚСТАН ҚАЛАЛАРЫ',
    'promo-title':    'ӨЗ ДИЗАЙНЫҢДЫ<br/>ЖАСА',
    'promo-desc':     'Бірегей DTF принттер жасау үшін конструкторымызды пайдалан.',
    'promo-btn':      'КОНСТРУКТОР →',
  }
};

let currentLang = localStorage.getItem('mw_lang') || 'kz';

function switchLang() {
  currentLang = currentLang === 'kz' ? 'ru' : 'kz';
  localStorage.setItem('mw_lang', currentLang);
  applyLang();
}

function applyLang() {
  const t = I18N[currentLang];

  // data-i18n → textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // data-i18n-html → innerHTML (үшін <br/> бар мәтіндер)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // Батырма белгісін жаңарту
  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = currentLang === 'kz' ? 'RU' : 'KZ';
}

// Бет жүктелгенде қолданылсын
document.addEventListener('DOMContentLoaded', applyLang);


// ══ КОНФИГУРАЦИЯ ══
// Telegram-ды қосу үшін bot token мен chat_id-ді өзгертіңіз
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID   = 'YOUR_CHAT_ID_HERE';
const ADMIN_PASSWORD     = 'mels2024';   // admin.html кіру паролі


// ── CONSTRUCTOR STATE ──
let currentView = 'front';
let currentGarment = 'tshirt';
let selectedEl = null;
let elements = { front: [], back: [] };
let textColor = '#ffffff';
let isBold = false;
let elIdCounter = 0;
let rotation = {};
let selectedSize = 'M';


// ── SIZE ──
function setSize(btn) {
  if (btn.classList.contains('unavail')) return;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = btn.textContent;
  document.getElementById('size-selected-label').textContent = 'Таңдалды: ' + selectedSize;
  updatePrice();
  showToast('📐 Өлшем: ' + selectedSize);
}

// ── VIEW SWITCH ──
function setView(view) {
  currentView = view;
  const isTshirt = currentGarment === 'tshirt';
  ['tshirt-front','tshirt-back','hoodie-front','hoodie-back'].forEach(id => {
    const el = document.getElementById(id); if(el) el.style.display='none';
  });
  ['print-zone-front','print-zone-back','print-zone-hoodie-front','print-zone-hoodie-back'].forEach(id => {
    const el = document.getElementById(id); if(el) el.style.display='none';
  });
  if (isTshirt) {
    document.getElementById(view==='front'?'tshirt-front':'tshirt-back').style.display = 'block';
    document.getElementById(view==='front'?'print-zone-front':'print-zone-back').style.display = 'block';
  } else {
    document.getElementById(view==='front'?'hoodie-front':'hoodie-back').style.display = 'block';
    document.getElementById(view==='front'?'print-zone-hoodie-front':'print-zone-hoodie-back').style.display = 'block';
  }
  document.getElementById('btn-front').classList.toggle('active', view === 'front');
  document.getElementById('btn-back').classList.toggle('active', view === 'back');
  deselectAll();
  updateLayers();
}

// ── PRODUCT SWITCH ──
function setProduct(p) {
  currentGarment = p;
  document.getElementById('tab-tshirt').classList.toggle('active', p==='tshirt');
  document.getElementById('tab-hoodie').classList.toggle('active', p==='hoodie');

  ['tshirt-front','tshirt-back','hoodie-front','hoodie-back'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  ['print-zone-front','print-zone-back','print-zone-hoodie-front','print-zone-hoodie-back'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  currentView = 'front';
  document.getElementById('btn-front').classList.add('active');
  document.getElementById('btn-back').classList.remove('active');

  if (p === 'tshirt') {
    document.getElementById('tshirt-front').style.display = 'block';
    document.getElementById('print-zone-front').style.display = 'block';
  } else {
    document.getElementById('hoodie-front').style.display = 'block';
    document.getElementById('print-zone-hoodie-front').style.display = 'block';
  }

  const activeSwatch = document.querySelector('.swatch.active');
  if (activeSwatch) setTshirtColor(activeSwatch);

  elements = { front: [], back: [] };
  updateLayers(); updatePrice();
  showToast(p === 'tshirt' ? '👕 Футболка таңдалды' : '🧥 Худи таңдалды');
}

// ── TSHIRT COLOR ──
function setTshirtColor(el) {
  const color = el.dataset.color;
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  ['tshirt-body','tshirt-body-back','hoodie-body','hoodie-body-back'].forEach(id => {
    const path = document.getElementById(id);
    if (path) path.setAttribute('fill', color);
  });
  const isLight = isLightColor(color);
  document.querySelectorAll('.tshirt-svg path:not([id])').forEach(p => {
    const fill = p.getAttribute('fill');
    if (fill && fill.includes('#1') || fill && fill.includes('#2')) {
      p.setAttribute('fill', isLight ? darken(color, 15) : lighten(color, 8));
    }
  });
  showToast('Түс өзгертілді');
}

function isLightColor(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114) / 1000 > 128;
}
function darken(hex, pct) {
  let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  r=Math.max(0,r-pct); g=Math.max(0,g-pct); b=Math.max(0,b-pct);
  return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function lighten(hex, pct) {
  let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  r=Math.min(255,r+pct); g=Math.min(255,g+pct); b=Math.min(255,b+pct);
  return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}

// ── IMAGE UPLOAD ──
function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => addImageElement(e.target.result, file.name);
  reader.readAsDataURL(file);
  input.value = '';
}

function addImageElement(src, name) {
  const zone = getZone();
  const id = ++elIdCounter;
  const el = document.createElement('div');
  el.className = 'design-el';
  el.dataset.id = id;
  el.dataset.type = 'image';
  el.dataset.name = name || 'Сурет';
  el.style.cssText = `left:10px;top:10px;width:100px;height:100px;`;
  rotation[id] = 0;

  const img = document.createElement('img');
  img.src = src; img.dataset.src = src;
  img.style.cssText = 'width:100%;height:100%;object-fit:contain;pointer-events:none;display:block;';
  el.appendChild(img);

  addResizeHandle(el);
  makeDraggable(el);
  zone.appendChild(el);
  elements[currentView].push({ id, type:'image', src, name: name||'Сурет' });
  selectEl(el);
  updateLayers();
  updatePrice();
  showToast('✅ Сурет қосылды');
}

// ── ADD TEXT ──
function addText() {
  const val = document.getElementById('text-input').value.trim();
  if (!val) { showToast('⚠️ Текст жазыңыз'); return; }
  const zone = getZone();
  const id = ++elIdCounter;
  const font = document.getElementById('font-sel').value;
  const el = document.createElement('div');
  el.className = 'design-el';
  el.dataset.id = id;
  el.dataset.type = 'text';
  el.dataset.name = val;
  el.style.cssText = `left:10px;top:10px;width:130px;height:40px;`;
  rotation[id] = 0;

  const span = document.createElement('div');
  span.className = 'text-el';
  span.style.cssText = `font-family:${font};font-size:22px;color:${textColor};font-weight:${isBold?700:400};white-space:nowrap;pointer-events:none;text-transform:uppercase;letter-spacing:0.05em;`;
  span.textContent = val;
  el.appendChild(span);

  addResizeHandle(el);
  makeDraggable(el);
  zone.appendChild(el);
  elements[currentView].push({ id, type:'text', text:val, font, color:textColor });
  selectEl(el);
  updateLayers();
  updatePrice();
  document.getElementById('text-input').value = '';
  showToast('✅ Текст қосылды');
}

// ── TEXT CONTROLS ──
function setTextColor(dot) {
  textColor = dot.dataset.color;
  document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
  dot.classList.add('active');
  if (selectedEl && selectedEl.dataset.type === 'text') {
    selectedEl.querySelector('.text-el').style.color = textColor;
  }
}

function toggleBold() {
  isBold = !isBold;
  document.getElementById('bold-btn').classList.toggle('active', isBold);
  if (selectedEl && selectedEl.dataset.type === 'text') {
    selectedEl.querySelector('.text-el').style.fontWeight = isBold ? 700 : 400;
  }
}

function updateSelectedFont() {
  if (selectedEl && selectedEl.dataset.type === 'text') {
    selectedEl.querySelector('.text-el').style.fontFamily = document.getElementById('font-sel').value;
  }
}

function changeSize(delta) {
  if (!selectedEl) { showToast('⚠️ Элемент таңдаңыз'); return; }
  const el = selectedEl;
  const w = parseInt(el.style.width); const h = parseInt(el.style.height);
  el.style.width = Math.max(30, w + delta*4) + 'px';
  el.style.height = Math.max(20, h + delta*2) + 'px';
  if (el.dataset.type === 'text') {
    const span = el.querySelector('.text-el');
    const fs = parseInt(span.style.fontSize || 22);
    span.style.fontSize = Math.max(8, fs + delta) + 'px';
  }
}

// ── ELEMENT ACTIONS ──
function deleteSelected() {
  if (!selectedEl) return;
  const id = parseInt(selectedEl.dataset.id);
  selectedEl.remove();
  elements[currentView] = elements[currentView].filter(e => e.id !== id);
  selectedEl = null;
  document.getElementById('el-controls').style.display = 'none';
  updateLayers(); updatePrice();
  showToast('🗑 Жойылды');
}

function duplicateSelected() {
  if (!selectedEl) return;
  if (selectedEl.dataset.type === 'image') {
    const img = selectedEl.querySelector('img');
    addImageElement(img.dataset.src, selectedEl.dataset.name);
  } else {
    document.getElementById('text-input').value = selectedEl.dataset.name;
    addText();
  }
  showToast('Көшірілді');
}

function bringForward() {
  if (!selectedEl) return;
  const zone = getZone();
  zone.appendChild(selectedEl);
  showToast('Алға жылжытылды');
}

function sendBackward() {
  if (!selectedEl) return;
  const zone = getZone();
  zone.insertBefore(selectedEl, zone.firstChild);
  showToast('Артқа жылжытылды');
}

function flipHorizontal() {
  if (!selectedEl) return;
  const inner = selectedEl.firstChild;
  const cur = inner.style.transform || '';
  inner.style.transform = cur.includes('scaleX(-1)') ? cur.replace('scaleX(-1)','') : cur + ' scaleX(-1)';
  showToast('↔ Айналдырылды');
}

function rotateEl() {
  if (!selectedEl) return;
  const id = parseInt(selectedEl.dataset.id);
  rotation[id] = ((rotation[id]||0) + 15) % 360;
  selectedEl.style.transform = `rotate(${rotation[id]}deg)`;
  showToast(`↻ ${rotation[id]}°`);
}

// ── DRAG & RESIZE ──
function makeDraggable(el) {
  let startX, startY, origLeft, origTop, dragging = false;

  el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('resize-handle')) return;
    e.preventDefault();
    selectEl(el);
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    origLeft = parseInt(el.style.left)||0;
    origTop = parseInt(el.style.top)||0;

    const onMove = e => {
      if (!dragging) return;
      const zone = getZone();
      const zr = zone.getBoundingClientRect();
      const newL = Math.max(0, Math.min(origLeft + e.clientX - startX, zr.width - parseInt(el.style.width)));
      const newT = Math.max(0, Math.min(origTop + e.clientY - startY, zr.height - parseInt(el.style.height)));
      el.style.left = newL + 'px';
      el.style.top = newT + 'px';
    };
    const onUp = () => { dragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  el.addEventListener('touchstart', e => {
    if (e.target.classList.contains('resize-handle')) return;
    selectEl(el);
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    origLeft = parseInt(el.style.left)||0;
    origTop = parseInt(el.style.top)||0;
  }, {passive:true});
  el.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    const zone = getZone();
    const zr = zone.getBoundingClientRect();
    el.style.left = Math.max(0,Math.min(origLeft+t.clientX-startX, zr.width-parseInt(el.style.width)))+'px';
    el.style.top = Math.max(0,Math.min(origTop+t.clientY-startY, zr.height-parseInt(el.style.height)))+'px';
  }, {passive:false});
}

function addResizeHandle(el) {
  const handle = document.createElement('div');
  handle.className = 'resize-handle';
  el.appendChild(handle);

  let startX, startY, origW, origH;
  handle.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    startX = e.clientX; startY = e.clientY;
    origW = parseInt(el.style.width); origH = parseInt(el.style.height);

    const onMove = e => {
      const newW = Math.max(30, origW + e.clientX - startX);
      const newH = Math.max(20, origH + e.clientY - startY);
      el.style.width = newW + 'px';
      el.style.height = newH + 'px';
      if (el.dataset.type === 'text') {
        el.querySelector('.text-el').style.fontSize = Math.max(8, Math.round(newH*0.55)) + 'px';
      }
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// ── SELECT / DESELECT ──
function selectEl(el) {
  deselectAll();
  selectedEl = el;
  el.classList.add('selected');
  document.getElementById('el-controls').style.display = 'block';
  if (el.dataset.type === 'text') {
    const span = el.querySelector('.text-el');
    document.getElementById('font-sel').value = span.style.fontFamily || "'League Gothic',sans-serif";
    isBold = parseInt(span.style.fontWeight||400) >= 700;
    document.getElementById('bold-btn').classList.toggle('active', isBold);
  }
}

function deselectAll() {
  document.querySelectorAll('.design-el').forEach(e => e.classList.remove('selected'));
  selectedEl = null;
  document.getElementById('el-controls').style.display = 'none';
}

document.getElementById('tshirt-stage').addEventListener('click', e => {
  if (!e.target.closest('.design-el')) deselectAll();
});

// ── LAYERS ──
function updateLayers() {
  const list = document.getElementById('layers-list');
  const els = elements[currentView];
  if (!els.length) {
    list.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.2);text-align:center;padding:12px">Принт элементтері осында көрінеді</div>';
    return;
  }
  list.innerHTML = '';
  [...els].reverse().forEach(e => {
    const item = document.createElement('div');
    item.className = 'layer-item';
    const domEl = document.querySelector(`[data-id="${e.id}"]`);
    if (domEl === selectedEl) item.classList.add('active');

    const thumb = document.createElement('div');
    thumb.className = 'layer-thumb';
    if (e.type === 'image') {
      const img = document.createElement('img'); img.src = e.src; thumb.appendChild(img);
    } else {
      thumb.textContent = 'T';
    }

    const name = document.createElement('div');
    name.className = 'layer-name';
    name.textContent = (e.type === 'image' ? '🖼 ' : '✍ ') + e.name.substring(0,18);

    const del = document.createElement('button');
    del.className = 'layer-del';
    del.innerHTML = '×';
    del.onclick = ev => {
      ev.stopPropagation();
      if (domEl) { selectedEl = domEl; deleteSelected(); }
    };

    item.appendChild(thumb); item.appendChild(name); item.appendChild(del);
    item.onclick = () => { if (domEl) selectEl(domEl); updateLayers(); };
    list.appendChild(item);
  });
}

// ── HELPERS ──
function getZone() {
  if (currentGarment === 'tshirt') {
    return document.getElementById(currentView === 'front' ? 'print-zone-front' : 'print-zone-back');
  } else {
    return document.getElementById(currentView === 'front' ? 'print-zone-hoodie-front' : 'print-zone-hoodie-back');
  }
}

function updatePrice() {
  const total = elements.front.length + elements.back.length;
  const base = currentGarment === 'tshirt' ? 15000 : 25000;
  const extra = total > 0 ? (elements.back.length > 0 ? 3000 : 0) : 0;
  document.getElementById('price-val').textContent = (base + extra).toLocaleString('ru') + ' ₸';
  const sizeInfo = document.getElementById('order-size-info');
  if (sizeInfo) sizeInfo.textContent = selectedSize;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── DRAG & DROP FROM DESKTOP ──
const canvasWrap = document.getElementById('canvas-wrap');
canvasWrap.addEventListener('dragover', e => { e.preventDefault(); canvasWrap.classList.add('drag-over'); });
canvasWrap.addEventListener('dragleave', () => canvasWrap.classList.remove('drag-over'));
canvasWrap.addEventListener('drop', e => {
  e.preventDefault();
  canvasWrap.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = ev => addImageElement(ev.target.result, file.name);
    reader.readAsDataURL(file);
  }
});

// ── SAVE PNG ──
function saveDesign() {
  const stage = document.getElementById('tshirt-stage');
  if (typeof html2canvas !== 'undefined') {
    showToast('⏳ Сақталуда...');
    html2canvas(stage, { backgroundColor: null, scale: 2, useCORS: true })
      .then(canvas => {
        const link = document.createElement('a');
        link.download = 'mels-wear-design.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('✅ Дизайн сақталды!');
      })
      .catch(() => showToast('⚠️ Скриншот алыңыз (Ctrl+Shift+S)'));
  } else {
    showToast('💾 Скриншот алыңыз (Ctrl+Shift+S)');
  }
}

// ── CONSTRUCTOR ORDER ──
function placeOrder() {
  const total = elements.front.length + elements.back.length;
  if (total === 0) { showToast('⚠️ Алдымен принт қосыңыз'); return; }
  const sizeInfo = document.getElementById('order-size-info');
  if (sizeInfo) sizeInfo.textContent = selectedSize;
  const prodInfo = document.getElementById('order-product-info');
  if (prodInfo) prodInfo.textContent = currentGarment === 'tshirt' ? 'Футболка' : 'Худи';
  document.getElementById('order-modal').classList.add('show');
}
function closeModal() { document.getElementById('order-modal').classList.remove('show'); }
document.getElementById('order-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ── KEYBOARD ──
document.addEventListener('keydown', e => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedEl && document.activeElement.tagName !== 'INPUT') deleteSelected();
  }
  if (e.key === 'Escape') deselectAll();
});

document.getElementById('text-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addText();
});


/* ─────────────────── */


// ── CURSOR ──
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx - 6 + 'px';
  cursor.style.top = my - 6 + 'px';
});

function animFollower() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  follower.style.left = fx - 18 + 'px';
  follower.style.top = fy - 18 + 'px';
  requestAnimationFrame(animFollower);
}
animFollower();

document.querySelectorAll('a, button, .product-card, .insta-cell').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'scale(2.5)';
    follower.style.transform = 'scale(1.5)';
    follower.style.borderColor = '#B6FF00';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'scale(1)';
    follower.style.transform = 'scale(1)';
    follower.style.borderColor = '#00D9FF';
  });
});

// ── AOS ──
AOS.init({
  once: true,
  offset: 80,
  easing: 'ease-out-cubic'
});

// ── GSAP ──
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({ delay: 0.1 });
tl.from('#hero-title',  { y: 80, opacity: 0, duration: 0.9, ease: 'power3.out' })
  .from('#hero-sub',    { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
  .from('#hero-btns',   { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
  .from('#scroll-ind',  { opacity: 0, duration: 0.5 }, '-=0.1');

gsap.to('#hero-img', {
  yPercent: 25,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

gsap.to('#promo-img', {
  yPercent: 12,
  ease: 'none',
  scrollTrigger: {
    trigger: '#promo-img',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  }
});

ScrollTrigger.create({
  start: 'top -60',
  onUpdate: (self) => {
    const h = document.getElementById('header');
    if (self.scroll() > 60) {
      h.style.height = '56px';
      h.style.borderBottomColor = 'rgba(0,217,255,0.3)';
    } else {
      h.style.height = '80px';
      h.style.borderBottomColor = 'var(--white)';
    }
  }
});

function activateLine(id, trigId) {
  ScrollTrigger.create({
    trigger: trigId,
    start: 'top 80%',
    onEnter: () => document.getElementById(id).classList.add('active')
  });
}
activateLine('hits-line', '#hits-section');
activateLine('promo-line', '#promo-line');
activateLine('cons-line', '#constructor-section');

function animCounter(id, target, suffix = '') {
  ScrollTrigger.create({
    trigger: '#' + id,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function() {
          document.getElementById(id).textContent = Math.round(this.targets()[0].val) + suffix;
        }
      });
    }
  });
}
animCounter('stat1', 1200, '+');
animCounter('stat2', 340, '+');
animCounter('stat3', 16, '');

gsap.utils.toArray('.product-card').forEach((card, i) => {
  gsap.from(card, {
    y: 50, opacity: 0, duration: 0.7,
    ease: 'power2.out',
    delay: i * 0.1,
    scrollTrigger: {
      trigger: card,
      start: 'top 90%',
      once: true
    }
  });
});

const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}, { passive: true });

// ── TEXT SCRAMBLE ──
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ01234';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    const promise = new Promise(res => this.resolve = res);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from = old[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 10);
      const end = start + Math.floor(Math.random() * 14);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameReq);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:var(--electric);opacity:0.7">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameReq = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

const scrambleEls = document.querySelectorAll('.scramble-text');
scrambleEls.forEach(el => {
  const original = el.dataset.scramble;
  const fx = new TextScramble(el);
  setTimeout(() => fx.setText(original), 900);
  el.addEventListener('mouseenter', () => fx.setText(original));
});

document.querySelectorAll('h3.font-gothic').forEach(el => {
  const orig = el.textContent.trim();
  const fx2 = new TextScramble(el);
  let done = false;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      if (!done) { done = true; fx2.setText(orig); }
    }
  });
});

document.querySelectorAll('.btn-magnetic').forEach(wrap => {
  const btn = wrap.querySelector('button');
  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    gsap.to(wrap, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    gsap.to(btn, { x: dx * 0.2, y: dy * 0.2, duration: 0.3, ease: 'power2.out' });
  });
  wrap.addEventListener('mouseleave', () => {
    gsap.to(wrap, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
  });
});

document.querySelectorAll('.tilt-card').forEach(card => {
  const shine = card.querySelector('.tilt-shine');
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -10;
    const rotY = ((x - cx) / cx) * 10;
    gsap.to(card, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 800,
      duration: 0.3,
      ease: 'power2.out'
    });
    if (shine) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(0,217,255,0.18), transparent 60%)`;
    }
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotationX: 0, rotationY: 0,
      duration: 0.6,
      ease: 'elastic.out(1,0.5)'
    });
  });
});

document.querySelectorAll('a[href="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const overlay = document.getElementById('page-trans');
    gsap.to(overlay, {
      scaleY: 1, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        gsap.to(overlay, { scaleY: 0, transformOrigin: 'bottom', duration: 0.4, ease: 'power2.out', delay: 0.1 });
      }
    });
  });
});

const reelsTrack = document.getElementById('reels-track');
if (reelsTrack) {
  let isDown = false, startX, scrollLeft;
  reelsTrack.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - reelsTrack.offsetLeft;
    scrollLeft = reelsTrack.scrollLeft;
  });
  document.addEventListener('mouseup', () => { isDown = false; });
  reelsTrack.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - reelsTrack.offsetLeft;
    reelsTrack.scrollLeft = scrollLeft - (x - startX) * 1.4;
  });
  reelsTrack.addEventListener('touchstart', e => {
    startX = e.touches[0].pageX - reelsTrack.offsetLeft;
    scrollLeft = reelsTrack.scrollLeft;
  }, { passive: true });
  reelsTrack.addEventListener('touchmove', e => {
    const x = e.touches[0].pageX - reelsTrack.offsetLeft;
    reelsTrack.scrollLeft = scrollLeft - (x - startX) * 1.2;
  }, { passive: true });
}


/* ─────────────────── */


// ══ SPA PAGE ROUTER ══
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) { target.classList.add('active'); window.scrollTo(0,0); }
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navMap = { home:0, catalog:1, constructor:2, cart:3 };
  const links = document.querySelectorAll('.nav-link');
  if (links[navMap[page]]) links[navMap[page]].classList.add('active');
  ['home','catalog','constructor','cart'].forEach(p => {
    const btn = document.getElementById('mob-' + p);
    if (btn) {
      btn.classList.toggle('active', p === page);
      const icon = btn.querySelector('span');
      if (icon) icon.style.color = (p === page) ? '#00D9FF' : 'rgba(255,255,255,0.5)';
    }
  });
  if (page === 'cart') renderCartPage();
  if (page === 'order') renderOrderPage();
  if (page === 'catalog') setTimeout(renderCatalog, 50);
}

document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => showPage(btn.dataset.goto));
});


/* ─────────────────── */


// ══ CART SYSTEM ══
function getCart() {
  try { return JSON.parse(localStorage.getItem('mw_cart') || '[]'); } catch { return []; }
}
function saveCart(cart) {
  try { localStorage.setItem('mw_cart', JSON.stringify(cart)); } catch(e) { showToast('⚠️ Сақтау қатесі'); }
}

function addToCart(product) {
  const cart = getCart();
  const key = product.id + '_' + (product.size||'');
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty = (existing.qty||1) + 1;
  } else {
    cart.push({ ...product, key, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  showToast('✅ Корзинаға қосылды!');
}

function removeFromCart(key) {
  const cart = getCart().filter(i => i.key !== key);
  saveCart(cart);
  updateCartUI();
  renderCartPage();
}

function changeQty(key, delta) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, (item.qty||1) + delta);
  saveCart(cart);
  updateCartUI();
  renderCartPage();
}

function clearCart() {
  if (!confirm('Барлық тауарды өшіресіз бе?')) return;
  saveCart([]);
  updateCartUI();
  renderCartPage();
}

function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((s,i) => s + (i.qty||1), 0);
  const navBadge = document.getElementById('cart-count-nav');
  if (navBadge) { navBadge.textContent = total; navBadge.style.display = total > 0 ? 'inline' : 'none'; }
  const mobBadge = document.getElementById('cart-count-mob');
  if (mobBadge) { mobBadge.textContent = total; mobBadge.style.display = total > 0 ? 'flex' : 'none'; }
}

function renderCartPage() {
  const cart = getCart();
  const emptyState = document.getElementById('cart-empty-state');
  const itemsList = document.getElementById('cart-items-list');
  const countLabel = document.getElementById('cart-count-label');
  const container = document.getElementById('cart-items-container');
  const totalVal = document.getElementById('cart-total-val');
  if (!emptyState) return;

  const total = cart.reduce((s,i) => s + (i.qty||1), 0);
  if (countLabel) countLabel.textContent = total + ' тауар';

  if (cart.length === 0) {
    emptyState.style.display = 'flex';
    itemsList.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  itemsList.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.img ? `<img src="${item.img}" style="width:100%;height:100%;object-fit:cover">` : '<span class="material-symbols-outlined" style="font-size:28px">checkroom</span>'}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">
          ${item.size ? '📐 ' + item.size : ''}
          ${item.color ? ' · 🎨 ' + item.color : ''}
          · ${(item.price||0).toLocaleString('ru')} ₸ / дана
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty('${item.key}',-1)">−</button>
          <span class="qty-num">${item.qty||1}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}',1)">+</button>
        </div>
        <button class="del-btn" onclick="removeFromCart('${item.key}')">
          <span class="material-symbols-outlined" style="font-size:20px">delete</span>
        </button>
      </div>
      <div class="cart-item-price">${((item.price||0)*(item.qty||1)).toLocaleString('ru')} ₸</div>
    </div>
  `).join('');

  const sum = cart.reduce((s,i) => s + (i.price||0)*(i.qty||1), 0);
  if (totalVal) totalVal.textContent = sum.toLocaleString('ru') + ' ₸';
}

function goCheckout() {
  const cart = getCart();
  if (cart.length === 0) { showToast('⚠️ Корзина бос!'); return; }
  showPage('order');
}


/* ─────────────────── */


// ══ ORDER SYSTEM ══
function renderOrderPage() {
  const cart = getCart();
  const list = document.getElementById('order-items-list');
  const totalEl = document.getElementById('order-total-val');
  if (!list) return;
  list.innerHTML = cart.map(i => `
    <div class="order-item-row">
      <span class="order-item-name">${i.name} ${i.size ? '· '+i.size : ''} × ${i.qty||1}</span>
      <span class="order-item-price">${((i.price||0)*(i.qty||1)).toLocaleString('ru')} ₸</span>
    </div>
  `).join('') || '<div style="color:rgba(255,255,255,0.3);font-size:13px;padding:12px 0">Корзина бос</div>';
  const sum = cart.reduce((s,i)=>s+(i.price||0)*(i.qty||1),0);
  if (totalEl) totalEl.textContent = sum.toLocaleString('ru') + ' ₸';
}

function selectPayment(el) {
  document.querySelectorAll('.payment-opt').forEach(p=>p.classList.remove('selected'));
  el.classList.add('selected');
}

function validateOrder() {
  let valid = true;
  const fields = [
    {id:'o-name', err:'e-name', min:2},
    {id:'o-phone', err:'e-phone', min:10},
    {id:'o-city', err:'e-city', min:2},
    {id:'o-addr', err:'e-addr', min:3},
  ];
  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const errEl = document.getElementById(f.err);
    if (!input || !errEl) return;
    const ok = input.value.trim().length >= f.min;
    input.classList.toggle('error', !ok);
    errEl.classList.toggle('show', !ok);
    if (!ok) valid = false;
  });
  return valid;
}

document.addEventListener('DOMContentLoaded', () => {
  const ph = document.getElementById('o-phone');
  if (!ph) return;
  ph.addEventListener('input', function() {
    let v = this.value.replace(/\D/g,'');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) v = '7' + v;
    v = v.slice(0,11);
    let fmt = '+7';
    if (v.length > 1) fmt += ' (' + v.slice(1,4);
    if (v.length >= 4) fmt += ') ' + v.slice(4,7);
    if (v.length >= 7) fmt += '-' + v.slice(7,9);
    if (v.length >= 9) fmt += '-' + v.slice(9,11);
    this.value = fmt;
  });
});

async function submitOrder() {
  if (!validateOrder()) return;
  const cart = getCart();
  if (!cart.length) { showToast('⚠️ Корзина бос!'); return; }

  const btn = document.getElementById('order-submit-btn');
  btn.classList.add('loading'); btn.disabled = true;

  const name  = document.getElementById('o-name').value.trim();
  const phone = document.getElementById('o-phone').value.trim();
  const city  = document.getElementById('o-city').value.trim();
  const addr  = document.getElementById('o-addr').value.trim();
  const sum   = cart.reduce((s,i) => s + (i.price||0)*(i.qty||1), 0);
  const payment = document.querySelector('.payment-opt.selected .payment-label')?.textContent || 'Kaspi';

  // Тапсырысты localStorage-қа сақтау (admin panel үшін)
  try {
    const orders = JSON.parse(localStorage.getItem('mw_orders') || '[]');
    orders.unshift({
      id: Date.now(),
      date: new Date().toLocaleString('ru-KZ'),
      name, phone, city, addr, payment,
      items: cart,
      total: sum,
      status: 'new'
    });
    localStorage.setItem('mw_orders', JSON.stringify(orders));
  } catch(e) { console.log('Order save error:', e); }

  // Telegram хабарлама жіберу
  const itemLines = cart.map(i =>
    `  • ${i.name}${i.size?' ('+i.size+')':''} × ${i.qty||1} — ${((i.price||0)*(i.qty||1)).toLocaleString('ru')} ₸`
  ).join('\n');

  const msgText = `🛒 <b>Жаңа тапсырыс!</b>\n\n` +
    `👤 Аты: ${name}\n📱 Телефон: ${phone}\n🏙 Қала: ${city}\n📍 Мекен-жай: ${addr}\n\n` +
    `📦 <b>Тауарлар:</b>\n${itemLines}\n\n` +
    `💰 <b>Жалпы: ${sum.toLocaleString('ru')} ₸</b>\n` +
    `💳 Төлем: ${payment}\n📅 Күні: ${new Date().toLocaleString('ru-KZ')}`;

  try {
    if (TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
      const resp = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msgText, parse_mode: 'HTML' })
        }
      );
      if (!resp.ok) console.log('Telegram resp error:', await resp.text());
    }
  } catch(e) { console.log('Telegram send error:', e); }

  saveCart([]);
  updateCartUI();
  btn.classList.remove('loading'); btn.disabled = false;
  showPage('thankyou');
}


/* ─────────────────── */


// ══ CATALOG SYSTEM ══
// Деректер products.json-нан алынған
const PRODUCTS = [
  { id:"tee1", name:"ARCHIVE TEE v1.0", price:18000, category:"tshirt", sizes:["S","M","L","XL"], badge:"NEW", img:"", desc:"Базалық оверсайз футболка. Қою мата, 240 г/м²" },
  { id:"hoodie1", name:"VOID HOODIE", price:32000, category:"hoodie", sizes:["S","M","L","XL","XXL"], badge:"", img:"", desc:"Ауыр худи. Кенгуру қалта, капюшон бауымен" },
  { id:"tee2", name:"GLITCH TEE", price:18000, category:"tshirt", sizes:["S","M","L","XL"], badge:"RESTOCK", img:"", desc:"Глитч графика. DTF басып шығару" },
  { id:"sweat1", name:"STATIC SWEATSHIRT", price:22000, category:"sweatshirt", sizes:["S","M","L","XL"], badge:"", img:"", desc:"Ауыр свитшот. Минималистік дизайн" },
  { id:"hoodie2", name:"HEAVY HOODIE", price:25000, category:"hoodie", sizes:["S","M","L","XL","XXL"], badge:"", img:"", desc:"Жоғары сапалы худи. 320 г/м²" },
  { id:"tee3", name:"CHAOS TEE", price:15000, category:"tshirt", sizes:["S","M","L","XL"], badge:"", img:"", desc:"Урбан стиль. Экспресс жеткізу" },
  { id:"tee4", name:"GEOMETRY TEE", price:15000, category:"tshirt", sizes:["S","M","L","XL"], badge:"", img:"", desc:"Геометриялық принт. Таза мата" },
  { id:"sweat2", name:"VOID SWEATSHIRT", price:24000, category:"sweatshirt", sizes:["M","L","XL"], badge:"NEW", img:"", desc:"Қара свитшот. Минимал дизайн" },
  { id:"hoodie3", name:"CHAOS HOODIE", price:28000, category:"hoodie", sizes:["S","M","L","XL"], badge:"", img:"", desc:"Күшті графика, ауыр капюшон" }
];

let catCurrentFilter = 'all';
let catCurrentPage = 1;
const CAT_PER_PAGE = 9;

function setCatFilter(btn) {
  document.querySelectorAll('.cat-filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  catCurrentFilter = btn.dataset.cat;
  catCurrentPage = 1;
  renderCatalog();
}

function filterCatalog() {
  catCurrentPage = 1;
  renderCatalog();
}

function getFilteredProducts() {
  const search = (document.getElementById('cat-search')?.value||'').toLowerCase();
  const sort = document.getElementById('cat-sort')?.value || 'default';
  let products = PRODUCTS.filter(p => {
    const catOk = catCurrentFilter === 'all' || p.category === catCurrentFilter;
    const searchOk = !search || p.name.toLowerCase().includes(search);
    return catOk && searchOk;
  });
  if (sort === 'price_asc') products.sort((a,b)=>a.price-b.price);
  else if (sort === 'price_desc') products.sort((a,b)=>b.price-a.price);
  else if (sort === 'name') products.sort((a,b)=>a.name.localeCompare(b.name));
  return products;
}

function renderCatalog() {
  const skel = document.getElementById('cat-skeleton');
  const grid = document.getElementById('cat-grid');
  const countEl = document.getElementById('cat-count');
  const pagEl = document.getElementById('cat-pagination');
  if (!grid) return;

  if (skel) skel.style.display = 'none';

  const filtered = getFilteredProducts();
  const total = filtered.length;
  const totalPages = Math.ceil(total / CAT_PER_PAGE);
  const start = (catCurrentPage-1)*CAT_PER_PAGE;
  const page = filtered.slice(start, start+CAT_PER_PAGE);

  if (countEl) countEl.textContent = total + ' тауар';

  grid.innerHTML = page.length ? page.map(p => `
    <div class="cat-card" onclick="openProduct('${p.id}')">
      <div class="cat-card-img">
        ${p.img ? `<img src="${p.img}" alt="${p.name}"/>` : `<span class="material-symbols-outlined" style="font-size:48px;color:rgba(255,255,255,0.1)">checkroom</span>`}
        ${p.badge ? `<div class="cat-badge">${p.badge}</div>` : ''}
      </div>
      <div class="cat-card-body">
        <div class="cat-card-name">${p.name}</div>
        <div class="cat-card-bottom">
          <div class="cat-card-price">${p.price.toLocaleString('ru')} ₸</div>
          <button class="cat-add-btn" onclick="event.stopPropagation();addToCart({id:'${p.id}',name:'${p.name}',price:${p.price},size:'M'})">+</button>
        </div>
      </div>
    </div>
  `).join('') : '<div style="grid-column:1/-1;text-align:center;padding:60px;color:rgba(255,255,255,0.2);font-size:14px">Тауар табылмады</div>';

  if (pagEl) {
    pagEl.innerHTML = '';
    for (let i=1;i<=totalPages;i++) {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i===catCurrentPage?' active':'');
      btn.textContent = i;
      btn.onclick = ()=>{ catCurrentPage=i; renderCatalog(); window.scrollTo(0,0); };
      pagEl.appendChild(btn);
    }
  }
}

function openProduct(id) {
  const p = PRODUCTS.find(x=>x.id===id);
  if (!p) return;
  renderProductPage(p);
  showPage('product');
}


/* ─────────────────── */


// ══ PRODUCT PAGE ══
let currentProdDetail = null;
let prodQty = 1;

function renderProductPage(p) {
  currentProdDetail = p;
  selectedSize = p.sizes?.[1] || p.sizes?.[0] || 'M';
  prodQty = 1;
  document.getElementById('prod-name').textContent = p.name;
  document.getElementById('prod-price').textContent = p.price.toLocaleString('ru') + ' ₸';
  document.getElementById('prod-desc').textContent = p.desc || '';
  document.getElementById('prod-qty').textContent = '1';
  const imgWrap = document.getElementById('prod-img-wrap');
  imgWrap.innerHTML = p.img
    ? `<img src="${p.img}" alt="${p.name}"/>`
    : '<span class="material-symbols-outlined" style="font-size:64px;color:rgba(255,255,255,0.1)">checkroom</span>';
  const sizesEl = document.getElementById('prod-sizes');
  sizesEl.innerHTML = (p.sizes||['S','M','L','XL']).map(s=>`
    <button class="prod-size-btn ${s===selectedSize?'active':''}" onclick="selectProdSize(this,'${s}')">${s}</button>
  `).join('');
}

function selectProdSize(btn, size) {
  document.querySelectorAll('.prod-size-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = size;
}

function prodChangeQty(d) {
  prodQty = Math.max(1, prodQty + d);
  document.getElementById('prod-qty').textContent = prodQty;
}

function addProductToCart() {
  if (!currentProdDetail) return;
  addToCart({
    id: currentProdDetail.id,
    name: currentProdDetail.name,
    price: currentProdDetail.price,
    size: selectedSize,
    qty: prodQty,
    img: currentProdDetail.img || ''
  });
}


// ── Init ──
updateCartUI();
