/* =========================================================
   Kevin Junger — Portfolio · Interaktion & Animationen
   Vanilla JS, keine Bibliotheken.
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer    = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Jahr im Footer ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: Hintergrund beim Scrollen + Fortschrittsbalken ---------- */
  const nav = $('#nav');
  const progress = $('#scroll-progress');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile-Menü ---------- */
  const burger = $('#nav-burger');
  const links = $('.nav__links');
  $$('.nav__links a').forEach((a, i) => a.style.setProperty('--ni', i));
  const toggleMenu = (force) => {
    const open = force ?? !links.classList.contains('open');
    links.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => toggleMenu());
  $$('a', links).forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Sektions-Titel in Buchstaben zerlegen ---------- */
  $$('.section__title').forEach(title => {
    const text = title.textContent;
    title.textContent = '';
    title.setAttribute('aria-label', text);
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ltr';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      s.style.setProperty('--li', (i * 0.035) + 's');
      title.appendChild(s);
    });
  });

  /* ---------- Skill-Level-Punkte ---------- */
  $$('.chips li[data-level]').forEach(li => {
    const level = parseInt(li.dataset.level, 10) || 0;
    const wrap = document.createElement('span');
    wrap.className = 'skill-level';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('i');
      if (i < level) dot.classList.add('filled');
      dot.style.setProperty('--di', (i * 0.12) + 's');
      wrap.appendChild(dot);
    }
    li.appendChild(wrap);
  });

  /* ---------- Projekt-Details aufklappen ---------- */
  $$('.project__toggle').forEach(btn => {
    const panel = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('open', !open);
      btn.firstChild.textContent = open ? 'Mehr erfahren ' : 'Weniger anzeigen ';
    });
  });

  /* ---------- Marquee: Inhalt für nahtlose Schleife verdoppeln ---------- */
  const marqueeTrack = $('#marquee-track');
  if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

  /* =========================================================
     Animationen, die erst nach dem Preloader starten sollen
     ========================================================= */

  const initReveals = () => {
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && !prefersReduced) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
    // Skill-Karten: Punkte färben sich beim Einblenden
    if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); sio.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      $$('.skill-group').forEach(el => sio.observe(el));
    } else {
      $$('.skill-group').forEach(el => el.classList.add('in'));
    }
  };

  const initCounters = () => {
    const counters = $$('.stat__num');
    const runCounter = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = target + suffix; return; }
      const dur = 1400; const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(c => cio.observe(c));
    } else {
      counters.forEach(runCounter);
    }
  };

  const initRotator = () => {
    const rotator = $('#role-rotator');
    if (!rotator) return;
    const roles = [
      'Fachinformatiker für Systemintegration',
      'Anwendungsentwickler',
      'Autodidakt seit dem 9. Lebensjahr',
      'PC-Bastler seit dem 13. Lebensjahr'
    ];
    if (prefersReduced) { rotator.textContent = roles[0]; return; }
    let ri = 0, ci = 0, deleting = false;
    const tick = () => {
      const word = roles[ri];
      ci += deleting ? -1 : 1;
      rotator.textContent = word.slice(0, ci);
      let delay = deleting ? 40 : 75;
      if (!deleting && ci === word.length) { delay = 1800; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 300; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 600);
  };

  /* ---------- Scramble-Effekt für den Namen ---------- */
  const scramble = (el, delay = 0) => {
    const target = el.dataset.scramble || el.textContent;
    if (prefersReduced) { el.textContent = target; return; }
    const glyphs = '!<>-_\\/[]{}—=+*^?#01';
    let frame = 0;
    const total = Math.max(26, target.length * 3);
    setTimeout(() => {
      const step = () => {
        frame++;
        const fixed = Math.floor((frame / total) * target.length);
        let out = target.slice(0, fixed);
        for (let i = fixed; i < target.length; i++) {
          out += target[i] === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        el.textContent = out;
        if (fixed < target.length) requestAnimationFrame(step);
        else el.textContent = target;
      };
      step();
    }, delay);
  };

  const initScramble = () => {
    $$('[data-scramble]').forEach((el, i) => scramble(el, 150 + i * 250));
  };

  /* ---------- Timeline füllt sich beim Scrollen ---------- */
  const initTimeline = () => {
    const tl = $('.timeline');
    if (!tl) return;
    const update = () => {
      const r = tl.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
      tl.style.setProperty('--tl', p.toFixed(3));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  const start = () => {
    initReveals();
    initCounters();
    initRotator();
    initScramble();
    initTimeline();
  };

  /* =========================================================
     Preloader: Boot-Sequenz im Terminal-Stil
     ========================================================= */
  const preloader = $('#preloader');
  const preBody = $('#preloader-body');
  let preloaderDone = false;

  const finishPreloader = () => {
    if (preloaderDone || !preloader) return;
    preloaderDone = true;
    try { sessionStorage.setItem('kj-booted', '1'); } catch (e) { /* privater Modus */ }
    preloader.classList.add('done');
    document.body.classList.remove('loading');
    setTimeout(() => preloader.remove(), 700);
    start();
  };

  let alreadyBooted = false;
  try { alreadyBooted = !!sessionStorage.getItem('kj-booted'); } catch (e) { /* egal */ }

  if (!preloader || !preBody || alreadyBooted || prefersReduced) {
    preloader?.remove();
    start();
  } else {
    document.body.classList.add('loading');
    const bootLines = [
      'kevin@portfolio:~$ ./boot.sh',
      '> lade Neugier .......... OK',
      '> lade Ausdauer ......... OK',
      '> mounte /skills ........ OK',
      '> mounte /projekte ...... OK',
      '> Lernprozess ........... läuft seit dem 9. Lebensjahr',
      'Willkommen.'
    ];
    const caret = document.createElement('span');
    caret.className = 'pl-caret';
    let li = 0, ci = 0, lineEl = null;
    const typeTick = () => {
      if (preloaderDone) return;
      if (!lineEl) {
        lineEl = document.createElement('div');
        lineEl.className = 'pl-line' + (li === bootLines.length - 1 ? ' white' : '');
        preBody.appendChild(lineEl);
        preBody.appendChild(caret);
      }
      ci++;
      lineEl.textContent = bootLines[li].slice(0, ci);
      lineEl.appendChild(caret);
      if (ci < bootLines[li].length) {
        setTimeout(typeTick, li === 0 ? 26 : 9);
      } else if (li < bootLines.length - 1) {
        li++; ci = 0; lineEl = null;
        setTimeout(typeTick, 130);
      } else {
        setTimeout(finishPreloader, 500);
      }
    };
    setTimeout(typeTick, 280);
    preloader.addEventListener('click', finishPreloader);
    window.addEventListener('keydown', finishPreloader, { once: true });
    // Sicherheitsnetz: nie länger als 6 s blockieren
    setTimeout(finishPreloader, 6000);
  }

  /* =========================================================
     Custom Cursor (Punkt + nachlaufender Ring)
     ========================================================= */
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (dot && ring && finePointer && !prefersReduced) {
    document.body.classList.add('custom-cursor');
    let mx = -100, my = -100, rx = -100, ry = -100, visible = false;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!visible) { visible = true; dot.style.opacity = '1'; ring.style.opacity = '1'; }
    }, { passive: true });
    document.addEventListener('mouseleave', () => {
      visible = false; dot.style.opacity = '0'; ring.style.opacity = '0';
    });
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    const isInteractive = (t) => t.closest?.('a, button, .btn, .project, input, label, [role="button"]');
    document.addEventListener('mouseover', (e) => {
      ring.classList.toggle('is-active', !!isInteractive(e.target));
      document.body.classList.toggle('cursor-hidden', !!e.target.closest?.('input, textarea'));
    });
    document.addEventListener('mousedown', () => ring.classList.add('is-down'));
    document.addEventListener('mouseup', () => ring.classList.remove('is-down'));
  }

  /* ---------- Magnetischer Button-Hover ---------- */
  if (finePointer && !prefersReduced) {
    $$('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Projekt-Karten: Glow + 3D-Tilt ---------- */
  $$('.project').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      if (finePointer && !prefersReduced) {
        const ryd = (px - 0.5) * 8;
        const rxd = (0.5 - py) * 7;
        card.style.transform = `perspective(900px) rotateX(${rxd.toFixed(2)}deg) rotateY(${ryd.toFixed(2)}deg) translateY(-4px)`;
      }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- Cursor-Glow (nur mit Maus) ---------- */
  const glow = $('.cursor-glow');
  if (glow && finePointer && !prefersReduced) {
    let gx = 0, gy = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      gx = e.clientX; gy = e.clientY; glow.style.opacity = '1';
    }, { passive: true });
    const loop = () => {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.left = cx + 'px'; glow.style.top = cy + 'px';
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Aktiver Nav-Link je Sektion ---------- */
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute('id');
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(s => spy.observe(s));
  }

  /* =========================================================
     Partikel-Konstellation + Sternschnuppen
     ========================================================= */
  const canvas = $('#bg-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const mouse = { x: -9999, y: -9999 };
    const shots = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const density = Math.min(90, Math.floor((w * h) / 16000));
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.6
      }));
    };

    const spawnShot = () => {
      shots.push({
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.4,
        vx: 6 + Math.random() * 5,
        vy: 2.5 + Math.random() * 2,
        life: 1
      });
      setTimeout(spawnShot, 4000 + Math.random() * 6000);
    };
    setTimeout(spawnShot, 3000);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150, 180, 255, 0.55)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = dx * dx + dy * dy;
          if (dist < 15000) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(120, 150, 255, ${0.12 * (1 - dist / 15000)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const mdist = mdx * mdx + mdy * mdy;
        if (mdist < 24000) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.25 * (1 - mdist / 24000)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Sternschnuppen
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.016;
        if (s.life <= 0 || s.x > w + 60 || s.y > h + 60) { shots.splice(i, 1); continue; }
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
        grad.addColorStop(0, `rgba(180, 220, 255, ${0.85 * s.life})`);
        grad.addColorStop(1, 'rgba(180, 220, 255, 0)');
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('resize', resize);
    resize();
    draw();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  /* =========================================================
     Toast-Meldungen
     ========================================================= */
  const toast = (msg, ms = 3200) => {
    let el = $('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), ms);
  };

  /* =========================================================
     Konfetti + Party-Modus (Konami-Code)
     ========================================================= */
  const confetti = () => {
    if (prefersReduced) return;
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:145;pointer-events:none;';
    document.body.appendChild(c);
    const cx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const colors = ['#22d3ee', '#a855f7', '#6366f1', '#34d399', '#f472b6', '#facc15'];
    const bits = Array.from({ length: 160 }, () => ({
      x: Math.random() * c.width,
      y: -20 - Math.random() * c.height * 0.5,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      vy: 2.5 + Math.random() * 3.5,
      vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      col: colors[Math.floor(Math.random() * colors.length)]
    }));
    const t0 = performance.now();
    const tick = (now) => {
      cx.clearRect(0, 0, c.width, c.height);
      bits.forEach(b => {
        b.y += b.vy; b.x += b.vx; b.rot += b.vr;
        cx.save();
        cx.translate(b.x, b.y);
        cx.rotate(b.rot);
        cx.fillStyle = b.col;
        cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        cx.restore();
      });
      if (now - t0 < 4200) requestAnimationFrame(tick);
      else c.remove();
    };
    requestAnimationFrame(tick);
  };

  const party = () => {
    confetti();
    let hue = $('.hue-blast');
    if (!hue) {
      hue = document.createElement('div');
      hue.className = 'hue-blast';
      document.body.appendChild(hue);
    }
    hue.classList.add('on');
    setTimeout(() => hue.classList.remove('on'), 5000);
    toast('🎉 Konami-Code! Respekt — du kennst die Klassiker.');
  };

  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kPos = 0;
  window.addEventListener('keydown', (e) => {
    kPos = (e.key === konami[kPos]) ? kPos + 1 : (e.key === konami[0] ? 1 : 0);
    if (kPos === konami.length) { kPos = 0; party(); }
  });

  /* =========================================================
     Interaktives Terminal
     ========================================================= */
  const term = $('#terminal');
  const termBody = $('#terminal-body');
  const termForm = $('#terminal-form');
  const termInput = $('#terminal-input');
  const termFab = $('#term-fab');
  const termClose = $('#terminal-close');

  if (term && termBody && termForm && termInput && termFab) {
    let welcomed = false;
    const history = [];
    let hPos = -1;

    const print = (html, cls = '') => {
      const div = document.createElement('div');
      div.className = 'line' + (cls ? ' ' + cls : '');
      div.innerHTML = html;
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    };
    const echo = (cmd) => {
      const div = document.createElement('div');
      div.className = 'line echo';
      const p = document.createElement('span');
      p.className = 'prompt-char';
      p.textContent = 'kevin@portfolio:~$ ';
      div.appendChild(p);
      div.appendChild(document.createTextNode(cmd));
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    };

    const asciiKJ =
` ██╗  ██╗     ██╗
 ██║ ██╔╝     ██║
 █████╔╝      ██║
 ██╔═██╗ ██   ██║
 ██║  ██╗╚█████╔╝
 ╚═╝  ╚═╝ ╚════╝`;

    const openTerm = () => {
      term.classList.add('open');
      termFab.classList.add('hidden');
      if (!welcomed) {
        welcomed = true;
        print(`<pre>${asciiKJ}</pre>`);
        print(`Willkommen im Portfolio-Terminal. Tipp: <span class="c">help</span> zeigt alle Befehle.`);
        print('');
      }
      setTimeout(() => termInput.focus(), 60);
    };
    const closeTerm = () => {
      term.classList.remove('open');
      termFab.classList.remove('hidden');
    };

    termFab.addEventListener('click', openTerm);
    termClose.addEventListener('click', closeTerm);
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '.') { e.preventDefault(); term.classList.contains('open') ? closeTerm() : openTerm(); }
      if (e.key === 'Escape' && term.classList.contains('open')) closeTerm();
    });

    const commands = {
      help() {
        print(`Verfügbare Befehle:
  <span class="c">whoami</span>      wer ich bin
  <span class="c">skills</span>      was ich kann (und was ich gerade lerne)
  <span class="c">projekte</span>    was ich gebaut habe
  <span class="c">werdegang</span>   mein Weg bis hierher
  <span class="c">warum</span>       warum ich der Richtige bin
  <span class="c">kontakt</span>     wie Sie mich erreichen
  <span class="c">github</span>      mein GitHub-Profil
  <span class="c">neofetch</span>    Systeminfo ;)
  <span class="c">party</span>       nicht drücken.
  <span class="c">clear</span>       Terminal leeren
  <span class="c">exit</span>        Terminal schließen`);
      },
      whoami() {
        print(`Kevin Junger — angehender Fachinformatiker für Systemintegration aus Östringen.
Mit 9 das erste Programm geschrieben, mit 13 den ersten PC gebaut.
Kein fertiger Profi — aber einer, der nicht aufhört, bis es funktioniert.`);
      },
      skills() {
        print(`Sicher:        HTML, CSS, JavaScript, Windows, PC-Bau & Reparatur
Praxiserprobt: Python, Git/GitHub, Troubleshooting, Linux (Live-Systeme)
Lernt gerade:  C# & Unity (Unity Learn fast abgeschlossen), SQL/Datenbanken`);
      },
      projekte() {
        print(`— Discord-Bots (JavaScript): Moderation, Warnsystem, Rollenverwaltung
— Medikamenten-Tracker (Android): App für meinen Vater, KI-gestützt gebaut
— TFT Companion-Tool: In-Game-Overlay über die offizielle Riot-API
— Python & SQL: Skripte, Automatisierung, erste Datenbank-Projekte
— Dutzende PCs gebaut, Laptops/Handys/Drucker repariert
Aktuell: C# & Unity — das erste eigene Spiel ist in Vorbereitung.`);
      },
      werdegang() {
        print(`8–9 Jahre   → erste kleine Programme (HTML, CSS, JS)
ab 13       → PCs bauen, Geräte reparieren
danach      → Lagerberuf tagsüber, Coden nachts
heute       → Unity Learn fast fertig, Ausbildungsplatz gesucht`);
      },
      warum() {
        print(`Drei ehrliche Gründe:
1. Ich lerne seit 15+ Jahren freiwillig — niemand musste mich je zwingen.
2. Ich habe Geduld: Ich verbeiße mich in Probleme, bis sie gelöst sind.
3. Ich weiß, was ich noch NICHT kann — und genau dafür will ich die Ausbildung.`);
      },
      kontakt() {
        print(`E-Mail: <a href="mailto:kevin.junger@hotmail.com">kevin.junger@hotmail.com</a>
GitHub: <a href="https://github.com/Kevoshable" target="_blank" rel="noopener">github.com/Kevoshable</a>
Region: Östringen (Baden-Württemberg)`);
      },
      github() {
        print(`→ <a href="https://github.com/Kevoshable" target="_blank" rel="noopener">github.com/Kevoshable</a>`);
      },
      neofetch() {
        print(`<pre>${asciiKJ}</pre>`);
        print(`<span class="c">kevin</span>@<span class="c">portfolio</span>
─────────────────
<span class="c">Rolle:</span>    angehender Fachinformatiker (Systemintegration)
<span class="c">Uptime:</span>   neugierig seit dem 9. Lebensjahr
<span class="c">Shell:</span>    Ausdauer v∞
<span class="c">Pakete:</span>   HTML, CSS, JavaScript, Python, C# (lernt), SQL
<span class="c">Editor:</span>   VS Code & Unity
<span class="c">Status:</span>   sucht Ausbildungsplatz
<span class="c">Kontakt:</span>  kevin.junger@hotmail.com`);
      },
      party() {
        print('Ich hatte dich gewarnt. 🎉', 'ok');
        party();
      },
      clear() { termBody.innerHTML = ''; },
      exit() { closeTerm(); }
    };
    commands.hilfe = commands.help;
    commands.projects = commands.projekte;
    commands.contact = commands.kontakt;
    commands.why = commands.warum;

    termForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = termInput.value.trim();
      termInput.value = '';
      if (!raw) return;
      echo(raw);
      history.unshift(raw);
      hPos = -1;
      const cmd = raw.toLowerCase();
      if (cmd.startsWith('sudo')) {
        if (/(einstellen|hire|kevin)/.test(cmd)) {
          print('[sudo] Passwort für arbeitgeber: ********', 'ok');
          print('Zugriff gewährt. Sehr gute Entscheidung. 🤝', 'ok');
          print('→ <a href="mailto:kevin.junger@hotmail.com?subject=Ausbildung%20Fachinformatiker">Direkt E-Mail schreiben</a>');
        } else {
          print('Netter Versuch. Root-Rechte gibt es erst nach der Einstellung. 😉', 'err');
        }
        print('');
        return;
      }
      const fn = commands[cmd];
      if (fn) fn();
      else print(`bash: ${cmd.replace(/</g, '&lt;')}: Befehl nicht gefunden. Versuch's mit <span class="c">help</span>.`, 'err');
      if (cmd !== 'clear') print('');
    });

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hPos < history.length - 1) { hPos++; termInput.value = history[hPos]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hPos > 0) { hPos--; termInput.value = history[hPos]; }
        else { hPos = -1; termInput.value = ''; }
      }
    });
  }

  /* ---------- Tab-Titel, wenn man wegklickt ---------- */
  const origTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? '👀 Bis gleich? — Kevin Junger' : origTitle;
  });

  /* ---------- Gruß an alle, die die DevTools öffnen ---------- */
  console.log(
    '%c Hey, neugierig? Gefällt mir. 👋 ',
    'background: linear-gradient(120deg, #22d3ee, #a855f7); color: #06060c; font-size: 16px; font-weight: bold; padding: 8px 14px; border-radius: 8px;'
  );
  console.log(
    '%cGenau so habe ich auch angefangen — mit Reinschauen, wie andere ihre Sachen bauen.\nDer ganze Code hier: https://github.com/Kevoshable/portfolio',
    'color: #9aa0b8; font-size: 12px;'
  );
})();
