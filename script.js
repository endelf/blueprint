const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle(
          'active-nav',
          a.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => observer.observe(s));

const revealEls = document.querySelectorAll(
  '.feature-card, .member-card, .tl-item, .game-layout, .download-box'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = [...entry.target.parentElement.children];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

(function () {
  const canvas = document.getElementById('blueprint-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const ORANGE = 'rgba(240,130,0,';
  const GRID   = 60;

  const PARTICLE_COUNT = 40;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003,
    r: Math.random() * 2 + 1,
    a: Math.random() * 0.5 + 0.1,
  }));

  const shapes = [
    { type: 'rect', x: 0.05, y: 0.1,  w: 0.15, h: 0.25, a: 0.04 },
    { type: 'rect', x: 0.82, y: 0.6,  w: 0.12, h: 0.18, a: 0.04 },
    { type: 'cross', x: 0.7, y: 0.15, s: 0.04, a: 0.06 },
    { type: 'cross', x: 0.25, y: 0.8, s: 0.03, a: 0.05 },
    { type: 'circle', x: 0.88, y: 0.2, r: 0.06, a: 0.04 },
    { type: 'circle', x: 0.12, y: 0.7, r: 0.04, a: 0.04 },
  ];

  let frame = 0;

  function draw() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#080604';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = ORANGE + '0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    ctx.strokeStyle = ORANGE + '0.04)';
    ctx.lineWidth = 1;
    for (let i = -H; i < W + H; i += GRID * 6) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
    }

    shapes.forEach(s => {
      ctx.strokeStyle = ORANGE + s.a + ')';
      ctx.lineWidth = 1;
      if (s.type === 'rect') {
        ctx.strokeRect(s.x * W, s.y * H, s.w * W, s.h * H);
        const x = s.x * W, y = s.y * H, w = s.w * W, h = s.h * H;
        const t = 8;
        ctx.beginPath();
        [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy], i) => {
          const dx = i % 2 === 0 ? t : -t;
          ctx.moveTo(cx, cy - t); ctx.lineTo(cx, cy);
          ctx.moveTo(cx, cy); ctx.lineTo(cx + dx, cy);
        });
        ctx.stroke();
      } else if (s.type === 'cross') {
        const cx = s.x * W, cy = s.y * H, half = s.s * Math.min(W, H);
        ctx.beginPath();
        ctx.moveTo(cx - half, cy); ctx.lineTo(cx + half, cy);
        ctx.moveTo(cx, cy - half); ctx.lineTo(cx, cy + half);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, half * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.type === 'circle') {
        const cx = s.x * W, cy = s.y * H, r = s.r * Math.min(W, H);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r * 1.3, cy); ctx.lineTo(cx - r * 0.6, cy);
        ctx.moveTo(cx + r * 0.6, cy); ctx.lineTo(cx + r * 1.3, cy);
        ctx.moveTo(cx, cy - r * 1.3); ctx.lineTo(cx, cy - r * 0.6);
        ctx.moveTo(cx, cy + r * 0.6); ctx.lineTo(cx, cy + r * 1.3);
        ctx.stroke();
      }
    });

    const scanY = ((frame * 0.4) % (H + 80)) - 40;
    const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
    scanGrad.addColorStop(0,   'rgba(240,130,0,0)');
    scanGrad.addColorStop(0.5, 'rgba(240,130,0,0.07)');
    scanGrad.addColorStop(1,   'rgba(240,130,0,0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 20, W, 40);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1;
      if (p.y > 1) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = ORANGE + p.a + ')';
      ctx.fill();
    });

    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = (particles[i].x - particles[j].x) * W;
        const dy = (particles[i].y - particles[j].y) * H;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = ORANGE + (0.12 * (1 - dist / 120)) + ')';
          ctx.beginPath();
          ctx.moveTo(particles[i].x * W, particles[i].y * H);
          ctx.lineTo(particles[j].x * W, particles[j].y * H);
          ctx.stroke();
        }
      }
    }

    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
    grad.addColorStop(0,   'rgba(240,130,0,0.04)');
    grad.addColorStop(0.5, 'rgba(240,130,0,0.01)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }
  draw();
})();

(function () {
  const versionTabs = document.querySelectorAll('#version-tabs .sel-tab');
  const osTabs      = document.querySelectorAll('#os-tabs .sel-tab');
  const dlFilename  = document.getElementById('dl-filename');
  const dlSize      = document.getElementById('dl-size');
  const dlBadge     = document.getElementById('dl-badge');
  const reqOs       = document.getElementById('req-os');
  const dlBtn       = document.getElementById('dl-btn');

  const osData = {
    windows: {
      filename: 'Blueprint_v1.0_Windows.zip',
      size: '~320 MB',
      req: 'Windows 10/11 (64-bit)',
      badge: 'v1.0 · WIN',
    },
    linux: {
      filename: 'Blueprint_v1.0_Linux.tar.gz',
      size: '~310 MB',
      req: 'Ubuntu 20.04+ / Debian (64-bit)',
      badge: 'v1.0 · LINUX',
    },
  };

  let currentOS = 'windows';

  function updateUI() {
    const d = osData[currentOS];
    dlFilename.textContent = d.filename;
    dlSize.textContent     = d.size;
    dlBadge.textContent    = d.badge;
    reqOs.textContent      = d.req;
  }

  osTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      osTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentOS = tab.dataset.value;
      updateUI();
    });
  });

  versionTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      versionTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  dlBtn.addEventListener('click', () => {
    const originalHTML = dlBtn.innerHTML;
    dlBtn.style.background = 'var(--gold)';
    dlBtn.querySelector('.dl-btn-text').textContent = 'PREPARING...';
    setTimeout(() => {
      dlBtn.querySelector('.dl-btn-text').textContent = 'STARTING DOWNLOAD';
      setTimeout(() => {
        dlBtn.innerHTML = originalHTML;
        dlBtn.style.background = '';
      }, 1500);
    }, 600);
  });

  updateUI();
})();