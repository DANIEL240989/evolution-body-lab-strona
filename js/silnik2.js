/* Evolution Body Lab: SILNIKI-2 (03.10.2026, projekt/wzory/SILNIKI-2.md: pomiar wideo Lando / jjettas / Orchid i nasza
   strona tym samym scenariuszem). Tu trzy poprawki, które nie mieszkają w innych plikach:
   #3 Menu pełnoekranowe na komputerze (Lando): przycisk 56×56 w pasku obok „Prendre rendez-vous”; granatowy panel spada
      z wypukłą dolną krawędzią (clip-path ellipse 150% 0% → 150% 160%, .55 s cubic-bezier(.65,.05,0,1)) z różowozłotą
      nitką 1 px; kadry (render EMS, kriolipoliza, kabina) odsłaniają się maską od dołu (.6 s od .25 s co .06), linki
      (Cormorant 64–72 px) wjeżdżają spod maski (yPercent 110 → 0, .6 s od .35 s co .07). Kadry w szarości, kolor po
      najechaniu na link (.3 s). Po prawej medalion Moniki (logo), języki, telefon i „Prendre rendez-vous”. Zamknięcie
      odwrotnie (.6 s). Esc zamyka, Tab krąży w panelu, aria-expanded na przycisku, reszta strony „inert”.
      Klik w link: skok pod panelem, panel podnosi się nad nowym miejscem (jak przejście u Lando).
   #4 Rolka tekstu na linkach i przyciskach (Lando „STORE”): dwie kopie w masce, yPercent 0 → -100 i 100 → 0, .27 s
      cubic-bezier(.65,.05,0,1). Złoty połysk przycisku zostaje. Kontakt (#contact, kreator) bez zmian.
   #9 Przechył kart + połysk (jjettas): cennik i kroki wizyty, rotationX/Y ±6° za kursorem (quickTo .4 s power3.out),
      scale 1.04 (.25 s), warstwa połysku linear-gradient(115deg …) za kursorem, mix-blend-mode: overlay, perspective 900px.
   Tylko komputer (≥ 901 px) z ruchem: telefon i ograniczony ruch = strona jak dotąd (decyzja Daniela 03.10.2026).
   Teksty z js/teksty.js, telefon z js/dane.js; obrazy RTX w menu z plakietką „Image de synthèse”. */
