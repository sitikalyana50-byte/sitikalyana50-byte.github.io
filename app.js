// Utility: ID + Rupiah
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];
const rupiah = (n) => n.toLocaleString('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0});

// Theme toggle (light/dark)
const themeToggle = $('#themeToggle');
themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
// Restore theme
(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
})();

// Scroll top button
const scrollTopBtn = $('#scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.style.display = window.scrollY > 600 ? 'block' : 'none';
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

// Year
$('#year').textContent = new Date().getFullYear();

// Animated counters
const counters = $$('.stat-num');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.count;
      let cur = 0;
      const step = Math.ceil(target/60);
      const tick = () => {
        cur += step;
        if (cur >= target){ el.textContent = target; return; }
        el.textContent = cur;
        requestAnimationFrame(tick);
      };
      tick();
      obs.unobserve(el);
    }
  });
},{threshold:0.6});
counters.forEach(c=>obs.observe(c));

// Slider
const slides = $('#slides');
const prevBtn = $('.slider .prev');
const nextBtn = $('.slider .next');
const dots = $('#dots');
let current = 0;
const total = $$('.slide', slides).length;

const setSlide = (i) => {
  current = (i + total) % total;
  slides.style.transform = `translateX(-${current*100}%)`;
  // dots
  dots.innerHTML = '';
  for (let d = 0; d < total; d++){
    const b = document.createElement('button');
    if (d === current) b.classList.add('active');
    b.addEventListener('click', () => setSlide(d));
    dots.appendChild(b);
  }
};
prevBtn.addEventListener('click', ()=> setSlide(current-1));
nextBtn.addEventListener('click', ()=> setSlide(current+1));
setInterval(()=> setSlide(current+1), 5000);
setSlide(0);

// Toast
const toast = $('#toast');
function showToast(msg){
  toast.textContent = msg;
  toast.className = 'toast show';
  setTimeout(()=> toast.className = 'toast', 2000);
}

// Store data
const PRODUCTS = [
  {id:'CONSULT30', name:'Konsultasi 30 menit', price:150000, tag:'Klinik'},
  {id:'CONSULT60', name:'Konsultasi 60 menit', price:250000, tag:'Klinik'},
  {id:'USG-ABDOMEN', name:'USG Abdomen', price:350000, tag:'Imaging'},
  {id:'ENDOSKOPI', name:'Endoskopi Diagnostik', price:1200000, tag:'Endoskopi'},
  {id:'KOLO', name:'Kolonoskopi', price:1800000, tag:'Endoskopi'},
  {id:'SURGERY-DAY', name:'Bedah Sehari (Day Surgery)', price:4500000, tag:'Bedah'}
];

// Render products
const productList = $('#productList');
PRODUCTS.forEach(p => {
  const el = document.createElement('article');
  el.className = 'card product hover-lift';
  el.innerHTML = `
    <div class="tag">${p.tag}</div>
    <h3>${p.name}</h3>
    <div class="price">${rupiah(p.price)}</div>
    <div class="actions">
      <button class="btn primary" data-add="${p.id}">Tambah</button>
      <button class="btn ghost" data-info="${p.id}">Detail</button>
    </div>
  `;
  productList.appendChild(el);
});

// Cart
let CART = JSON.parse(localStorage.getItem('cart') || '{}');
const cartCount = $('#cartCount');
const cartItemsEl = $('#cartItems');
const subtotalEl = $('#subtotal');
const feeEl = $('#fee');
const totalEl = $('#total');
const goCheckoutBtn = $('#goCheckout');

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(CART));
}

function cartArray(){ return Object.entries(CART).map(([id, qty]) => {
  const item = PRODUCTS.find(p=>p.id===id);
  return {...item, qty};
});}

