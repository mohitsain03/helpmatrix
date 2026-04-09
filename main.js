// =============================================
// HELPMATRIX - Main JavaScript
// =============================================

// ---- API CONFIG ----
const API_BASE = (window.location.port !== '3000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'))
  ? 'http://localhost:3000'
  : '';

// ---- PARTICLES CANVAS ----
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '59,130,246' : '6,182,212';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    animId = requestAnimationFrame(loop);
  }
  loop();
}

// ---- THREE.JS HERO (loaded from CDN) ----
function initThreeHero() {
  const container = document.getElementById('three-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 1000);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Icosahedron wireframe
  const geo = new THREE.IcosahedronGeometry(3, 1);
  const mat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, opacity: 0.3, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Floating spheres
  const spheres = [];
  const colors = [0x3b82f6, 0x06b6d4, 0xef4444, 0x8b5cf6];
  for (let i = 0; i < 12; i++) {
    const sg = new THREE.SphereGeometry(0.12 + Math.random() * 0.15, 8, 8);
    const sm = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], opacity: 0.7, transparent: true });
    const s = new THREE.Mesh(sg, sm);
    s.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6);
    s._speed = { x: (Math.random() - 0.5) * 0.005, y: (Math.random() - 0.5) * 0.005 };
    scene.add(s);
    spheres.push(s);
  }

  let mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.002;
    mesh.rotation.y += 0.003;
    mesh.rotation.x += (mouse.y * 0.3 - mesh.rotation.x) * 0.02;
    mesh.rotation.y += (mouse.x * 0.3 - mesh.rotation.y) * 0.02;
    spheres.forEach(s => {
      s.position.x += s._speed.x;
      s.position.y += s._speed.y;
      if (Math.abs(s.position.x) > 6) s._speed.x *= -1;
      if (Math.abs(s.position.y) > 5) s._speed.y *= -1;
    });
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
}

// ---- NAVBAR ----
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const hamburger = nav.querySelector('.hamburger');
  const links = nav.querySelector('.nav-links');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
  if (hamburger && links) {
    hamburger.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// ---- SCROLL REVEAL ----
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ---- BACK TO TOP ----
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- TOAST ----
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = type === 'error'
    ? 'linear-gradient(135deg,#ef4444,#dc2626)'
    : 'linear-gradient(135deg,#3b82f6,#06b6d4)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---- COUNTER ANIMATION ----
function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '';
    let current = 0;
    const step = target / 60;
    const update = () => {
      current = Math.min(current + step, target);
      counter.textContent = Math.floor(current).toLocaleString() + suffix;
      if (current < target) requestAnimationFrame(update);
    };
    update();
  });
}

function initCounters() {
  const section = document.querySelector('.stats-bar');
  if (!section) return;
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
  }, { threshold: 0.5 });
  obs.observe(section);
}

// ---- MODAL ----
function initModals() {
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const id = trigger.getAttribute('data-modal');
      const modal = document.getElementById(id);
      if (modal) modal.classList.add('active');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  });
}

// ---- AUTHENTICATION & SESSION ----
function initAuth() {
  const userStr = localStorage.getItem('helpmatrix_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const navLinks = document.getElementById('nav-links');
      if (navLinks) {
        // Find Login button
        const loginBtn = navLinks.querySelector('a[href="login.html"]');
        if (loginBtn) {
          const li = loginBtn.parentElement;
          const role = (user.role || '').toLowerCase();
          const dashUrl = role === 'provider' ? 'provider-dashboard.html' : 'dashboard.html';
          li.innerHTML = `<a href="${dashUrl}" class="nav-cta" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6);">Dashboard</a>`;
          
          const logoutLi = document.createElement('li');
          logoutLi.innerHTML = `<a href="#" id="nav-logout" style="color:var(--accent-red);font-weight:600;text-decoration:none;">Logout</a>`;
          navLinks.appendChild(logoutLi);

          document.getElementById('nav-logout').addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('helpmatrix_user');
            window.location.href = 'index.html';
          });
        }
      }
    } catch (e) {
      console.warn("Invalid user data in storage, clearing it.");
      localStorage.removeItem('helpmatrix_user');
    }
  }
}

