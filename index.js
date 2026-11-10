/* ========================================================================
   PABLO MUÑOZ MORCILLO — Author Website
   Interactions
   ======================================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.getElementById('main-nav');

  // ── Navigation: scrolled state + reading progress ───────────────────
  (function initScrollState() {
    const bar = document.getElementById('progress-bar');
    let ticking = false;

    function update() {
      const y = window.scrollY;
      nav.classList.toggle('nav--scrolled', y > 60);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  // ── Navigation: highlight the section in view ───────────────────────
  (function initActiveLink() {
    const links = Array.from(document.querySelectorAll('.nav__link'));
    const byId = {};
    links.forEach(link => { byId[link.getAttribute('href').slice(1)] = link; });
    const sections = Object.keys(byId)
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => link.removeAttribute('aria-current'));
        byId[entry.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
  })();

  // ── Mobile Menu ─────────────────────────────────────────────────────
  (function initMobileMenu() {
    const burger = document.getElementById('nav-burger');
    const menu = document.getElementById('mobile-menu');

    function setOpen(open) {
      burger.classList.toggle('active', open);
      menu.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      document.body.style.overflow = open ? 'hidden' : '';
    }

    burger.addEventListener('click', () => setOpen(!menu.classList.contains('active')));
    menu.querySelectorAll('[data-close-menu]').forEach(link => {
      link.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        setOpen(false);
        burger.focus();
      }
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', e => {
      if (e.matches) setOpen(false);
    });
  })();

  // ── Scroll Reveal ───────────────────────────────────────────────────
  (function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      reveals.forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(el => observer.observe(el));
  })();

  // ── Hero embers (canvas particles) ──────────────────────────────────
  (function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const hero = document.getElementById('inicio');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, particles = [], rafId = null, visible = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.offsetWidth;
      height = hero.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor(width * height / 18000));
      particles = Array.from({ length: count }, () => spawn(true));
    }

    function spawn(anywhere) {
      const crimson = Math.random() > 0.72;
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : height + 10,
        size: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(Math.random() * 0.28 + 0.06),
        alpha: Math.random() * 0.5 + 0.15,
        flicker: Math.random() * 0.02 + 0.006,
        phase: Math.random() * Math.PI * 2,
        color: crimson ? '196, 52, 66' : '214, 180, 112'
      };
    }

    let time = 0;
    function frame() {
      ctx.clearRect(0, 0, width, height);
      time++;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(time * 0.004 + p.phase) * 0.08;
        p.y += p.vy;
        if (p.y < -10 || p.x < -10 || p.x > width + 10) particles[i] = spawn(false);
        const a = p.alpha * (0.55 + 0.45 * Math.sin(time * p.flicker + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + a.toFixed(3) + ')';
        ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    }

    function sync() {
      const shouldRun = visible && !document.hidden && !reduceMotion.matches;
      if (shouldRun && rafId === null) {
        rafId = requestAnimationFrame(frame);
      } else if (!shouldRun && rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', sync);
    reduceMotion.addEventListener('change', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        sync();
      }).observe(hero);
    }
    sync();
  })();

  // ── Lightbox ────────────────────────────────────────────────────────
  (function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const counter = document.getElementById('lightbox-counter');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const items = Array.from(document.querySelectorAll('[data-lightbox]'));
    let index = 0;
    let lastFocus = null;

    function show(i) {
      index = (i + items.length) % items.length;
      const item = items[index];
      const thumb = item.querySelector('img');
      img.classList.remove('is-loaded');
      img.onload = () => img.classList.add('is-loaded');
      img.src = item.dataset.full || thumb.src;
      img.alt = thumb.alt;
      caption.textContent = item.dataset.caption || '';
      counter.textContent = (index + 1) + ' / ' + items.length;
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    items.forEach((item, i) => item.addEventListener('click', () => open(i)));
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
      else if (e.key === 'Tab') {
        // Keep keyboard focus inside the dialog
        const focusables = [closeBtn, prevBtn, nextBtn];
        const pos = focusables.indexOf(document.activeElement);
        e.preventDefault();
        const next = e.shiftKey
          ? (pos <= 0 ? focusables.length - 1 : pos - 1)
          : (pos + 1) % focusables.length;
        focusables[next].focus();
      }
    });

    // Swipe on touch devices
    let startX = null;
    lightbox.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  })();

  // ── Back to Top ─────────────────────────────────────────────────────
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  // ── Footer year ─────────────────────────────────────────────────────
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  // ── Contact Form ────────────────────────────────────────────────────
  // With a data-endpoint on the form (Formspree, etc.) the message is really
  // sent. Without one, the form only shows the confirmation (demo behaviour).
  (function initContactForm() {
    const form = document.getElementById('contact-form');
    const btn = document.getElementById('contact-submit');
    const label = btn.querySelector('.btn__label');
    const status = document.getElementById('contact-status');
    const idleText = label.textContent;

    function finish(ok) {
      btn.classList.remove('is-loading');
      btn.classList.toggle('is-success', ok);
      label.textContent = ok ? '¡Mensaje enviado!' : idleText;
      status.textContent = ok
        ? 'Gracias por escribir. Te responderé lo antes posible.'
        : 'No se ha podido enviar el mensaje. Inténtalo de nuevo en unos minutos.';
      status.classList.toggle('is-error', !ok);
      if (ok) form.reset();
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('is-success');
        label.textContent = idleText;
      }, ok ? 3000 : 0);
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      btn.disabled = true;
      btn.classList.add('is-loading');
      label.textContent = 'Enviando…';
      status.textContent = '';

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        setTimeout(() => finish(true), 600);
        return;
      }
      fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(res => finish(res.ok))
        .catch(() => finish(false));
    });
  })();
})();
