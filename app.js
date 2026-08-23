/* ================================================================
   DAKSHATA BHOLE PORTFOLIO — Interaction Engine
   ================================================================ */

(function () {
  'use strict';

  if (typeof renderShowcases === 'function') {
    renderShowcases();
  }

  /* ── Scroll reveal (including dynamic cards) ─────────────── */
  function observeReveal(elements) {
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('on'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
    elements.forEach(el => {
      if (!el.classList.contains('on')) obs.observe(el);
    });
  }

  observeReveal(document.querySelectorAll('.r'));

  /* ── Scroll position preservation ─────────────────────────── */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const SCROLL_KEY = 'portfolio-scroll-y';
  let scrollSaveTimer;

  addEventListener('scroll', () => {
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(() => {
      sessionStorage.setItem(SCROLL_KEY, String(scrollY));
    }, 120);
  }, { passive: true });

  addEventListener('DOMContentLoaded', () => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved && !location.hash) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: Number(saved), behavior: 'instant' in window ? 'instant' : 'auto' });
      });
    }

    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  });

  addEventListener('beforeunload', () => {
    sessionStorage.setItem(SCROLL_KEY, String(scrollY));
  });

  /* ── Ambient particles ───────────────────────────────────── */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = [];
      const count = Math.min(45, Math.floor(W * H / 22000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1 + 0.25,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.1,
          a: Math.random() * 0.25 + 0.06
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 210, 255, ${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }

    resize();
    initParticles();
    drawParticles();
    window.addEventListener('resize', () => { resize(); initParticles(); }, { passive: true });
  }

  /* ── Cursor — instant 1:1 tracking ──────────────────────── */
  const dot = document.getElementById('curDot');

  if (dot && matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      dot.style.transform = `translate3d(${e.clientX - 3.5}px, ${e.clientY - 3.5}px, 0)`;
    }, { passive: true });
  }

  /* ── Navbar pin ──────────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('pinned', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Ambient parallax ────────────────────────────────────── */
  const orbs = document.querySelectorAll('.ambient-orb');
  const heroLight = document.querySelector('.hero-light');
  const heroBgMontage = document.querySelector('.hero-bg-montage');

  if (orbs.length || heroLight || heroBgMontage) {
    let parallaxTick = false;
    addEventListener('scroll', () => {
      if (parallaxTick) return;
      parallaxTick = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        orbs.forEach((orb, i) => {
          orb.style.transform = `translate3d(0, ${y * (0.03 + i * 0.02)}px, 0)`;
        });
        if (heroLight) heroLight.style.transform = `translate3d(0, ${y * 0.05}px, 0)`;
        if (heroBgMontage) heroBgMontage.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
        parallaxTick = false;
      });
    }, { passive: true });
  }

  /* ── Scroll reveal handled above via observeReveal ───────── */

  /* ── Hero parallax ───────────────────────────────────────── */
  const heroNameBlock = document.querySelector('.hero-name-block');
  if (heroNameBlock) {
    let headlineTick = false;
    addEventListener('scroll', () => {
      if (headlineTick) return;
      headlineTick = true;
      requestAnimationFrame(() => {
        heroNameBlock.style.transform = `translate3d(0, ${scrollY * 0.1}px, 0)`;
        headlineTick = false;
      });
    }, { passive: true });
  }


  /* ── Horizontal rails — entire section scrolls on wheel ─── */
  function smoothScrollRail(rail, delta) {
    rail.scrollBy({ left: delta, behavior: 'smooth' });
  }

  document.querySelectorAll('.rail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const rail = document.querySelector(`[data-rail="${target}"]`);
      if (!rail) return;
      const amount = rail.clientWidth * 0.75;
      smoothScrollRail(rail, btn.classList.contains('rail-btn--prev') ? -amount : amount);
    });
  });

  function railScrollLimits(rail) {
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    return { max, atStart: rail.scrollLeft <= 1, atEnd: rail.scrollLeft >= max - 1 };
  }

  document.querySelectorAll('.showcase').forEach(showcase => {
    const rail = showcase.querySelector('.rail-track');
    if (!rail) return;

    /* Click and drag on rail track */
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    rail.addEventListener('mousedown', e => {
      isDragging = true;
      rail.classList.add('is-dragging');
      startX = e.pageX;
      scrollLeft = rail.scrollLeft;
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      rail.scrollLeft = scrollLeft - (e.pageX - startX);
    }, { passive: true });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      rail.classList.remove('is-dragging');
    });
  });

  /* Wheel → horizontal scroll ONLY while hovering a video card */
  let activeCard = null;

  function bindCardWheelScroll() {
    document.querySelectorAll('.edit-card[data-src]').forEach(card => {
      card.addEventListener('mouseenter', () => { activeCard = card; });
      card.addEventListener('mouseleave', () => {
        if (activeCard === card) activeCard = null;
      });
    });
  }

  document.addEventListener('wheel', e => {
    if (!activeCard) return;

    const rail = activeCard.closest('.rail-track');
    if (!rail) return;

    const { atStart, atEnd } = railScrollLimits(rail);
    const deltaY = e.deltaY;
    const deltaX = e.deltaX;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 1) {
      if (!((deltaX > 0 && atEnd) || (deltaX < 0 && atStart))) {
        e.preventDefault();
        rail.scrollLeft += deltaX;
      }
      return;
    }

    if (Math.abs(deltaY) < 1) return;

    if (deltaY > 0 && !atEnd) {
      e.preventDefault();
      rail.scrollLeft += deltaY;
    } else if (deltaY < 0 && !atStart) {
      e.preventDefault();
      rail.scrollLeft += deltaY;
    }
  }, { passive: false, capture: true });

  /* ── Thumbnail fallback + hover preview ──────────────────── */
  const thumbExtensions = ['png', 'jpeg', 'jfif', 'jpg', 'webp'];

  function mediaParts(src) {
    try {
      const url = new URL(src, location.href);
      const decoded = decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:)/, '$1');
      const parts = decoded.split('/').filter(Boolean);
      const portoIndex = parts.findIndex(part => part.toLowerCase() === 'porto');
      if (portoIndex === -1 || parts.length < portoIndex + 3) return null;
      return { category: parts[portoIndex + 1], baseName: parts[parts.length - 1].replace(/\.[^.]+$/, '') };
    } catch (_) {
      return null;
    }
  }

  function tryThumb(img, category, baseName, index = 0) {
    if (!img || index >= thumbExtensions.length) return;
    const bust = `?v=${Date.now()}`;
    const src = `file:///E:/porto/${encodeURIComponent(category)}/${encodeURIComponent(`${baseName}.${thumbExtensions[index]}`)}${bust}`;
    const probe = new Image();
    probe.onload = () => { img.src = src; };
    probe.onerror = () => tryThumb(img, category, baseName, index + 1);
    probe.src = src;
  }

  function thumbStartIndex(img) {
    const ext = img.getAttribute('src')?.split('.').pop()?.split('?')[0]?.toLowerCase();
    const idx = thumbExtensions.indexOf(ext);
    return idx >= 0 ? idx : 0;
  }

  function initEditCards() {
    document.querySelectorAll('.edit-card[data-src]').forEach(card => {
      const src = card.dataset.src;
      const parts = mediaParts(src);
      const thumb = card.querySelector('.edit-card-thumb');
      if (parts && thumb) {
        tryThumb(thumb, parts.category, parts.baseName, thumbStartIndex(thumb));
      }

      if (matchMedia('(pointer: coarse)').matches) return;

      const preview = document.createElement('video');
      preview.className = 'edit-card-preview';
      preview.src = src;
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.preload = 'metadata';
      preview.setAttribute('aria-hidden', 'true');
      card.querySelector('.edit-card-media')?.appendChild(preview);

      card.addEventListener('mouseenter', () => {
        preview.play()
          .then(() => card.classList.add('is-previewing'))
          .catch(() => {});
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-previewing');
        preview.pause();
        preview.currentTime = 0;
      });
    });
  }

  initEditCards();
  bindCardWheelScroll();

  /* ── Video modal ─────────────────────────────────────────── */
  const modal = document.getElementById('modal');
  const modalVid = document.getElementById('modalVid');
  const closeBtn = document.getElementById('modalClose');

  function openModal(src) {
    if (!modal || !modalVid) return;
    modalVid.src = src;
    modalVid.load();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalVid.play().catch(() => {}), 150);
  }

  window.openPortfolioVideo = openModal;

  function closeModal() {
    if (!modal || !modalVid) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modalVid.pause(); modalVid.src = ''; }, 400);
  }

  document.querySelectorAll('.edit-card[data-src]').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.src;
      if (src) openModal(src);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const src = card.dataset.src;
        if (src) openModal(src);
      }
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  modal?.querySelector('.modal-scrim')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── Contact form ────────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      form.style.transition = 'opacity 0.4s ease';
      form.style.opacity = '0';
      setTimeout(() => {
        form.style.display = 'none';
        if (success) {
          success.style.display = 'block';
          success.style.opacity = '0';
          success.style.transition = 'opacity 0.4s ease';
          requestAnimationFrame(() => { success.style.opacity = '1'; });
        }
      }, 400);
    });
  }

})();
