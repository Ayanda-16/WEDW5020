/* =========================================================
   Queen-Spa — Main JavaScript (consolidated, bug-fixed)
   ========================================================= */

'use strict';

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Cursor glow ---------- */
function initCursorGlow() {
  const glow = $('#cursorGlow');
  if (!glow) return;
  if (prefersReduced()) { glow.style.display = 'none'; return; }

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX, currentY = targetY, rafId = null;
  const lerp = (a, b, t) => a + (b - a) * t;

  function animate() {
    currentX = lerp(currentX, targetX, 0.15);
    currentY = lerp(currentY, targetY, 0.15);
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    if (Math.abs(currentX - targetX) > 0.1 ||
        Math.abs(currentY - targetY) > 0.1) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(animate);
  });

  document.addEventListener('touchstart',
    () => { glow.style.display = 'none'; }, { passive: true });
}

/* ---------- 2. Sticky header shadow ---------- */
function initHeaderScroll() {
  const header = $('#siteHeader') || $('header');
  if (!header) return;
  const onScroll = () => {
    header.style.boxShadow = window.scrollY > 8
      ? '0 8px 24px rgba(92,57,55,0.08)'
      : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- 3. Tilt effect ---------- */
function initTiltCards() {
  if (prefersReduced()) return;
  if (window.matchMedia('(hover: none)').matches) return;

  $$('.tilt-card').forEach((card) => {
    const strength = 6;
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('reveal') &&
          !card.classList.contains('is-visible')) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * strength;
      const rotateX = ((y / rect.height) - 0.5) * -strength;
      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.boxShadow = '0 22px 40px rgba(92,57,55,0.12)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

/* ---------- 4. Smooth scroll ---------- */
function initSmoothScroll() {
  if (prefersReduced()) return;
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ---------- 5. Reveal on scroll ---------- */
function initRevealOnScroll() {
  if (!('IntersectionObserver' in window)) return;
  const targets = $$(
    '.card, .cta-banner, .hero-image-card, section img, ' +
    '.grid-2 > *, .grid-3 > *, .grid-4 > *, .contact-card, .gallery-card'
  );
  if (!targets.length) return;
  targets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => observer.observe(el));
}

/* ---------- 6. Animated counters ---------- */
function initCounters() {
  const counters = $$('.stat-card strong, [data-counter]');
  if (!counters.length) return;

  const parseTarget = (text) => {
    const match = text.match(/[\d,.]+/);
    if (!match) return null;
    return {
      value: parseFloat(match[0].replace(/,/g, '')),
      suffix: text.replace(match[0], '').trim(),
    };
  };

  const animateCounter = (el) => {
    const target = parseTarget(el.textContent);
    if (!target) return;
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.min(
        Math.round(target.value * eased),
        target.value
      );
      el.textContent = `${current.toLocaleString()}${target.suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => observer.observe(el));
}

/* ---------- 7. Gallery / service filters ---------- */
function initGalleryFilters() {
  const buttons = $$('[data-filter]');
  const items   = $$('[data-category]');
  if (!buttons.length || !items.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      items.forEach((item) => {
        const show = filter === 'all' ||
                     item.dataset.category === filter;
        item.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ---------- 8. Contact form validation (+ mailto fallback) ---------- */
function initContactForm() {
  const form = document.querySelector('.form-card form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = $('#name', form);
    const email   = $('#email', form);
    const message = $('#message', form);
    const errors  = [];

    if (!name?.value.trim()) errors.push('Please enter your name.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
      errors.push('Please enter a valid email address.');
    if (!message?.value.trim()) errors.push('Please add a short message.');

    form.querySelector('.form-feedback')?.remove();

    if (errors.length) {
      const box = document.createElement('div');
      box.className = 'form-feedback is-error';
      box.setAttribute('role', 'alert');
      box.textContent = errors.join(' ');
      form.prepend(box);
      const firstInvalid = form.querySelector('input:invalid, textarea:invalid') || name;
      firstInvalid?.focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    // If the form has a real (non-placeholder) endpoint, POST to it.
    // Otherwise, gracefully fall back to opening the user's mail client.
    const action = form.getAttribute('action') || '';
    const isPlaceholder =
      !action ||
      action === '#' ||
      action.includes('your-form-id');

    if (isPlaceholder) {
      const subject = encodeURIComponent(
        'Spa appointment request from ' + name.value.trim()
      );
      const body = encodeURIComponent(
        `Name: ${name.value.trim()}\n` +
        `Email: ${email.value.trim()}\n` +
        `Preferred date/time: ${$('#subject', form)?.value.trim() || '—'}\n\n` +
        message.value.trim()
      );
      window.location.href =
        `mailto:hello@queen-spa.co.za?subject=${subject}&body=${body}`;

      const box = document.createElement('div');
      box.className = 'form-feedback is-success';
      box.setAttribute('role', 'status');
      box.innerHTML = `Thank you, <strong>${name.value.trim()}</strong>! Your email app should open shortly with your request. If not, email us at <a href="mailto:hello@queen-spa.co.za">hello@queen-spa.co.za</a>.`;
      form.prepend(box);
      form.reset();
      setTimeout(() => box.remove(), 8000);
      btn.disabled = false;
      btn.textContent = original;
      return;
    }

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Network error');

      const box = document.createElement('div');
      box.className = 'form-feedback is-success';
      box.setAttribute('role', 'status');
      box.innerHTML = `Thank you, <strong>${name.value.trim()}</strong>! Your request has been received. We'll be in touch shortly.`;
      form.prepend(box);
      form.reset();
      setTimeout(() => box.remove(), 6000);
    } catch {
      const box = document.createElement('div');
      box.className = 'form-feedback is-error';
      box.setAttribute('role', 'alert');
      box.textContent = 'Something went wrong. Please email us directly at hello@queen-spa.co.za.';
      form.prepend(box);
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

/* ---------- 9. Footer year ---------- */
function initFooterYear() {
  const yearEl = document.querySelector('.year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- 10. Active nav fallback ---------- */
function initActiveNav() {
  const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-links a').forEach((link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href === path) {
      $$('.nav-links a').forEach((a) => {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      });
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ---------- 11. Mobile navigation ---------- */
function initMobileNav() {
  const header = document.querySelector('#siteHeader');
  const nav    = document.querySelector('.nav-links');
  if (!header || !nav) return;

  if (!document.querySelector('.nav-toggle')) {
    const btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'primary-nav');
    btn.innerHTML = '<span></span><span></span><span></span>';
    if (!nav.id) nav.id = 'primary-nav';
    header.querySelector('.nav-wrap').insertBefore(btn, nav);

    btn.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && window.matchMedia('(max-width: 768px)').matches) {
        header.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }
}

/* ---------- 12. Image error fallback ---------- */
function initImageFallbacks() {
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';
      img.style.background = 'linear-gradient(135deg, #f7f0eb, #fff5ef)';
      img.style.objectFit = 'cover';
      img.alt = img.alt || 'Queen-Spa image';
    }, { once: true });
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initHeaderScroll();
  initTiltCards();
  initSmoothScroll();
  initRevealOnScroll();
  initCounters();
  initGalleryFilters();
  initContactForm();
  initFooterYear();
  initActiveNav();
  initMobileNav();
  initImageFallbacks();
});