// ---- LOGIN & REGISTER PAGE ----
function initLoginPage() {
  const roleTabs = document.querySelectorAll('.role-tab');
  const authTabs = document.querySelectorAll('.auth-tab');
  const providerFields = document.getElementById('provider-fields');
  const loginFormFields = document.getElementById('login-form-fields');
  const registerFormFields = document.getElementById('register-form-fields');
  const formTitle = document.getElementById('form-title');

  let currentRole = 'consumer';
  let currentAuthMode = 'login';

  // Check URL params for provider
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('provider') === 'true') {
    currentRole = 'provider';
  }

  function updateView() {
    if (providerFields) providerFields.style.display = (currentRole === 'provider' && currentAuthMode === 'register') ? 'block' : 'none';
    if (loginFormFields) loginFormFields.style.display = currentAuthMode === 'login' ? 'block' : 'none';
    if (registerFormFields) registerFormFields.style.display = currentAuthMode === 'register' ? 'block' : 'none';
    if (formTitle) {
      const roleLabel = currentRole === 'consumer' ? 'Consumer' : 'Provider';
      formTitle.textContent = currentAuthMode === 'login' ? `${roleLabel} Login` : `${roleLabel} Registration`;
    }
  }

  roleTabs.forEach(tab => {
    if (tab.getAttribute('data-role') === currentRole) tab.classList.add('active');
    else tab.classList.remove('active');

    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRole = tab.getAttribute('data-role');
      updateView();
    });
  });

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentAuthMode = tab.getAttribute('data-auth');
      updateView();
    });
  });

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const mobileInput = document.getElementById('login-mobile');
      const passwordInput = document.getElementById('login-password');
      const mobile = mobileInput ? mobileInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!mobile || !password) {
        showToast('Please enter mobile number and password.', 'error');
        return;
      }

      const btn = loginForm.querySelector('.submit-btn');
      btn.textContent = 'Authenticating...';
      btn.disabled = true;

    fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password, role: currentRole })
      })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          showToast(data.error || 'Login failed', 'error');
          btn.textContent = 'Login';
          btn.disabled = false;
          return;
        }
        localStorage.setItem('helpmatrix_user', JSON.stringify(data.user));
        showToast('Login successful! Welcome back.');
        setTimeout(() => { 
          const role = (data.user.role || '').toLowerCase();
          window.location.href = role === 'provider' ? 'provider-dashboard.html' : 'index.html'; 
        }, 800);
      })
      .catch(err => {
        console.error('Login error:', err);
        if (err.message === 'Failed to fetch') {
          showToast('Could not connect to server. Please ensure the backend is running.', 'error');
        } else {
          showToast('An unexpected error occurred during login.', 'error');
        }
        btn.textContent = 'Login';
        btn.disabled = false;
      });
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('reg-name');
      const mobileInput = document.getElementById('reg-mobile');
      const addressInput = document.getElementById('reg-address');
      const passwordInput = document.getElementById('reg-password');

      const name = nameInput ? nameInput.value.trim() : 'New User';
      const mobile = mobileInput ? mobileInput.value.trim() : '';
      const address = addressInput ? addressInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const category = document.getElementById('reg-category')?.value || '';
      const org = document.getElementById('reg-org')?.value || '';

      if (mobile.length < 10) {
        showToast('Please enter a valid mobile number (min 10 digits).', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }

      const btn = registerForm.querySelector('.submit-btn');
      btn.textContent = 'Creating Account...';
      btn.disabled = true;

      fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, address, password, role: currentRole, category, org })
      })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          showToast(data.error || 'Registration failed', 'error');
          btn.textContent = 'Create Account';
          btn.disabled = false;
          return;
        }
        localStorage.setItem('helpmatrix_user', JSON.stringify({ name, role: currentRole, mobile }));
        showToast('Account created! Welcome to HelpMatrix');
        setTimeout(() => { 
          const role = (currentRole || '').toLowerCase();
          window.location.href = role === 'provider' ? 'provider-dashboard.html' : 'index.html'; 
        }, 800);
      })
      .catch(err => {
        console.error('Registration error:', err);
        if (err.message === 'Failed to fetch') {
          showToast('Could not connect to server. Please ensure the backend is running.', 'error');
        } else {
          showToast('An unexpected error occurred during registration.', 'error');
        }
        btn.textContent = 'Create Account';
        btn.disabled = false;
      });
    });
  }

  if (roleTabs.length > 0) updateView();
}

// ---- PRODUCT REQUEST (CHECKOUT WORKFLOW) ----
let currentRequestItemName = '';
let currentRequestItemPrice = '0';
let currentRequestItemProvider = '';
let currentRequestItemCategory = '';
// ---- DYNAMIC PRODUCT LOADING ----
async function loadCategoryItems() {
  const container = document.querySelector('[data-ocid="products.list"]');
  if (!container) return;

  // Identify category from title or URL
  const title = document.title.split('-')[1]?.trim().toLowerCase();
  const categoryMap = {
    'electronics': 'electronics',
    'clothing': 'clothing',
    'household workers': 'household',
    'aadhaar services': 'aadhaar',
    'blood bank': 'blood-bank',
    'emergency helpline': 'emergency'
  };
  const category = categoryMap[title] || 'electronics';

  try {
    const res = await fetch(`${API_BASE}/api/items/${category}`);
    const data = await res.json();
    if (data.success && data.items) {
      renderProducts(container, data.items, category);
    }
  } catch (err) {
    console.error('Error loading items:', err);
  }
}

