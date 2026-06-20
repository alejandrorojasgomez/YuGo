/* ============================================================
   YüGO+  ·  Interacciones
   ============================================================ */
(function () {
  'use strict';

  /* ---- 1. Nav: sombra al hacer scroll + menú móvil ---- */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  const ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? ICON_X : ICON_MENU;
  });
  // Cerrar menú al hacer clic en un enlace
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = ICON_MENU;
    })
  );

  /* ---- 2. Reveal genérico (beneficios, timeline) ---- */
  const reveals = document.querySelectorAll('.reveal');
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), (i % 4) * 90);
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  reveals.forEach((r) => revObs.observe(r));

  /* ---- 3. FAQ acordeón (solo uno abierto) ---- */
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- 6. Formulario B2B (mock) ---- */
  const form = document.getElementById('b2bForm');
  const ok = document.getElementById('formOk');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      ok.classList.add('show');
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset();
      setTimeout(() => ok.classList.remove('show'), 6000);
    });
  }

  /* ---- 7. Parallax suave de los elementos flotantes del hero ---- */
  const floats = document.querySelectorAll('.floaty');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && floats.length) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      floats.forEach((f, i) => {
        const depth = (i + 1) * 8;
        f.style.translate = `${x * depth}px ${y * depth}px`;
      });
    }, { passive: true });
  }
})();
