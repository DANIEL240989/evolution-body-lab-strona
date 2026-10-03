/* Evolution Body Lab: silnik ruchu (03.10.2026). Daniel: „landonorris.com 1:1, połączyć z jjettas.com i orchid.security”.
   Odtworzony RUCH i RYTM tamtych stron, nie ich pliki. Sprawdzone rozwiązania z DASTAN BTP (js/ruch.js, 26.09):
   - jedna krzywa „ebl” na wejścia (szybki start, długie miękkie lądowanie), „ebl-io” na przejazdy i kurtynę;
   - kurtyna przy pierwszym wejściu w karcie: nazwa spod maski, różowozłota linia rośnie od środka, ekran się rozchyla;
   - nagłówki linia po linii spod maski (podział cofany po animacji), etykiety wycierane od kreski, zdjęcia spod maski;
   - pierwszy ekran: pas napisu w dwóch rzędach (prędkość i kierunek idą za przewijaniem), podpis „Monika” rysuje się kreską;
   - manifest: słowa rozjaśniają się przy przewijaniu, schodki z bloków w różowym złocie i nocy przechodzą do zabiegów;
   - zabiegi: przypięty poziomy tor (tylko komputer), wielkie słowo w tle jedzie wolniej niż karty;
   - pierwsza wizyta: dwie połówki rozjeżdżają się, kula światła płynie, szklane karty wpływają;
   - stopka: ciemny panel unosi się nad poświatą;
   - Lenis tylko z myszą (telefon i dotyk przewijają natywnie);
   - przyciski, dane kontaktu i FAQ bez animacji wejścia: są gotowe od razu;
   - ograniczony ruch albo brak bibliotek: nic nie jest ukryte, kurtyny nie ma, układ pionowy. */
