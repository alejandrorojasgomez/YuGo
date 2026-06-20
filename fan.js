/* ============================================================
   YüGO+  ·  Carrusel "fan" de productos
   Porteado de card-fan-carousel (React+GSAP) a vanilla JS.
   Mismo efecto: abanico, hover con empuje de vecinos y
   entrada con rebote elástico.
   ============================================================ */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;           // GSAP no cargó (sin internet)
  const layout = document.getElementById('fanLayout');
  if (!layout) return;

  const cards = Array.from(layout.querySelectorAll('.fan-card'));
  const n = cards.length;
  if (!n) return;

  const center = (n - 1) / 2;                         // fan simétrico
  const SPREAD_X = 18.5;                              // separación horizontal (rem)
  const SPREAD_Y = 4.5;                               // caída vertical de los extremos
  const MAX_ROT  = 17;                                // inclinación de los extremos (deg)

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mult() {
    const w = window.innerWidth;
    if (w < 480) return 0.42;
    if (w < 640) return 0.55;
    if (w < 768) return 0.70;
    if (w < 1024) return 0.85;
    return 1.0;
  }

  // Posición base (en reposo) de cada carta según su índice
  function base(i) {
    const d = center === 0 ? 0 : (i - center) / center;   // -1 … 1
    const ad = Math.abs(d);
    let z = 10 - Math.round(ad * 4);
    // Orden de capas explícito: Natural al frente, Frutos detrás
    const name = cards[i].dataset.name || '';
    if (name === 'Yogurt Natural') z = 15;
    else if (name === 'Frutos Rojos') z = 7;
    return {
      x: d * SPREAD_X * mult(),
      y: ad * ad * SPREAD_Y,
      rot: d * MAX_ROT,
      scale: 1 - 0.18 * ad * ad,
      z: z,
    };
  }

  // Centrado base: todas parten del centro del contenedor
  cards.forEach((c) => gsap.set(c, { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' }));

  let entered = false;
  let active = null;

  function place(i, vars, extra) {
    const b = base(i);
    gsap.to(cards[i], Object.assign({
      x: b.x + 'rem', y: b.y + 'rem', rotation: b.rot, scale: b.scale,
    }, vars));
    gsap.set(cards[i], { zIndex: (extra && extra.z) || b.z });
  }

  // Layout en reposo (sin animar o con animación breve, p.ej. al hacer resize)
  function rest(animate) {
    cards.forEach((c, i) => {
      const b = base(i);
      gsap.to(c, {
        x: b.x + 'rem', y: b.y + 'rem', rotation: b.rot, scale: b.scale, opacity: 1,
        duration: animate ? 0.5 : 0, ease: 'power3.out', overwrite: 'auto',
      });
      gsap.set(c, { zIndex: b.z });
    });
  }

  // Animación de entrada (rebote elástico, escalonada)
  function entry() {
    if (reduce) { rest(false); entered = true; return; }
    cards.forEach((c, i) => {
      const b = base(i);
      gsap.set(c, { x: 0, y: '8rem', rotation: 0, scale: 0.6, opacity: 0, zIndex: b.z });
      gsap.to(c, {
        x: b.x + 'rem', y: b.y + 'rem', rotation: b.rot, scale: b.scale, opacity: 1,
        duration: 1.1, ease: 'elastic.out(1.05,.78)', delay: 0.15 + i * 0.08,
      });
    });
    setTimeout(() => { entered = true; }, 1300);
  }

  // Reacción al hover: levanta la carta y empuja a las vecinas
  function hover(hi) {
    cards.forEach((c, i) => {
      const b = base(i);
      let x = b.x, y = b.y, rot = b.rot, scale = b.scale;

      if (hi !== null) {
        if (i === hi) {
          y -= 2.4;
          scale *= 1.12;
        } else {
          const dist = Math.abs(i - hi);
          const push = (2.6 * mult()) / dist;
          scale *= 0.9;                       // resto encoge → resalta el activo
          if (i < hi) { x -= push; rot -= 2 / dist; }
          else        { x += push; rot += 2 / dist; }
        }
      }

      gsap.to(c, {
        x: x + 'rem', y: y + 'rem', rotation: rot, scale: scale,
        duration: 0.5, ease: 'elastic.out(1,.75)', overwrite: 'auto',
      });
      gsap.set(c, { zIndex: i === hi ? 20 : b.z });
    });
  }

  /* ---- Panel dinámico de info ---- */
  const panel = document.getElementById('productPanel');
  const ppTag = document.getElementById('ppTag');
  const ppName = document.getElementById('ppName');
  const ppDesc = document.getElementById('ppDesc');
  const ppPrice = document.getElementById('ppPrice');
  const section = document.getElementById('products');

  function updatePanel(i) {
    const d = cards[i].dataset;
    if (!ppName) return;
    panel.style.opacity = '0';
    setTimeout(() => {
      ppTag.textContent = d.tag;
      ppName.textContent = d.name;
      ppDesc.textContent = d.desc;
      ppPrice.textContent = d.price;
      panel.style.opacity = '1';
    }, 140);
  }

  function tint(i) {
    section.style.backgroundColor = cards[i].dataset.pink ? 'var(--hover-pink)' : 'var(--hover-blue)';
  }

  // Índice de la card destacada por defecto (Yogurt Natural)
  let featured = cards.findIndex((c) => c.dataset.name === 'Yogurt Natural');
  if (featured < 0) featured = Math.round(center);

  /* ---- Modo móvil: una carta a la vez con flechas ---- */
  const mq = window.matchMedia('(max-width: 767px)');
  let isMobile = mq.matches;
  let activeIndex = featured;                // arranca en "El favorito"
  const prevBtn = document.getElementById('fanPrev');
  const nextBtn = document.getElementById('fanNext');

  function showMobile(idx, animate) {
    cards.forEach((c, i) => {
      const on = i === idx;
      gsap.to(c, {
        x: 0, y: 0, rotation: 0, scale: on ? 1 : 0.86, opacity: on ? 1 : 0,
        duration: animate ? 0.4 : 0, ease: 'power3.out', overwrite: 'auto',
      });
      gsap.set(c, { zIndex: on ? 10 : 1 });
    });
    updatePanel(idx);
  }

  function go(step) {
    activeIndex = (activeIndex + step + n) % n;
    showMobile(activeIndex, true);
  }
  if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(1));

  // En móvil no esperamos al IntersectionObserver: mostramos ya la card
  // destacada para que la sección nunca aparezca vacía.
  if (isMobile) showMobile(activeIndex, false);

  /* ---- Eventos de hover por carta (solo desktop) ---- */
  cards.forEach((c, i) => {
    c.addEventListener('mouseenter', () => {
      if (!entered || isMobile) return;
      active = i;
      hover(i);
      updatePanel(i);
      tint(i);
    });
  });
  layout.addEventListener('mouseleave', () => {
    if (!entered || isMobile) return;
    active = null;
    hover(null);
    section.style.backgroundColor = '';
    updatePanel(featured);                   // el panel vuelve a Yogurt Natural
  });

  /* ---- Entrada al hacer scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (isMobile) { showMobile(activeIndex, true); entered = true; }
        else { entry(); }
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });
  io.observe(layout);

  /* ---- Resize / cambio de modo ---- */
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const nowMobile = mq.matches;
      if (nowMobile !== isMobile) {
        isMobile = nowMobile;
        section.style.backgroundColor = '';
        active = null;
        if (isMobile) showMobile(activeIndex, false);
        else rest(false);
      } else if (entered) {
        if (isMobile) showMobile(activeIndex, false);
        else (active === null ? rest(false) : hover(active));
      }
    }, 140);
  }, { passive: true });
})();