(function () {
  'use strict';
  var H = document.documentElement, W = window;
  if (!(W.gsap && W.ScrollTrigger) || !H.classList.contains('ruch-js') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var Q = function (s, r) { return (r || document).querySelector(s); };
  var QA = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var KOMPUTER = '(min-width: 901px)', MYSZ = '(min-width: 901px) and (hover: hover) and (pointer: fine)';
  var mm = gsap.matchMedia();
  var stat = W.EBL_S2 = { menu: false, otwarte: 0, rolki: 0, przechyl: 0 };
  function tekst(k) { var T = W.T || {}, l = H.lang || 'fr'; return (T[l] && T[l][k]) || (T.fr && T.fr[k]) || ''; }
  if (W.CustomEase) CustomEase.create('menu', '0.65,0.05,0,1');
  var EASE_MENU = W.CustomEase ? 'menu' : 'power3.inOut';
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* ================================================================ #4 ROLKA TEKSTU */
  var ROLKA = 'a.pill, button.pill, .naglowek .menu a, .stopka-menu a';
  function rolka(e) {
    if (e.querySelector('.rolka') || e.closest('#contact') || e.children.length) return;
    var t = e.textContent; if (!t || !t.trim()) return;
    var r = el('span', 'rolka'), a = el('span', 'rolka-a', t), b = el('span', 'rolka-b', t);
    b.setAttribute('aria-hidden', 'true');
    r.appendChild(a); r.appendChild(b); e.textContent = ''; e.appendChild(r); e.classList.add('z-rolka');
    stat.rolki++;
  }
  function bezRolki(e) { var r = e.querySelector(':scope > .rolka'); if (!r) return; e.textContent = r.firstChild.textContent; e.classList.remove('z-rolka'); }
  mm.add(KOMPUTER, function () {
    var lista = QA(ROLKA); lista.forEach(rolka);
    return function () { lista.forEach(bezRolki); stat.rolki = 0; };
  });

  /* ================================================================ #3 MENU PEŁNOEKRANOWE */
  var MENU = { spada: .55, kadry: .25, kadryCo: .06, linki: .35, linkiCo: .07, wejscie: .6, zamkniecie: .6 };
  var LINKI = [['#soins', 'nav_soins', 0], ['#tarifs', 'nav_tarifs', 1], ['#visite', 'nav_visite', 2], ['#monika', 'nav_monika', -1],
    ['#faq', 'nav_faq', 2], ['#contact', 'nav_contact', -1]];
  var KADRY = [['img/rtx/ems-urzadzenie-900.webp', 'mp-kadr-wolny'], ['img/rtx/krio-urzadzenie-900.webp', 'mp-kadr-wolny'], ['img/rtx/kabina-daniel-1200.webp', '']];
  /* od 03.10.2026 także telefon (Daniel: „teraz mobil”): to samo menu, na wąskim ekranie jedna kolumna bez kadrów */
  mm.add('all', function () {
    var nag = Q('.naglowek'); if (!nag) return;
    var D = W.EBL || {};
    /* przycisk w pasku */
    var btn = el('button', 'menu-przycisk'); btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'menu-pelne'); btn.setAttribute('aria-label', tekst('menu_ouvrir'));
    btn.innerHTML = '<span class="menu-kreski" aria-hidden="true"><i></i><i></i></span>';
    nag.appendChild(btn); H.classList.add('z-menu');
    /* panel */
    var p = el('div', 'menu-pelne'); p.id = 'menu-pelne'; p.hidden = true;
    p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'true'); p.setAttribute('aria-label', tekst('menu_nav'));
    var nic = el('span', 'mp-nic'), tlo = el('div', 'mp-tlo');
    nic.setAttribute('aria-hidden', 'true');
    var zam = el('button', 'mp-zamknij'); zam.type = 'button'; zam.setAttribute('aria-label', tekst('menu_fermer'));
    zam.innerHTML = '<span class="menu-kreski menu-x" aria-hidden="true"><i></i><i></i></span>';
    var kadry = el('div', 'mp-kadry'); kadry.setAttribute('aria-hidden', 'true');
    var kadrEl = KADRY.map(function (k) {
      var f = el('figure', 'mp-kadr ' + k[1]), i = el('img'); i.src = k[0]; i.alt = ''; i.loading = 'lazy'; i.decoding = 'async';
      f.appendChild(i); f.appendChild(el('span', 'plakietka', tekst('image_synthese'))); kadry.appendChild(f); return f;
    });
    var nav = el('nav', 'mp-linki'); nav.setAttribute('aria-label', tekst('menu_nav'));
    var linki = LINKI.map(function (l, i) {
      var a = el('a', 'mp-link'); a.href = l[0]; a.setAttribute('data-kadr', l[2]);
      a.appendChild(el('span', 'mp-nr', (i < 9 ? '0' : '') + (i + 1)));
      var m = el('span', 'mp-maska'), t = el('span', 'mp-tekst', tekst(l[1])); m.appendChild(t); a.appendChild(m);
      rolka(t); nav.appendChild(a); return a;
    });
    var bok = el('div', 'mp-bok');
    var med = el('p', 'mp-medalion'), mi = el('img'); mi.src = 'img/logo-dama-zlota.webp'; mi.alt = 'Evolution Body Lab'; mi.width = 600; mi.height = 770; mi.decoding = 'async';
    med.appendChild(mi); bok.appendChild(med);
    var jez = el('p', 'mp-jezyki'); jez.setAttribute('aria-label', tekst('menu_langues'));
    (W.JEZYKI || []).forEach(function (l) {
      var a = el('a', null, (W.NAZWY_JEZYKOW || {})[l] || l.toUpperCase()); a.href = '?lang=' + l; a.hreflang = l;
      if (l === (H.lang || 'fr')) a.setAttribute('aria-current', 'true');
      jez.appendChild(a);
    });
    bok.appendChild(jez);
    var tel = el('a', 'mp-tel', D.telefonTekst || ''); tel.href = 'tel:' + (D.telefon || '');
    var telW = el('p', 'mp-tel-w'); telW.appendChild(el('span', 'mp-etyk', tekst('telephone'))); telW.appendChild(tel); bok.appendChild(telW);
    var cta = el('a', 'pill solid mp-cta', tekst('cta_rdv')); cta.href = '#contact'; rolka(cta); bok.appendChild(cta);
    tlo.appendChild(zam); tlo.appendChild(kadry); tlo.appendChild(nav); tlo.appendChild(bok);
    p.appendChild(nic); p.appendChild(tlo); document.body.appendChild(p);
    stat.menu = true;

    var otwarte = false, tl = null, przed = null, lenis = W.EBL_LENIS;
    var bokEl = [med, jez, telW, cta];
    function ustaw(v) { p.style.setProperty('--my', v); }
    function obce(tak) {
      ['main', '.stopka', '.pasek-demo', '.pasek-tlum'].forEach(function (s) { var e = Q(s); if (e) { if (tak) e.setAttribute('inert', ''); else e.removeAttribute('inert'); } });
      QA('.naglowek > :not(.menu-przycisk)').forEach(function (e) { if (tak) e.setAttribute('inert', ''); else e.removeAttribute('inert'); });
    }
    function otworz() {
      if (otwarte) return; otwarte = true; stat.otwarte++;
      przed = document.activeElement;
      if (tl) tl.kill();
      /* przycisk zamknięcia dokładnie w miejscu przycisku z paska */
      var br = btn.getBoundingClientRect(); zam.style.left = br.left.toFixed(1) + 'px'; zam.style.top = br.top.toFixed(1) + 'px';
      p.hidden = false; H.classList.add('menu-otwarte'); btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', tekst('menu_fermer'));
      obce(true); if (lenis) lenis.stop();
      ustaw('0%');
      var m = { y: 0 };
      tl = gsap.timeline()
        .to(m, { y: 160, duration: MENU.spada, ease: EASE_MENU, onUpdate: function () { ustaw(m.y.toFixed(2) + '%'); } }, 0)
        .fromTo(kadrEl, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: MENU.wejscie, ease: 'reveal', stagger: MENU.kadryCo }, MENU.kadry)
        .fromTo(QA('.mp-tekst', nav), { yPercent: 110 }, { yPercent: 0, duration: MENU.wejscie, ease: 'reveal', stagger: MENU.linkiCo }, MENU.linki)
        .fromTo(QA('.mp-nr', nav), { opacity: 0 }, { opacity: 1, duration: .4, ease: 'ui', stagger: MENU.linkiCo }, MENU.linki + .1)
        .fromTo(bokEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, ease: 'reveal', stagger: .05 }, MENU.linki + .1)
        .fromTo(zam, { opacity: 0 }, { opacity: 1, duration: .3, ease: 'ui' }, .2);
      setTimeout(function () { if (otwarte) (linki[0] || zam).focus({ preventScroll: true }); }, 60);
    }
    function zamknij(skok, bezFokusu) {
      if (!otwarte) return; otwarte = false;
      if (tl) tl.kill();
      btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', tekst('menu_ouvrir'));
      obce(false); if (lenis) lenis.start();
      if (skok) skok();
      var m = { y: parseFloat(p.style.getPropertyValue('--my')) || 160 };
      tl = gsap.timeline({ onComplete: function () { p.hidden = true; H.classList.remove('menu-otwarte'); gsap.set([kadrEl, QA('.mp-tekst', nav), bokEl, zam], { clearProps: 'all' }); } })
        .to(QA('.mp-tekst', nav), { yPercent: -110, duration: .3, ease: 'power2.in', stagger: .03 }, 0)
        .to(bokEl.concat([zam]), { opacity: 0, duration: .2, ease: 'ui' }, 0)
        .to(kadrEl, { clipPath: 'inset(0% 0% 100% 0%)', duration: .35, ease: 'power2.in', stagger: .03 }, 0)
        .to(m, { y: 0, duration: MENU.zamkniecie - .1, ease: EASE_MENU, onUpdate: function () { ustaw(m.y.toFixed(2) + '%'); } }, .1);
      if (!bezFokusu && przed && przed.focus) przed.focus({ preventScroll: true });
    }
    btn.addEventListener('click', function () { otwarte ? zamknij() : otworz(); });
    zam.addEventListener('click', function () { zamknij(); btn.focus({ preventScroll: true }); });
    /* najechanie na link: jego kadr w kolorze */
    linki.forEach(function (a) {
      var k = +a.getAttribute('data-kadr');
      var wej = function () { kadrEl.forEach(function (f, i) { f.classList.toggle('mp-kadr-kolor', i === k); }); p.classList.toggle('mp-wybor', k >= 0); };
      var wyj = function () { kadrEl.forEach(function (f) { f.classList.remove('mp-kadr-kolor'); }); p.classList.remove('mp-wybor'); };
      a.addEventListener('pointerenter', wej); a.addEventListener('focus', wej);
      a.addEventListener('pointerleave', wyj); a.addEventListener('blur', wyj);
    });
    /* link do sekcji: skok pod panelem, potem panel podnosi się nad nowym miejscem */
    p.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      var c = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); if (!c) return;
      e.preventDefault(); e.stopPropagation();
      var h = a.getAttribute('href');
      zamknij(function () {
        if (location.hash !== h) history.pushState(null, '', h);
        var y0 = Math.round(c.getBoundingClientRect().top + W.scrollY);
        if (lenis) lenis.scrollTo(y0, { immediate: true, force: true }); else W.scrollTo(0, y0);
        ScrollTrigger.update();
      }, true);
      setTimeout(function () { try { (c.querySelector('h2, h3, [tabindex]') || c).focus({ preventScroll: true }); } catch (x) {} }, 50);
    });
    /* Esc i pułapka fokusu */
    function klawisz(e) {
      if (!otwarte) return;
      if (e.key === 'Escape') { e.preventDefault(); zamknij(); btn.focus({ preventScroll: true }); return; }
      if (e.key !== 'Tab') return;
      var f = QA('a[href], button:not([disabled])', p).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
    }
    document.addEventListener('keydown', klawisz);
    /* kółko myszy bez Lenisa (np. wyłączony): strona pod panelem nie przewija się */
    var stopKolko = function (e) { if (otwarte && !e.target.closest('.menu-pelne')) e.preventDefault(); };
    W.addEventListener('wheel', stopKolko, { passive: false });
    return function () {
      if (otwarte) { otwarte = false; obce(false); if (lenis) lenis.start(); }
      if (tl) tl.kill();
      document.removeEventListener('keydown', klawisz); W.removeEventListener('wheel', stopKolko);
      btn.remove(); p.remove(); H.classList.remove('z-menu', 'menu-otwarte'); stat.menu = false;
    };
  });

  /* ================================================================ #9 PRZECHYŁ KART + POŁYSK */
  mm.add(MYSZ, function () {
    var karty = QA('#cennik .cennik-poz, #visite .kroki li');
    var sprz = karty.map(function (k) {
      var pol = el('span', 'polysk'); pol.setAttribute('aria-hidden', 'true'); k.appendChild(pol); k.classList.add('przechyl');
      gsap.set(k, { transformPerspective: 900 });
      var rx = gsap.quickTo(k, 'rotationX', { duration: .4, ease: 'power3.out' }), ry = gsap.quickTo(k, 'rotationY', { duration: .4, ease: 'power3.out' });
      var ruch = function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = k.getBoundingClientRect(); if (!r.width) return;
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        ry((x - .5) * 12); rx((.5 - y) * 12);   /* ±6° */
        pol.style.setProperty('--px', (x * 100).toFixed(1) + '%'); pol.style.setProperty('--py', (y * 100).toFixed(1) + '%');
      };
      var wej = function (e) { if (e.pointerType !== 'mouse') return; k.classList.add('przechyl-on'); gsap.to(k, { scale: 1.04, duration: .25, ease: 'power3.out', overwrite: 'auto' }); };
      var wyj = function () { k.classList.remove('przechyl-on'); rx(0); ry(0); gsap.to(k, { scale: 1, duration: .4, ease: 'power3.out', overwrite: 'auto' }); };
      k.addEventListener('pointermove', ruch); k.addEventListener('pointerenter', wej); k.addEventListener('pointerleave', wyj);
      stat.przechyl++;
      return [k, pol, ruch, wej, wyj];
    });
    return function () {
      sprz.forEach(function (s) {
        s[0].removeEventListener('pointermove', s[2]); s[0].removeEventListener('pointerenter', s[3]); s[0].removeEventListener('pointerleave', s[4]);
        s[1].remove(); s[0].classList.remove('przechyl', 'przechyl-on'); gsap.set(s[0], { clearProps: 'transform' });
      });
      stat.przechyl = 0;
    };
  });
})();
