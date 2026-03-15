/* ═══════════════════════════════════════════════
   REALTALK — script.js
   Handles: particle canvas, scroll animations,
   counter animations, nav state, code tabs,
   and live chat simulation.
═══════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────
   1. PARTICLE CANVAS BACKGROUND
────────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 80;
  const MAX_DIST = 130;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r:  Math.random() * 1.4 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, randomParticle);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79,195,247,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79,195,247,${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(tick);
  }

  init();
  tick();
  window.addEventListener('resize', () => { resize(); });
})();


/* ──────────────────────────────────────────────
   2. NAVBAR SCROLL STATE
────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNav() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();


/* ──────────────────────────────────────────────
   3. ACTIVE NAV LINK ON SCROLL
────────────────────────────────────────────── */
(function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
})();


/* ──────────────────────────────────────────────
   4. SCROLL REVEAL ANIMATION
────────────────────────────────────────────── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  els.forEach(el => obs.observe(el));
})();


/* ──────────────────────────────────────────────
   5. COUNTER ANIMATION
────────────────────────────────────────────── */
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  function ease(t) { return 1 - Math.pow(1 - t, 3); } // ease-out cubic

  function animateCount(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();

    (function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(ease(t) * target) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(frame);
    })(performance.now());
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => obs.observe(el));
})();


/* ──────────────────────────────────────────────
   6. CODE TABS
────────────────────────────────────────────── */
(function initCodeTabs() {
  const tabs  = document.querySelectorAll('.ctab');
  const panes = document.querySelectorAll('.code-pane');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const pane = document.getElementById('pane-' + target);
      if (pane) pane.classList.add('active');
    });
  });
})();


/* ──────────────────────────────────────────────
   7. LIVE CHAT SIMULATION
────────────────────────────────────────────── */
(function initChatSim() {
  const container = document.getElementById('chatMessages');
  const typingEl  = document.getElementById('chatTyping');
  if (!container || !typingEl) return;

  const newMessages = [
    { initials: 'RK', cls: 'av2', name: 'r_kumar', time: '2:46 PM',
      text: 'Just merged the typing indicator PR. Works perfectly 👌' },
    { initials: 'AL', cls: 'av3', name: 'a_lee',   time: '2:47 PM',
      text: 'Broadcast util is clean. getRoomSize is handy for presence.' },
    { initials: 'JS', cls: 'av1', name: 'jamie_s', time: '2:48 PM',
      text: 'Connection pool holding steady at 100+ users on staging 🔥' },
    { initials: 'RK', cls: 'av2', name: 'r_kumar', time: '2:49 PM',
      text: 'REST history endpoint is fast too. Cache is doing its job.' },
    { initials: 'AL', cls: 'av3', name: 'a_lee',   time: '2:50 PM',
      text: 'Auth middleware tested & approved. Shipping tomorrow 🚀' },
  ];

  let idx = 0;

  function addMessage() {
    if (idx >= newMessages.length) return;
    const m = newMessages[idx++];

    // Show typing
    typingEl.style.display  = 'flex';
    typingEl.querySelector('span').textContent = m.name + ' is typing';

    setTimeout(() => {
      typingEl.style.display = 'none';

      const group = document.createElement('div');
      group.className = 'msg-group';
      group.style.opacity = '0';
      group.style.transform = 'translateY(8px)';
      group.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      group.innerHTML = `
        <div class="msg-avatar ${m.cls}">${m.initials}</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-name">${m.name}</span>
            <span class="msg-time">${m.time}</span>
          </div>
          <div class="msg-text">${m.text}</div>
        </div>`;

      // Remove oldest message if > 5 messages
      const existing = container.querySelectorAll('.msg-group');
      if (existing.length >= 5) {
        const oldest = existing[0];
        oldest.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        oldest.style.opacity = '0';
        oldest.style.transform = 'translateY(-8px)';
        setTimeout(() => oldest.remove(), 250);
      }

      container.insertBefore(group, typingEl);

      // Animate in
      requestAnimationFrame(() => requestAnimationFrame(() => {
        group.style.opacity   = '1';
        group.style.transform = 'translateY(0)';
      }));

    }, 1600);
  }

  // Kick off cycle every 4s
  setTimeout(() => {
    addMessage();
    const interval = setInterval(() => {
      if (idx < newMessages.length) {
        addMessage();
      } else {
        // Loop: reset index, cycle messages again
        idx = 0;
        addMessage();
      }
    }, 4200);
  }, 2800);
})();


/* ──────────────────────────────────────────────
   8. SMOOTH ANCHOR SCROLL
────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = 72; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ──────────────────────────────────────────────
   9. METRIC CARD — SUBTLE TILT ON HOVER
────────────────────────────────────────────── */
(function initTiltCards() {
  const cards = document.querySelectorAll('.metric-card, .feature-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
