// =============================================
// HELPMATRIX - Main JavaScript
// =============================================

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

// ---- LOGIN PAGE ----
function initLoginPage() {
  const roleTabs = document.querySelectorAll('.role-tab');
  const authTabs = document.querySelectorAll('.auth-tab');
  const providerFields = document.getElementById('provider-fields');
  const loginFormFields = document.getElementById('login-form-fields');
  const registerFormFields = document.getElementById('register-form-fields');
  const formTitle = document.getElementById('form-title');

  let currentRole = 'consumer';
  let currentAuthMode = 'login';

  function updateView() {
    if (providerFields) {
      providerFields.style.display = (currentRole === 'provider' && currentAuthMode === 'register') ? 'block' : 'none';
    }
    if (loginFormFields && registerFormFields) {
      loginFormFields.style.display = currentAuthMode === 'login' ? 'block' : 'none';
      registerFormFields.style.display = currentAuthMode === 'register' ? 'block' : 'none';
    }
    if (formTitle) {
      const roleLabel = currentRole === 'consumer' ? 'Consumer' : 'Provider';
      formTitle.textContent = currentAuthMode === 'login' ? `${roleLabel} Login` : `${roleLabel} Registration`;
    }
  }

  roleTabs.forEach(tab => {
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
      const btn = loginForm.querySelector('.submit-btn');
      btn.textContent = 'Authenticating...';
      btn.disabled = true;
      setTimeout(() => {
        showToast('Login successful! Welcome to HelpMatrix');
        setTimeout(() => { window.location.href = 'landing.html'; }, 800);
      }, 1200);
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = registerForm.querySelector('.submit-btn');
      btn.textContent = 'Creating Account...';
      btn.disabled = true;
      setTimeout(() => {
        showToast('Account created! Welcome to HelpMatrix');
        setTimeout(() => { window.location.href = 'landing.html'; }, 800);
      }, 1400);
    });
  }

  updateView();
}

// ---- PRODUCT ACTIONS ----
function initProductActions() {
  document.querySelectorAll('.product-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const name = card ? card.querySelector('.product-name').textContent : 'Item';
      showToast(`"${name}" added to your requests!`);
      btn.textContent = 'Requested ✓';
      btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
      btn.disabled = true;
    });
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
  initLoginPage();
  initProductActions();

  // Three.js loads from CDN - try after short delay
  setTimeout(() => {
    if (typeof THREE !== 'undefined') initThreeHero();
    else {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = initThreeHero;
      document.head.appendChild(s);
    }
  }, 500);
});