(function () {
  'use strict';
  var H = document.documentElement, kurtyna = document.querySelector('.kurtyna');
  var ok = !!(window.gsap && window.ScrollTrigger && window.SplitText && window.CustomEase) &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) { H.classList.remove('ruch', 'kurtyna-on'); if (kurtyna) kurtyna.remove(); return; }

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create('ebl', '0.16,1,0.3,1');
  CustomEase.create('ebl-io', '0.65,0,0.35,1');
  var EIO = gsap.parseEase('ebl-io');
  ScrollTrigger.config({ ignoreMobileResize: true });
  var Q = function (s, r) { return (r || document).querySelector(s); };
  var QA = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- płynne przewijanie: tylko mysz ---------- */
  var lenis = null, kurtynaTrwa = false;
  if (window.Lenis && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true, allowNestedScroll: true, stopInertiaOnNavigate: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    /* link do sekcji kliknięty myszą: płynny przejazd; z klawiatury zwykły skok */
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.detail === 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      var h = a.getAttribute('href'), cel = h.length > 1 && document.getElementById(decodeURIComponent(h.slice(1)));
      if (!cel) return;
      e.preventDefault(); if (location.hash !== h) history.pushState(null, '', h);
      lenis.scrollTo(cel, { duration: 1.5, easing: EIO, onComplete: function () { odslon(); } });
    });
  }

  /* ---------- linie spod maski (podział cofany po animacji) ---------- */
  function linie(el, o) {
    o = o || {};
    var s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ebl-linia', reduceWhiteSpace: false });
    (s.masks || []).forEach(function (m) { m.classList.add('ebl-linia-maska'); });
    el.classList.remove('czeka');
    return gsap.fromTo(s.lines, { yPercent: 118 }, { yPercent: 0, duration: o.duration || 1.15, ease: 'ebl',
      stagger: o.stagger || .1, delay: o.delay || 0, onComplete: function () { s.revert(); } });
  }
  function wytrzyj(el, d) {
    el.classList.remove('czeka');
    var srodek = getComputedStyle(el).justifyContent === 'center';
    gsap.fromTo(el, { clipPath: srodek ? 'inset(0% 50% 0% 50%)' : 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, delay: d || 0, ease: 'ebl', clearProps: 'clipPath' });
  }
  function rysuj(svg, o) {
    o = o || {};
    gsap.set(svg, { '--p1': 1, '--p2': 1 });
    return gsap.timeline({ delay: o.delay || 0 })
      .to(svg, { '--p1': 0, duration: o.duration || 2.4, ease: 'power2.inOut' })
      .to(svg, { '--p2': 0, duration: .3, ease: 'power1.out' }, '-=0.25');
  }

  /* ---------- kolejka odsłon przy przewijaniu (wzór DASTAN) ---------- */
  var CZEKA = [];
  function graj(lista, odRazu) {
    lista = lista.filter(function (o) { return o.stan === 'czeka'; }); if (!lista.length) return;
    lista.forEach(function (o, i) {
      o.stan = 'jest'; if (o.st) { o.st.kill(); o.st = null; }
      var el = o.el, d = i * .08;
      if (odRazu) {
        el.classList.remove('czeka');
        if (o.rodzaj === 'obraz') gsap.set(el, { clearProps: 'clipPath,transform' });
        if (o.rodzaj === 'podpis') gsap.set(el, { '--p1': 0, '--p2': 0 });
        return;
      }
      if (o.rodzaj === 'linie') linie(el, { delay: d });
      else if (o.rodzaj === 'etykieta') wytrzyj(el, d);
      else if (o.rodzaj === 'obraz') gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, delay: d, ease: 'ebl', clearProps: 'clipPath,transform' });
      else if (o.rodzaj === 'podpis') rysuj(el, { delay: .35 + d, duration: 2.2 });
      else { el.classList.remove('czeka'); gsap.fromTo(el, { opacity: 0, y: o.y || 40 }, { opacity: 1, y: 0, duration: 1.2, delay: i * .1, ease: 'ebl', clearProps: 'opacity,transform' }); }
    });
  }
  function kolejka(sel, rodzaj, start, y) {
    var el = typeof sel === 'string' ? QA(sel) : sel; if (!el.length) return;
    var wp = el.map(function (x) {
      var o = { el: x, rodzaj: rodzaj, stan: 'czeka', y: y };
      if (rodzaj === 'obraz') gsap.set(x, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.14, transformOrigin: '50% 100%' });
      else if (rodzaj === 'podpis') gsap.set(x, { '--p1': 1, '--p2': 1 });
      else x.classList.add('czeka');
      CZEKA.push(o); return o;
    });
    ScrollTrigger.batch(el, { start: start || 'top 88%', once: true,
      onEnter: function (b) { graj(b.map(function (x) { return wp[el.indexOf(x)]; })); } })
      .forEach(function (st, i) { if (wp[i]) wp[i].st = st; });
  }
  /* po skoku z linku, strzałce wstecz albo zatrzymaniu przewijania: to, co już jest na ekranie albo wyżej, pokazać */
  function odslon(poPrzewijaniu) {
    var dol = innerHeight * .92, teraz = [];
    CZEKA.forEach(function (o) {
      if (o.stan !== 'czeka') return;
      var r = o.el.getBoundingClientRect();
      if (r.top < dol) { if (poPrzewijaniu && r.bottom > 0) teraz.push(o); else graj([o], true); }
    });
    graj(teraz);
  }
  var odT; window.addEventListener('scroll', function () { clearTimeout(odT); odT = setTimeout(function () { odslon(true); }, 240); }, { passive: true });
  window.addEventListener('hashchange', function () { setTimeout(odslon, 60); });
  window.addEventListener('popstate', function () { setTimeout(odslon, 60); });

  var mm = gsap.matchMedia();
  var KOMPUTER = '(min-width: 901px)', TELEFON = '(max-width: 900px)';

  /* ---------- pierwszy ekran ---------- */
  var hero = Q('.hero'), h1 = Q('.hero h1'), heroEt = Q('.hero-tresc .etykieta'), lead = Q('.hero .lead'), podpisH = Q('.podpis-hero');
  [h1, heroEt, lead].forEach(function (el) { if (el) el.classList.add('czeka'); });
  if (podpisH) gsap.set(podpisH, { '--p1': 1, '--p2': 1 });

  /* pas napisu: dwa rzędy w przeciwnych kierunkach; przewijanie przyspiesza i odwraca kierunek (jak u wzoru) */
  var tasmy = QA('.pas-tasma').map(function (t, i) {
    var tw = gsap.fromTo(t, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: 46, ease: 'none', repeat: -1 });
    tw.totalTime(tw.duration() * 200 + i * 7);   /* daleko od zera: odwrócony kierunek nie zatrzyma się na początku */
    return tw;
  });
  if (tasmy.length) {
    var kier = 1;
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom top',
      onToggle: function (s) { tasmy.forEach(function (t) { s.isActive ? t.resume() : t.pause(); }); },
      onUpdate: function (s) {
        kier = s.direction;
        var v = Math.min(Math.abs(s.getVelocity()) / 260, 5);
        gsap.to(tasmy, { timeScale: kier * (1 + v), duration: .25, overwrite: true,
          onComplete: function () { gsap.to(tasmy, { timeScale: kier, duration: 1.2, ease: 'power2.out', overwrite: true }); } });
      }
    });
    /* pas rozjeżdża się lekko na boki przy wyjeździe z ekranu */
    gsap.to('.pas-rzad.r1', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.pas-rzad.r2', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }
  mm.add(KOMPUTER, function () {
    gsap.to('.hero-tresc', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.podpis-hero', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  });

  H.classList.add('ruch-js');

  /* ---------- kurtyna ---------- */
  var poKurtynie = Promise.resolve();
  function zdejmij() {
    if (!kurtyna) return; kurtyna.remove(); kurtyna = null; kurtynaTrwa = false;
    H.classList.remove('kurtyna-on'); if (lenis) lenis.start();
  }
  if (kurtyna && H.classList.contains('kurtyna-on')) {
    kurtynaTrwa = true; if (lenis) lenis.stop();
    var otwarta; poKurtynie = new Promise(function (r) { otwarta = r; });
    setTimeout(function () { zdejmij(); otwarta(); }, 6000);   /* bezpiecznik: najpóźniej po 6 s kurtyny nie ma */
    try { sessionStorage.setItem('ebl-kurtyna', '1'); } catch (e) {}
    try {
      /* znak: napis (litery spod maski) albo obraz logo (cały spod maski .k-znak); bez celu GSAP sypał ostrzeżeniami */
      var znak = Q('.k-znak span', kurtyna) || Q('.k-znak img', kurtyna), pod = Q('.k-pod span', kurtyna), kl = Q('.k-linia', kurtyna),
          gora = Q('.k-gora', kurtyna), dol = Q('.k-dol', kurtyna),
          sz = { chars: !znak ? [] : znak.tagName === 'SPAN' ? SplitText.create(znak, { type: 'chars', mask: 'chars', aria: 'none' }).chars : [znak] };
      gsap.timeline()
        .fromTo(sz.chars, { yPercent: 118 }, { yPercent: 0, duration: 1.05, ease: 'ebl', stagger: .035 }, .1)
        .fromTo(kl, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'ebl-io' }, .25)
        .fromTo(pod, { yPercent: -118 }, { yPercent: 0, duration: .8, ease: 'ebl' }, .8);
      var czcionkiK = Promise.race([(document.fonts && document.fonts.ready) || Promise.resolve(), new Promise(function (r) { setTimeout(r, 1500); })]);
      Promise.all([czcionkiK, new Promise(function (r) { setTimeout(r, 1900); })]).then(function () {
        gsap.timeline({ onComplete: zdejmij })
          .to(sz.chars, { yPercent: -118, duration: .42, ease: 'power3.in', stagger: .015 }, 0)
          .to(pod, { yPercent: -118, duration: .36, ease: 'power3.in' }, 0)
          .to(kl, { scaleX: 2.4, opacity: 0, duration: 1.1, ease: 'ebl-io' }, .4)
          .to(gora, { yPercent: -100, duration: 1.2, ease: 'ebl-io' }, .58)
          .to(dol, { yPercent: 100, duration: 1.2, ease: 'ebl-io' }, .58)
          .add(function () { kurtynaTrwa = false; otwarta(); }, .9);
      });
    } catch (e) { zdejmij(); otwarta(); }
  } else if (kurtyna) { kurtyna.remove(); kurtyna = null; H.classList.remove('kurtyna-on'); }

  function czcionki(ms) { return Promise.race([(document.fonts && document.fonts.ready) || Promise.resolve(), new Promise(function (r) { setTimeout(r, ms); })]); }
  Promise.all([poKurtynie, czcionki(1200)]).then(function () {
    if (heroEt) wytrzyj(heroEt);
    if (h1) linie(h1, { duration: 1.3, stagger: .12, delay: .1 });
    if (lead) { lead.classList.remove('czeka'); gsap.fromTo(lead, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, delay: .45, ease: 'ebl', clearProps: 'opacity,transform' }); }
    if (podpisH) rysuj(podpisH, { delay: .5, duration: 2.6 });
  });

  /* ---------- nagłówki, etykiety, akapity, zdjęcia ---------- */
  kolejka('main > section:not(.hero) h2', 'linie', 'top 88%');
  kolejka('main > section:not(.hero) .etykieta', 'etykieta', 'top 92%');
  kolejka('.cytat', 'akapit', 'top 90%', 30);   /* cudzysłowy z CSS: bez podziału na linie */
  kolejka('.monika-foto img', 'obraz', 'top 90%');
  kolejka('.podpis-monika, .podpis-stopka', 'podpis', 'top 85%');
  kolejka('.stopka-slogan', 'linie', 'top 90%');

  /* ---------- manifest: słowa rozjaśniają się przy przewijaniu ---------- */
  var man = Q('.manifest-tekst');
  if (man) {
    var sw = SplitText.create(man, { type: 'words', wordsClass: 'ebl-slowo', reduceWhiteSpace: false });
    gsap.fromTo(sw.words, { opacity: .13 }, { opacity: 1, ease: 'none', stagger: .12,
      scrollTrigger: { trigger: man, start: 'top 82%', end: 'bottom 42%', scrub: .6 } });
  }
  kolejka('.manifest .cel', 'akapit', 'top 92%', 50);

  /* schodki z bloków: różowe złoto wchodzi stopniami, noc je przykrywa i odsłania zabiegi (tylko komputer) */
  mm.add(KOMPUTER, function () {
    var sch = Q('.schodki'), sek = Q('.manifest'); if (!sch) return;
    sch.style.display = 'flex'; sek.classList.add('ze-schodkami');
    var kol = QA('i', sch);
    gsap.timeline({ scrollTrigger: { trigger: sch, start: 'top 95%', end: 'bottom 15%', scrub: .7 } })
      .fromTo(kol, { '--r': 0 }, { '--r': 1, ease: 'power2.out', duration: .45, stagger: .06 }, 0)
      .fromTo(kol, { '--n': 0 }, { '--n': 1, ease: 'power2.inOut', duration: .45, stagger: .06 }, .62);
    ScrollTrigger.refresh();
    return function () { sch.style.display = ''; sek.classList.remove('ze-schodkami'); };
  });

  /* ---------- zabiegi: przypięty poziomy tor (komputer) ---------- */
  mm.add(KOMPUTER, function () {
    var sek = Q('#soins'), tor = Q('.tor', sek); if (!tor) return;
    sek.classList.add('tor-poziomo');
    var dystans = function () { return Math.max(0, tor.scrollWidth - innerWidth); };
    var jazda = gsap.to(tor, { x: function () { return -dystans(); }, ease: 'none',
      scrollTrigger: { trigger: sek, start: 'top top', end: function () { return '+=' + dystans(); }, pin: true, scrub: 1,
        invalidateOnRefresh: true, anticipatePin: 1 } });
    gsap.fromTo(Q('.slowo-tlo', sek), { xPercent: 6 }, { xPercent: -26, ease: 'none',
      scrollTrigger: { trigger: sek, start: 'top top', end: function () { return '+=' + dystans(); }, scrub: true, invalidateOnRefresh: true } });
    QA('.karta', sek).forEach(function (k, i) {
      gsap.fromTo(k, { y: i % 2 ? 90 : -70, rotate: i % 2 ? 2.2 : -2.2, opacity: .25 },
        { y: 0, rotate: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: k, containerAnimation: jazda, start: 'left 100%', end: 'left 55%', scrub: true } });
      gsap.fromTo(Q('.karta-obraz img', k), { scale: 1.28, xPercent: -6 }, { scale: 1.06, xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: k, containerAnimation: jazda, start: 'left 100%', end: 'right 0%', scrub: true } });
    });
    gsap.fromTo('.tor-wskazowka .strzalka', { x: 0 }, { x: 10, duration: .9, ease: 'sine.inOut', repeat: -1, yoyo: true });
    ScrollTrigger.refresh();
    return function () { sek.classList.remove('tor-poziomo'); gsap.set(tor, { clearProps: 'transform' }); };
  });
  mm.add(TELEFON, function () { kolejka('#soins .karta', 'akapit', 'top 92%', 50); });

  /* ---------- pierwsza wizyta ---------- */
  var duo = Q('.duo');
  if (duo) {
    gsap.fromTo('.duo-l', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: duo, start: 'top bottom', end: 'bottom 20%', scrub: true } });
    gsap.fromTo('.duo-r', { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: duo, start: 'top bottom', end: 'bottom 20%', scrub: true } });
    gsap.fromTo('.duo-kreska', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: duo, start: 'top 85%', end: 'top 40%', scrub: true } });
  }
  gsap.fromTo('#visite .kula', { yPercent: -38, scale: .78, opacity: .55 }, { yPercent: -60, scale: 1.08, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '#visite', start: 'top bottom', end: 'bottom top', scrub: true } });
  kolejka('#visite .kroki li', 'akapit', 'top 92%', 80);

  /* ---------- Monika i stopka: wielkie słowo w tle jedzie, panel stopki się unosi ---------- */
  gsap.fromTo('#monika .slowo-tlo', { xPercent: 4 }, { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '#monika', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.stopka-panel', { y: 110, scale: .94 }, { y: 0, scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.stopka', start: 'top bottom', end: 'top 25%', scrub: true } });

  /* po wczytaniu czcionek i obrazów przeliczyć pozycje */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (location.hash) setTimeout(function () { odslon(); }, 300);
})();