function renderProducts(container, items, category) {
  container.innerHTML = '';
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-ocid', `products.item.${index + 1}`);
    if (item.providerMobile) card.setAttribute('data-provider', item.providerMobile);

    const badgeHtml = item.badge ? `<span class="product-badge ${item.isUrgent ? 'urgent' : ''}">${item.badge}</span>` : '';
    const actionBtnText = item.actionType === 'call' ? `Call ${item.actionValue}` : (category === 'aadhaar' ? 'Book' : (category === 'household' ? 'Book' : 'Request'));
    const actionAttr = item.actionType === 'call' ? `href="tel:${item.actionValue}"` : '';
    const actionClass = item.actionType === 'call' ? 'product-action-btn call-btn' : 'product-action-btn';

    card.innerHTML = `
      ${badgeHtml}
      <div class="product-img-wrap"><img src="${item.image}" alt="${item.name}"/></div>
      <div class="product-body">
        <div class="product-name">${item.name}</div>
        <div class="product-meta">${item.meta}</div>
        <div class="product-tags">${item.tags.map(t => `<span class="product-tag">${t}</span>`).join('')}</div>
        <div class="product-footer">
          <div class="product-price ${item.price === 'FREE Borrow' || item.price === 'FREE' ? 'free' : ''}">${item.price}</div>
          <button class="${actionClass}" data-ocid="products.item.${index + 1}.button" ${actionAttr}>${actionBtnText}</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Re-initialize product actions for new buttons
  initProductActions();
}

function initProductActions() {
  const modal = document.getElementById('checkout-modal');
  
  document.querySelectorAll('.product-action-btn, .btn-primary, .btn-danger, .btn-secondary').forEach(btn => {
    // Only intercept if it resembles a purchase/request button (not generic links)
    const text = btn.textContent.toLowerCase();
    if (btn.classList.contains('product-action-btn') || text.includes('request') || text.includes('book') || text.includes('borrow')) {
      // Don't intercept auth buttons
      if (btn.closest('form')) return;

      btn.addEventListener('click', (e) => {
        const user = localStorage.getItem('helpmatrix_user');
        
        // If it's a login link disguised as a button, handle differently
        if (btn.tagName.toLowerCase() === 'a' && btn.getAttribute('href') === 'login.html') {
          if (!user) return; // allow normal navigation
          else {
            e.preventDefault(); // stop navigation to login, open modal instead
          }
        } else {
          e.preventDefault();
        }

        if (!user) {
          showToast('Please login to request items!', 'error');
          setTimeout(() => window.location.href = 'login.html', 1500);
          return;
        }

        const card = btn.closest('.product-card') || btn.closest('.category-hero-content');
        currentRequestItemName = card ? (card.querySelector('.product-name')?.textContent || card.querySelector('.category-hero-title')?.textContent || 'Emergency Request') : 'Requested Service';
        
        // Extract price, provider and category
        const priceEl = card ? card.querySelector('.product-price') : null;
        const priceText = priceEl ? priceEl.textContent.replace('FREE', '0').replace('₹', '').replace(',', '').trim() : '0';
        currentRequestItemPrice = priceText;
        currentRequestItemProvider = card ? (card.getAttribute('data-provider') || 'Not Assigned') : 'Not Assigned';

        // Detect Category from Page Title
        const pageTitle = document.title.split('-')[1]?.trim() || 'General';
        currentRequestItemCategory = pageTitle;

        if (modal) {
          document.getElementById('checkout-item-name').textContent = currentRequestItemName;
          modal.classList.add('active');
        } else {
          submitMockOrder(currentRequestItemName, "Default Address");
        }
      });
    }
  });

  if (modal) {
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    const closeBtnText = modal.querySelector('.btn-secondary');
    const form = document.getElementById('checkout-form');
    
    const closeModal = () => {
      modal.classList.remove('active');
      if (form) {
        form.reset();
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) { submitBtn.textContent = 'Confirm Request'; submitBtn.disabled = false; }
      }
    };

    if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnText) closeBtnText.addEventListener('click', closeModal);
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const address = document.getElementById('checkout-address').value;
        const urgency = document.getElementById('checkout-urgency').value;
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        setTimeout(() => submitMockOrder(currentRequestItemName, address, urgency, currentRequestItemPrice, currentRequestItemProvider, currentRequestItemCategory), 1200);
      });
    }
  }
}

function submitMockOrder(itemName, address, urgency = 'Normal', price = '0', provider = '', category = 'General') {
  const userStr = localStorage.getItem('helpmatrix_user');
  let userMobile = 'Unknown';
  if (userStr) {
    try { userMobile = JSON.parse(userStr).mobile || 'Unknown'; } catch(e){}
  }

  const orderId = 'HM-' + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: orderId,
    userMobile: userMobile,
    item: itemName,
    address: address,
    urgency: urgency,
    status: 'Pending',
    category: category,
    date: new Date().toLocaleDateString(),
    price: price,
    providerMobile: provider
  };
  
  fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOrder)
  })
  .then(res => res.json())
  .then(data => {
    sessionStorage.setItem('helpmatrix_last_order', JSON.stringify(newOrder));
    window.location.href = 'confirmation.html';
  })
  .catch(err => {
    showToast('Failed to submit order to database', 'error');
    console.error(err);
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavbar();
  initReveal();
  initBackToTop();
  initCounters();
  initModals();
  initAuth(); // NEW
  initLoginPage();
  initProductActions();
  loadCategoryItems(); // Load items dynamically if on category page

  setTimeout(() => {
    if (typeof THREE !== 'undefined') initThreeHero();
  }, 500);
});
