/* Rent House Milano — animazioni demo
   - sipario di caricamento e transizione tra pagine
   - smooth scroll (Lenis) + parallasse sulle foto
   - effetto typing sul titolo principale
   - comparsa dei testi allo scroll
   - caroselli trascinabili, FAQ, header dinamico */

(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth <= 900;

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    window.lenis = lenis;
  }

  /* ---------- Titoli divisi in righe ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines
      .map((l, i) => `<span class="line"><span class="line-inner" style="--i:${i}">${l.trim()}</span></span>`)
      .join('');
  });

  /* ---------- Liste a cascata: indice per il ritardo ---------- */
  document.querySelectorAll('[data-stagger]').forEach((el) => {
    [...el.children].forEach((c, i) => c.style.setProperty('--i', i));
  });

  /* ---------- Effetto typing ---------- */
  const typeEl = document.querySelector('.js-type');
  let typeChars = [];
  let caret = null;
  if (typeEl) {
    const lines = typeEl.dataset.type.split('|');
    typeEl.setAttribute('aria-label', lines.join(' '));
    typeEl.innerHTML = lines
      .map((line) => [...line].map((ch) => `<span class="ch" aria-hidden="true">${ch === ' ' ? '&nbsp;' : ch}</span>`).join(''))
      .join('<br>');
    typeChars = [...typeEl.querySelectorAll('.ch')];
    caret = document.createElement('span');
    caret.className = 'type-caret';
    caret.setAttribute('aria-hidden', 'true');
    typeEl.prepend(caret);
  }

  function runTyping() {
    if (!typeEl) return;
    if (reduceMotion) {
      typeChars.forEach((c) => c.classList.add('on'));
      typeChars[typeChars.length - 1].after(caret);
      return;
    }
    caret.classList.add('is-typing');
    let i = 0;
    const step = () => {
      const c = typeChars[i];
      c.classList.add('on');
      c.after(caret);
      i++;
      if (i < typeChars.length) {
        const next = typeChars[i].previousSibling?.nodeName === 'BR' ? 260 : 0;
        setTimeout(step, 55 + Math.random() * 55 + next);
      } else {
        caret.classList.remove('is-typing');
      }
    };
    setTimeout(step, 150);
  }

  /* ---------- Comparsa allo scroll ----------
     Controllo a ogni frame con getBoundingClientRect: a differenza di
     IntersectionObserver ignora il clip-path delle foto ancora "chiuse"
     e funziona anche per le card fuori schermo nei caroselli orizzontali. */
  let pending = [];
  function startReveal() {
    pending = [...document.querySelectorAll('[data-reveal], [data-split], [data-stagger]')];
  }
  function checkReveal() {
    if (!pending.length) return;
    const vh = innerHeight;
    const vw = innerWidth;
    // in fondo alla pagina gli ultimi elementi non arrivano mai all'88%: basta che siano visibili
    const atBottom = scrollY + vh >= document.documentElement.scrollHeight - 4;
    const limit = atBottom ? vh : vh * 0.88;
    pending = pending.filter((el) => {
      const r = el.getBoundingClientRect();
      const visible = r.top < limit && r.bottom > 0 && r.left < vw && r.right > 0;
      if (visible) el.classList.add('is-in');
      return !visible;
    });
  }

  /* ---------- Parallasse ---------- */
  const inner = [...document.querySelectorAll('[data-parallax]')].map((img) => ({
    img,
    box: img.closest('.media') || img.parentElement,
    k: parseFloat(img.dataset.parallax) || 1,
  }));
  const floats = [...document.querySelectorAll('[data-float]')].map((el) => ({ el, k: parseFloat(el.dataset.float) || 0 }));
  const hscroll = [...document.querySelectorAll('[data-hscroll]')].map((el) => ({ el, k: parseFloat(el.dataset.hscroll) || 0 }));

  // progresso -1 (sotto la viewport) … 0 (al centro) … 1 (sopra)
  const progress = (r, vh) => {
    const p = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
    return Math.max(-1.2, Math.min(1.2, p));
  };

  let lastY = -1;
  let lastW = innerWidth;
  function updateParallax(force) {
    const y = scrollY;
    if (!force && y === lastY) return;
    lastY = y;
    if (reduceMotion) return;
    const vh = innerHeight;
    const unit = isMobile() ? 0.35 : innerWidth / 1920;

    inner.forEach(({ img, box, k }) => {
      const r = box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      img.style.translate = `0 ${(progress(r, vh) * 0.09 * r.height * k).toFixed(2)}px`;
    });
    floats.forEach(({ el, k }) => {
      if (isMobile()) { el.style.translate = ''; return; }
      const r = el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      el.style.translate = `0 ${(-progress(r, vh) * k * unit).toFixed(2)}px`;
    });
    hscroll.forEach(({ el, k }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      el.style.transform = `translate3d(${(progress(r, vh) * -k * unit).toFixed(2)}px,0,0)`;
    });
  }

  /* ---------- Header ---------- */
  const header = document.querySelector('.site-header');
  let prevY = 0;
  function updateHeader() {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const goingDown = y > prevY + 2;
    const goingUp = y < prevY - 2;
    if (goingDown && y > 500 && !root.classList.contains('nav-open')) header.classList.add('is-hidden');
    else if (goingUp || y < 200) header.classList.remove('is-hidden');
    prevY = y;
  }

  document.querySelector('.burger')?.addEventListener('click', () => root.classList.toggle('nav-open'));

  /* ---------- Loop ---------- */
  function frame(t) {
    lenis?.raf(t);
    if (innerWidth !== lastW) { lastW = innerWidth; updateParallax(true); }
    updateParallax(false);
    updateHeader();
    checkReveal();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Caroselli trascinabili ---------- */
  document.querySelectorAll('.rail').forEach((rail) => {
    let down = false, startX = 0, startLeft = 0, moved = 0, vel = 0, lastX = 0, raf = 0;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = lastX = e.clientX; startLeft = rail.scrollLeft; vel = 0;
      cancelAnimationFrame(raf);
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) rail.classList.add('is-dragging');
      vel = e.clientX - lastX; lastX = e.clientX;
      rail.scrollLeft = startLeft - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      setTimeout(() => rail.classList.remove('is-dragging'), 0);
      // inerzia
      const glide = () => {
        vel *= 0.94;
        rail.scrollLeft -= vel;
        if (Math.abs(vel) > 0.4) raf = requestAnimationFrame(glide);
      };
      raf = requestAnimationFrame(glide);
    });
    rail.addEventListener('click', (e) => { if (moved > 5) e.preventDefault(); }, true);
    rail.addEventListener('dragstart', (e) => e.preventDefault());
  });

  document.querySelectorAll('[data-gallery]').forEach((g) => {
    const rail = g.querySelector('.rail');
    const by = () => rail.clientWidth * 0.6;
    g.querySelector('.g-arrow--prev')?.addEventListener('click', () => rail.scrollBy({ left: -by(), behavior: 'smooth' }));
    g.querySelector('.g-arrow--next')?.addEventListener('click', () => rail.scrollBy({ left: by(), behavior: 'smooth' }));
  });

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- Sipario: ingresso e transizione tra pagine ---------- */
  const curtain = document.querySelector('.curtain');
  function lift() {
    if (!curtain || reduceMotion) { startReveal(); runTyping(); return; }
    curtain.classList.add('is-logo');
    setTimeout(() => {
      curtain.classList.add('is-up');
      setTimeout(() => { startReveal(); runTyping(); }, 350);
    }, 650);
  }
  if (document.readyState === 'complete') lift();
  else addEventListener('load', lift, { once: true });
  // se la pagina torna dalla cache del browser (tasto indietro) il sipario va rialzato
  addEventListener('pageshow', (e) => {
    if (e.persisted && curtain) { curtain.classList.remove('is-down', 'is-logo'); curtain.classList.add('is-up'); }
  });

  // ancore interne: scroll morbido fino alla sezione
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('href').length > 1 && document.querySelector(a.getAttribute('href'));
      e.preventDefault();
      root.classList.remove('nav-open');
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.6 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || a.target === '_blank') return;
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || reduceMotion || !curtain) return;
      e.preventDefault();
      curtain.classList.remove('is-up', 'is-logo');
      curtain.classList.add('is-down');
      void curtain.offsetHeight;
      curtain.classList.remove('is-down');
      setTimeout(() => (location.href = href), 750);
    });
  });
})();
