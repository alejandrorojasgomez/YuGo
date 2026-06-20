/* ============================================================
   YüGO+  ·  Testimonios "stagger" (FORMATO 2)
   Porteado de stagger-testimonials (React) a vanilla JS.
   Cards persistentes → transiciones suaves (slide + fade)
   con manejo de wrap-around para evitar saltos.
   ============================================================ */
(function () {
  'use strict';

  const root = document.getElementById('staggerTestimonials');
  if (!root) return;

  const testimonials = [
    { stars: '★★★★★', quote: 'El griego es otra cosa. Lo compré para un postre y me lo comí solo, a cucharadas, sin culpa. Adiós marcas de supermercado.', by: 'Valentina M. — Cali, cliente desde 2024', initial: 'V' },
    { stars: '★★★★★', quote: 'Soy diabético y poder comer algo dulce con stevia y sin azúcar añadida me cambió el desayuno. Gracias, YüGO+.', by: 'Jorge R. — Cali, pedido recurrente', initial: 'J' },
    { stars: '★★★★★', quote: 'El de frutos rojos sabe a fruta de verdad, no a colorante. Mis hijos lo piden todos los días y yo feliz porque es sano.', by: 'Diana P. — Mamá team YüGO+', initial: 'D' },
    { stars: '★★★★★', quote: 'Pedí kumis por nostalgia y me transportó a la casa de mi abuela. Cremoso, en su punto. 10/10 lo vuelvo a pedir.', by: 'Andrés C. — Convertido oficial', initial: 'A' },
    { stars: '★★★★★', quote: 'Lo llevo a mi cafetería y los clientes preguntan de quién es. Calidad artesanal real, no de etiqueta bonita.', by: 'María F. — Aliada mayorista', initial: 'M' },
  ];

  const half = Math.floor(testimonials.length / 2);
  let cardSize = window.matchMedia('(min-width: 640px)').matches ? 340 : 280;

  // order[slot] = índice de testimonio en ese slot. El centro es slot = half.
  let order = testimonials.map((_, i) => i);

  // Crear las cards UNA sola vez (persistentes)
  const els = testimonials.map((t) => {
    const card = document.createElement('div');
    card.className = 'st-card';
    card.innerHTML =
      '<div class="st-stars">' + t.stars + '</div>' +
      '<div class="st-avatar">' + t.initial + '</div>' +
      '<p class="st-quote">"' + t.quote + '"</p>' +
      '<p class="st-by">— ' + t.by + '</p>';
    root.appendChild(card);
    return card;
  });

  function styleFor(p) {
    const ap = Math.abs(p);
    return {
      transform:
        'translate(-50%, -50%)' +
        ' translateX(' + (cardSize / 1.5) * p + 'px)' +
        ' translateY(' + (p === 0 ? -40 : (Math.abs(p) % 2 ? 16 : -16)) + 'px)' +
        ' rotate(' + (p === 0 ? 0 : (p % 2 ? 2.5 : -2.5)) + 'deg)' +
        ' scale(' + (p === 0 ? 1 : 0.94) + ')',
      opacity: p === 0 ? 1 : ap === 1 ? 0.92 : ap === 2 ? 0.5 : 0,
      z: p === 0 ? 10 : 6 - ap,
      center: p === 0,
    };
  }

  function apply(el, s) {
    el.style.width = cardSize + 'px';
    el.style.height = cardSize + 'px';
    el.style.transform = s.transform;
    el.style.opacity = s.opacity;
    el.style.zIndex = s.z;
    el.classList.toggle('is-center', s.center);
  }

  // Posición actual de cada card (para detectar wrap-around)
  const curPos = new Array(els.length).fill(0);

  function paintInitial() {
    order.forEach((ti, slot) => {
      const p = slot - half;
      curPos[ti] = p;
      const el = els[ti];
      el.style.transition = 'none';
      apply(el, styleFor(p));
    });
    void root.offsetWidth;                    // reflow
    els.forEach((el) => { el.style.transition = ''; });
  }

  function move(steps) {
    if (!steps) return;
    if (steps > 0) { for (let i = 0; i < steps; i++) order.push(order.shift()); }
    else { for (let i = 0; i < -steps; i++) order.unshift(order.pop()); }

    const wraps = [];
    order.forEach((ti, slot) => {
      const np = slot - half;
      const op = curPos[ti];
      const el = els[ti];
      const s = styleFor(np);
      curPos[ti] = np;

      if (Math.abs(np - op) > 1) {
        // wrap: la card saltaría de un extremo al otro → reubicar invisible y hacer fade-in
        el.style.transition = 'none';
        apply(el, Object.assign({}, s, { opacity: 0 }));
        wraps.push({ el: el, op: s.opacity });
      } else {
        apply(el, s);                         // slide normal (la transición CSS anima)
      }
    });

    if (wraps.length) {
      void root.offsetWidth;                  // reflow para fijar la posición sin animar
      requestAnimationFrame(() => {
        wraps.forEach((w) => { w.el.style.transition = ''; w.el.style.opacity = w.op; });
      });
    }
  }

  // Click en una card lateral → la trae al centro
  els.forEach((el, ti) => {
    el.addEventListener('click', () => move(curPos[ti]));
  });

  const prev = document.getElementById('stPrev');
  const next = document.getElementById('stNext');
  if (prev) prev.addEventListener('click', () => move(-1));
  if (next) next.addEventListener('click', () => move(1));

  // Responsive
  const mq = window.matchMedia('(min-width: 640px)');
  const onChange = (e) => { cardSize = e.matches ? 340 : 280; paintInitial(); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);

  paintInitial();
})();
