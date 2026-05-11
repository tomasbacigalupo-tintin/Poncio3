/**
 * Poncio — Cinematic Motion System v4
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  const R    = requestAnimationFrame;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rm   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ptr  = window.matchMedia('(pointer: fine)').matches;

  /* ─── Scroll progress + header ──────────────────────────── */
  let sTick = false;
  const onScroll = () => {
    const sy = scrollY;
    const dh = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--sp', `${dh > 0 ? (sy / dh) * 100 : 0}%`);
    root.style.setProperty('--sy', sy);
    document.querySelector('[data-header]')?.classList.toggle('scrolled', sy > 48);
    // hero parallax
    const hp = document.querySelector('.hero-video video.visible');
    if (hp) hp.style.transform = `translateY(${sy * 0.28}px)`;
  };
  window.addEventListener('scroll', () => {
    if (!sTick) { R(() => { onScroll(); sTick = false; }); sTick = true; }
  }, { passive: true });
  onScroll();

  /* ─── Custom cursor (additive) ───────────────────────────── */
  if (ptr && !rm) {
    const dot  = document.querySelector('.c-dot');
    const ring = document.querySelector('.c-ring');
    if (dot && ring) {
      let mx = -200, my = -200, rx = -200, ry = -200;
      dot.style.opacity = ring.style.opacity = '1';
      document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
      document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
      document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });
      const moveCursor = () => {
        dot.style.transform  = `translate(${mx - 3}px,${my - 3}px)`;
        rx = lerp(rx, mx, .09); ry = lerp(ry, my, .09);
        ring.style.transform = `translate(${rx - 20}px,${ry - 20}px)`;
        R(moveCursor);
      };
      R(moveCursor);
      document.querySelectorAll('a,button,[data-c]').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('big'));
        el.addEventListener('mouseleave', () => ring.classList.remove('big'));
      });
    }
  }

  /* ─── Nav ────────────────────────────────────────────────── */
  const tog = document.querySelector('[data-nav-tog]');
  const pan = document.querySelector('[data-nav-pan]');
  if (tog && pan) {
    const set = open => {
      tog.setAttribute('aria-expanded', String(open));
      pan.classList.toggle('open', open);
      body.classList.toggle('nav-open', open);
    };
    tog.addEventListener('click', () => set(tog.getAttribute('aria-expanded') !== 'true'));
    pan.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
    document.addEventListener('click', e => {
      if (!tog.contains(e.target) && !pan.contains(e.target)) set(false);
    });
  }

  /* ─── Smooth anchor scroll ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return; e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 76, behavior: rm ? 'auto' : 'smooth' });
    });
  });

  /* ─── Cinematic reveal system ────────────────────────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -52px 0px' });
  document.querySelectorAll('[data-r],[data-rs]').forEach(el => io.observe(el));

  /* ─── Process line ───────────────────────────────────────── */
  const pt = document.querySelector('[data-proc]');
  if (pt) {
    const po = new IntersectionObserver(en => {
      if (en[0].isIntersecting) { pt.classList.add('in'); po.disconnect(); }
    }, { threshold: .3 });
    po.observe(pt);
  }

  /* ─── Counters ───────────────────────────────────────────── */
  const animN = el => {
    const T = +el.dataset.t || 0, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const dur = rm ? 0 : 2000, t0 = performance.now();
    const tick = now => {
      const p = dur ? clamp((now - t0) / dur, 0, 1) : 1;
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = `${pre}${Math.round(T * e)}${suf}`;
      if (p < 1) R(tick);
    };
    R(tick);
  };
  const co = new IntersectionObserver(en => {
    en.forEach(e => { if (e.isIntersecting) { animN(e.target); co.unobserve(e.target); } });
  }, { threshold: .6 });
  document.querySelectorAll('[data-n]').forEach(el => co.observe(el));

  /* ─── Magnetic elements ──────────────────────────────────── */
  if (ptr && !rm) {
    document.querySelectorAll('[data-mag]').forEach(el => {
      let raf;
      el.addEventListener('pointermove', e => {
        cancelAnimationFrame(raf);
        raf = R(() => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width  / 2) * .2;
          const y = (e.clientY - r.top  - r.height / 2) * .24;
          el.style.transform = `translate3d(${x}px,${y}px,0)`;
        });
      });
      el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); el.style.transform = ''; });
    });

    /* Btn ripple */
    document.querySelectorAll('.btn').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', `${e.clientX - r.left}px`);
        b.style.setProperty('--by', `${e.clientY - r.top}px`);
      });
    });

    /* Tilt cards */
    document.querySelectorAll('[data-tilt]').forEach(card => {
      let raf;
      card.addEventListener('pointermove', e => {
        cancelAnimationFrame(raf);
        raf = R(() => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width  - .5;
          const y = (e.clientY - r.top)  / r.height - .5;
          card.style.transform = `perspective(900px) rotateX(${clamp(-y*5,-5,5)}deg) rotateY(${clamp(x*5,-5,5)}deg) translateY(-4px)`;
        });
      });
      card.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); card.style.transform = ''; });
    });
  }

  /* ─── Marquee duplicate (once) ───────────────────────────── */
  document.querySelectorAll('.mq-track').forEach(t => {
    if (!t.dataset.dup) { t.innerHTML += t.innerHTML; t.dataset.dup = '1'; }
  });

  /* ─── Video autoplay + show ──────────────────────────────── */
  document.querySelectorAll('video').forEach(v => {
    v.classList.add('visible');
    const play = () => v.play().catch(() => {});
    if (v.readyState >= 2) play();
    else v.addEventListener('loadeddata', play, { once: true });
  });

  /* ─── Active section nav ─────────────────────────────────── */
  const ao = new IntersectionObserver(en => {
    en.forEach(e => {
      document.querySelector(`a[href="#${e.target.id}"]`)
        ?.classList.toggle('active', e.isIntersecting);
    });
  }, { rootMargin: '-38% 0px -38% 0px' });
  document.querySelectorAll('section[id]').forEach(s => ao.observe(s));
})();