function updateCartUI(){
  const items = cartArray();
  // count
  const count = items.reduce((a,b)=> a+b.qty, 0);
  cartCount.textContent = count;
  // list
  cartItemsEl.innerHTML = '';
  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div><strong>${it.name}</strong> <span class="muted">(${it.id})</span></div>
      <div class="qty">
        <button data-dec="${it.id}">−</button>
        <span>${it.qty}</span>
        <button data-inc="${it.id}">+</button>
      </div>
      <div>${rupiah(it.price * it.qty)}</div>
    `;
    cartItemsEl.appendChild(row);
  });
  // totals
  const subtotal = items.reduce((a,b)=> a + b.price*b.qty, 0);
  const fee = subtotal ? Math.max(5000, Math.round(subtotal * 0.02)) : 0;
  const total = subtotal + fee;
  subtotalEl.textContent = rupiah(subtotal);
  feeEl.textContent = rupiah(fee);
  totalEl.textContent = rupiah(total);

  goCheckoutBtn.classList.toggle('disabled', count === 0);
}
updateCartUI();

// Delegation for product buttons
productList.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  const info = e.target.closest('[data-info]');
  if (add){
    const id = add.dataset.add;
    CART[id] = (CART[id] || 0) + 1;
    saveCart(); updateCartUI();
    showToast('Ditambahkan ke keranjang.');
  }
  if (info){
    const id = info.dataset.info;
    const prod = PRODUCTS.find(p=>p.id===id);
    alert(`${prod.name}\nKategori: ${prod.tag}\nHarga: ${rupiah(prod.price)}\n\nKeterangan: Layanan profesional di Klinik Meychan Ki.`);
  }
});

// Inc/Dec in cart
cartItemsEl.addEventListener('click', (e) => {
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  if (inc){
    const id = inc.dataset.inc;
    CART[id] = (CART[id] || 0) + 1;
    saveCart(); updateCartUI();
  }
  if (dec){
    const id = dec.dataset.dec;
    CART[id] = (CART[id] || 0) - 1;
    if (CART[id] <= 0) delete CART[id];
    saveCart(); updateCartUI();
  }
});

// Checkout summary & form
function renderCheckoutSummary(){
  const box = $('#checkoutSummary');
  box.innerHTML = '';
  cartArray().forEach(it => {
    const line = document.createElement('div');
    line.className = 'checkout-line';
    line.innerHTML = `<span>${it.name} x ${it.qty}</span><strong>${rupiah(it.price*it.qty)}</strong>`;
    box.appendChild(line);
  });
  const subtotal = Object.entries(CART).reduce((a,[id,q])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return a + (p ? p.price*q : 0);
  }, 0);
  const fee = subtotal ? Math.max(5000, Math.round(subtotal * 0.02)) : 0;
  const total = subtotal + fee;
  const sep = document.createElement('hr');
  box.appendChild(sep);
  const totalLine = document.createElement('div');
  totalLine.className = 'checkout-line';
  totalLine.innerHTML = `<span>Total</span><strong>${rupiah(total)}</strong>`;
  box.appendChild(totalLine);
}
renderCheckoutSummary();

$('#cartButton').addEventListener('click', ()=> {
  window.location.hash = '#toko';
  showToast('Scroll ke bagian Toko.');
});

$('#checkoutForm').addEventListener('submit', (e)=> {
  e.preventDefault();
  if (Object.keys(CART).length === 0){
    alert('Keranjang kosong. Tambahkan layanan terlebih dahulu.');
    return;
  }
  const data = new FormData(e.target);
  const payload = Object.fromEntries(data.entries());
  const order = {
    id: 'MK-' + Math.random().toString(36).slice(2,8).toUpperCase(),
    items: cartArray(),
    customer: payload,
    date: new Date().toISOString()
  };
  // Simulate server by storing in localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  // Clear cart
  CART = {};
  saveCart(); updateCartUI(); renderCheckoutSummary();
  // Show result
  $('#orderResult').innerHTML = `
    <div class="card">
      <h3>Terima kasih! Kode Pesanan: ${order.id}</h3>
      <p>Kami akan menghubungi via WhatsApp/Email untuk konfirmasi jadwal.</p>
    </div>
  `;
  showToast('Pesanan dikonfirmasi.');
  e.target.reset();
});

// Contact form (fake)
$('#contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  $('#contactResult').textContent = 'Pesan terkirim. Kami akan balas secepatnya.';
});

// Simple reveal on load for elements with .reveal-up present at initial paint
// (already uses CSS animation keyframes; here we just ensure they begin in sequence)
document.addEventListener('DOMContentLoaded', ()=> {
  $$('.reveal-up, .reveal-left').forEach((el, i)=> {
    const delay = el.classList.contains('delay-1') ? 150 : el.classList.contains('delay-2') ? 300 : el.classList.contains('delay-3') ? 450 : 0;
    el.style.animationDelay = (delay/1000)+'s';
  });
});
