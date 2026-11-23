/* =========================================================
   O Menino que Descobriu o Vento — interações
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };

  /* ---------- Modo edição (?editar mostra o nome dos arquivos de foto) ---------- */
  if (/[?&]editar\b/.test(location.search)) document.body.classList.add('edit-mode');
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- Título letra por letra ---------- */
  $$('.split').forEach((el) => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let i = 0;
    const frag = document.createDocumentFragment();
    [...el.childNodes].forEach((node) => {
      if (node.nodeType !== 3) { frag.appendChild(node.cloneNode(true)); return; }
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'word'; w.setAttribute('aria-hidden', 'true');
        [...part].forEach((ch) => {
          const c = document.createElement('span');
          c.className = 'char'; c.textContent = ch; c.style.setProperty('--i', i++);
          w.appendChild(c);
        });
        frag.appendChild(w);
      });
    });
    el.textContent = ''; el.appendChild(frag);
  });

  /* ---------- Atraso em cascata ---------- */
  $$('.stagger').forEach((g) => {
    [...g.children].forEach((c, i) => c.style.setProperty('--d', (i * 0.1).toFixed(2) + 's'));
  });

  /* ---------- Revelar ao rolar ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .wipe').forEach((el) => revealIO.observe(el));

  /* ---------- Plantações (comparador) ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  $$('.rows').forEach((g) => {
    const type = g.dataset.plant;
    const rows = [132, 152, 178, 210, 248];
    rows.forEach((y, r) => {
      const s = 0.42 + r * 0.24;
      const step = 26 * s * 1.25;
      const off = (r % 2) * step / 2 - 6;
      for (let x = off; x < 410; x += step) {
        const u = document.createElementNS(NS, 'use');
        u.setAttribute('href', '#' + type);
        const jitter = type === 'dry' ? (Math.sin(x * 7 + r) * 8) : 0;
        u.setAttribute('transform', `translate(${x.toFixed(1)} ${y}) scale(${s.toFixed(2)}) rotate(${jitter.toFixed(1)})`);
        g.appendChild(u);
      }
    });
  });

  /* ---------- Comparador antes/depois ---------- */
  const compare = $('#compare');
  if (compare) {
    const range = $('.compare-range', compare);
    const set = (pct) => {
      pct = clamp(pct, 0, 100);
      compare.style.setProperty('--pos', pct + '%');
      range.value = pct;
    };
    let dragging = false, startX = 0, startY = 0, decided = false;
    const pctFrom = (x) => { const r = compare.getBoundingClientRect(); return ((x - r.left) / r.width) * 100; };
    compare.addEventListener('pointerdown', (e) => {
      dragging = true; decided = e.pointerType === 'mouse'; startX = e.clientX; startY = e.clientY;
      compare.classList.add('touched');
      if (decided) { compare.setPointerCapture(e.pointerId); set(pctFrom(e.clientX)); }
    });
    compare.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      if (!decided) {
        const dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { dragging = false; return; } // é rolagem vertical
        decided = true; compare.setPointerCapture(e.pointerId);
      }
      set(pctFrom(e.clientX));
    });
    const end = (e) => {
      if (dragging && !decided && e.type === 'pointerup') set(pctFrom(e.clientX)); // toque simples
      dragging = false;
    };
    compare.addEventListener('pointerup', end);
    compare.addEventListener('pointercancel', () => { dragging = false; });
    range.addEventListener('input', () => set(+range.value));
  }

  /* ---------- Cartões que viram ---------- */
  $$('.flip').forEach((b) => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    vibrate(8);
  }));

  /* ---------- Livro ---------- */
  const book = $('#book');
  if (book) book.addEventListener('click', () => {
    const open = book.classList.toggle('open');
    book.setAttribute('aria-pressed', open);
    book.setAttribute('aria-label', open ? 'Fechar o livro' : 'Abrir o livro');
    vibrate(10);
  });

  /* ---------- Carrosséis com bolinhas ---------- */
  $$('.carousel').forEach((c) => {
    const track = $('.track', c), dots = $('.dots', c);
    const items = [...track.children];
    items.forEach(() => dots.appendChild(document.createElement('i')));
    const update = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestD = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - center);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (track.scrollLeft < 8) best = 0;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) best = items.length - 1;
      [...dots.children].forEach((d, i) => d.classList.toggle('on', i === best));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  });

  /* ---------- Fotos: placeholder + ampliar ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('img', lightbox);
  $$('.photo').forEach((fig) => {
    const img = $('img', fig);
    if (!img) return;
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fig.classList.add('empty');
    img.addEventListener('error', () => fig.classList.add('empty'));
    fig.addEventListener('click', () => {
      if (fig.classList.contains('empty')) return;
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
      lightbox.hidden = false;
    });
  });
  const closeLb = () => { lightbox.hidden = true; lbImg.removeAttribute('src'); };
  lightbox.addEventListener('click', closeLb);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLb(); closeSheet(); } });

  /* ---------- Equipe: iniciais automáticas ---------- */
  $$('.people li').forEach((li) => {
    const name = (li.firstChild && li.firstChild.nodeType === 3 ? li.firstChild.textContent : li.textContent).trim();
    const words = name.split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w));
    const ini = ((words[0] || name)[0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
    let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    const av = document.createElement('span');
    av.className = 'avatar'; av.textContent = ini; av.setAttribute('aria-hidden', 'true');
    av.style.setProperty('--h', h);
    const txt = document.createElement('span');
    while (li.firstChild) txt.appendChild(li.firstChild);
    li.append(av, txt);
  });

  /* ---------- Capítulos: botão flutuante e menu ---------- */
  const pill = $('#pill'), pillText = $('#pillText'), sheet = $('#sheet');
  const sections = $$('[data-title]');
  const links = $$('.sheet-list a');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      pillText.textContent = e.target.dataset.title;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => sectionIO.observe(s));

  function openSheet() { sheet.hidden = false; pill.setAttribute('aria-expanded', 'true'); }
  function closeSheet() { sheet.hidden = true; pill.setAttribute('aria-expanded', 'false'); }
  pill.addEventListener('click', () => (sheet.hidden ? openSheet() : closeSheet()));
  sheet.addEventListener('click', (e) => { if (e.target === sheet || e.target.closest('a')) closeSheet(); });

  /* ---------- Final: a lâmpada acende ---------- */
  const night = $('#final');
  if (night) new IntersectionObserver((entries, io) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { setTimeout(() => night.classList.add('lit'), 350); io.disconnect(); }
    });
  }, { threshold: 0.3 }).observe(night);

  /* ---------- Rolagem: progresso, paralaxe e o vento da página ---------- */
  const bar = $('.progress span');
  const hero = $('.hero');
  const heroContent = $('.hero-content');
  const heroRotor = $('.hero-rotor');
  const pillRotor = $('.pill-rotor g');
  const parallax = $$('[data-speed]');
  let lastY = scrollY, scrollVel = 0, angle = 0, lastT = performance.now(), dirty = true;

  addEventListener('scroll', () => { dirty = true; }, { passive: true });
  addEventListener('resize', () => { dirty = true; });

  function frame(t) {
    const dt = Math.min(64, t - lastT); lastT = t;
    const y = scrollY, vh = innerHeight;

    // velocidade da rolagem vira "vento"
    const dy = y - lastY; lastY = y;
    scrollVel = scrollVel * 0.9 + Math.abs(dy) * 0.1;
    if (!reduceMotion) {
      angle = (angle + (0.06 + Math.min(scrollVel, 60) * 0.05) * dt) % 360;
      if (y < vh * 1.2) heroRotor.style.transform = `rotate(${angle}deg)`;
      pillRotor.style.transform = `rotate(${angle}deg)`;
    }

    if (dirty) {
      dirty = false;
      const max = document.documentElement.scrollHeight - vh;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      pill.classList.toggle('show', y > vh * 0.55);

      if (!reduceMotion) {
        if (y < vh * 1.2) {
          const p = clamp(y / (hero.offsetHeight || vh), 0, 1);
          heroContent.style.transform = `translateY(${-p * 70}px)`;
          heroContent.style.opacity = String(1 - p * 1.3);
        }
        parallax.forEach((el) => {
          const r = el.parentElement.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
          el.style.transform = `translateY(${offset.toFixed(1)}px)`;
        });
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Jogo: gire o moinho ---------- */
  const game = $('#game');
  if (game) {
    const svg = $('.game-svg', game);
    const rotor = $('.g-rotor', game);
    const hit = $('#hit');
    const fill = $('#meterFill');
    const status = $('#gameStatus');
    const wonMsg = $('.won-msg', game);
    const windBtn = $('#windBtn');
    const resetBtn = $('#resetBtn');

    const MAX_OMEGA = 0.8;   // graus por ms considerados "energia máxima"
    let rot = 0, omega = 0, energy = 0, growth = 0;
    let dragging = false, lastA = 0, lastMoveT = 0, moved = 0;
    let wind = false, won = false, running = false, prevT = 0, lastStatus = '';

    const angleAt = (x, y) => {
      const r = hit.getBoundingClientRect();
      return Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180 / Math.PI;
    };

    hit.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      hit.setPointerCapture(e.pointerId);
      dragging = true; moved = 0;
      lastA = angleAt(e.clientX, e.clientY); lastMoveT = performance.now();
      game.classList.add('used');
      start();
    });
    hit.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const a = angleAt(e.clientX, e.clientY), now = performance.now();
      let d = a - lastA; if (d > 180) d -= 360; if (d < -180) d += 360;
      const dt = Math.max(1, now - lastMoveT);
      rot += d; moved += Math.abs(d);
      omega = omega * 0.55 + clamp(d / dt, -1.6, 1.6) * 0.45;
      lastA = a; lastMoveT = now;
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      if (moved < 4) omega += (omega >= 0 ? 1 : -1) * 0.35; // toque = empurrãozinho
    };
    hit.addEventListener('pointerup', release);
    hit.addEventListener('pointercancel', release);

    const windOn = (e) => { e.preventDefault(); wind = true; windBtn.classList.add('pressing'); game.classList.add('used'); start(); };
    const windOff = () => { wind = false; windBtn.classList.remove('pressing'); };
    windBtn.addEventListener('pointerdown', windOn);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => windBtn.addEventListener(ev, windOff));
    windBtn.addEventListener('contextmenu', (e) => e.preventDefault());
    windBtn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) windOn(e); });
    windBtn.addEventListener('keyup', windOff);

    resetBtn.addEventListener('click', () => {
      omega = 0; energy = 0; growth = 0; won = false;
      game.classList.remove('won', 'used');
      render(); setStatus('Gire as pás com o dedo');
    });

    function setStatus(s) { if (s !== lastStatus) { status.textContent = s; lastStatus = s; } }

    function render() {
      rotor.style.transform = `rotate(${rot}deg)`;
      svg.style.setProperty('--e', energy.toFixed(3));
      svg.style.setProperty('--g', growth.toFixed(3));
      svg.classList.toggle('lit-1', energy > 0.15);
      svg.classList.toggle('flowing', energy > 0.4);
      fill.style.transform = `scaleX(${energy.toFixed(3)})`;
    }

    function step(t) {
      const dt = Math.min(50, t - prevT || 16); prevT = t;

      if (dragging) {
        if (t - lastMoveT > 60) omega *= Math.pow(0.5, dt / 90); // dedo parado
      } else {
        omega *= Math.pow(0.5, dt / 1500);                         // atrito
        rot += omega * dt;
      }
      if (wind) omega = clamp(omega + (omega >= 0 ? 1 : -1) * 0.0011 * dt, -1.2, 1.2);

      const target = clamp(Math.abs(omega) / MAX_OMEGA, 0, 1);
      energy += (target - energy) * Math.min(1, dt / 180);

      if (energy > 0.4 && !won) {
        growth = clamp(growth + (energy - 0.3) * dt / 7000, 0, 1);
        if (growth >= 1) {
          won = true;
          game.classList.add('won');
          wonMsg.textContent = 'Plantação salva! Você levou luz e água, assim como William.';
          vibrate([30, 60, 30, 60, 80]);
        }
      }

      if (won) setStatus('Missão cumprida! A plantação está verde de novo.');
      else if (energy > 0.75) setStatus('Energia máxima! A bomba está levando água.');
      else if (energy > 0.4) setStatus('A lâmpada acendeu! Continue girando…');
      else if (energy > 0.12) setStatus('Mais rápido! Precisa de mais vento.');
      else setStatus(growth > 0 ? 'O moinho parou… gire de novo!' : 'Gire as pás com o dedo');

      render();

      if (dragging || wind || Math.abs(omega) > 0.002 || energy > 0.003) requestAnimationFrame(step);
      else { running = false; energy = 0; render(); }
    }

    function start() {
      if (running) return;
      running = true; prevT = performance.now();
      requestAnimationFrame(step);
    }
    render();
  }
})();
