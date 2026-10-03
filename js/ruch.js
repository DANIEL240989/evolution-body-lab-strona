/* Evolution Body Lab: silnik ruchu (03.10.2026). Daniel: „landonorris.com 1:1, połączyć z jjettas.com i orchid.security”.
   Odtworzony RUCH i RYTM tamtych stron, nie ich pliki. Sprawdzone rozwiązania z DASTAN BTP (js/ruch.js, 26.09):
   - jedna krzywa „ebl” na wejścia (szybki start, długie miękkie lądowanie), „ebl-io” na przejazdy i kurtynę;
   - kurtyna przy pierwszym wejściu w karcie: nazwa spod maski, różowozłota linia rośnie od środka, ekran się rozchyla;
   - nagłówki linia po linii spod maski (podział cofany po animacji), etykiety wycierane od kreski, zdjęcia spod maski;
   - pierwszy ekran: pas napisu w dwóch rzędach (prędkość i kierunek idą za przewijaniem);
   - manifest: słowa rozjaśniają się przy przewijaniu, schodki z bloków w różowym złocie i nocy przechodzą do zabiegów;
   - zabiegi: przy 2 kartach siatka obok siebie, od 3 kart przypięty poziomy tor (komputer); wielkie słowo w tle jedzie;
   - pierwsza wizyta: dwie połówki rozjeżdżają się, kula światła płynie, szklane karty wpływają;
   - ilustracje marki (manifest, pierwsza wizyta): medalion odsłania się kołem, potem lekko płynie z przewijaniem;
   - stopka: ciemny panel unosi się nad poświatą;
   - Lenis tylko z myszą (telefon i dotyk przewijają natywnie);
   SILNIKI P1 (03.10.2026, projekt/wzory/SILNIKI.md): nazwane krzywe (reveal/editorial/ui/cover), Lenis lerp .14,
   okno logo w kurtynie (Lando), pierwszy ekran kurczy się do ramki między rzędami napisu (Lando), skośna kurtyna
   #visite → #monika (jjettas), linia przez kroki wizyty ze świecącą głowicą (Orchid); P2: unoszenie kart zabiegów;
   WebGL (2,5D z mapy głębi, płyn pod kursorem, dystorsje kart i medalionów): osobny plik js/gl.js;
   - przyciski, dane kontaktu i FAQ bez animacji wejścia: są gotowe od razu;
   - ograniczony ruch albo brak bibliotek: nic nie jest ukryte, kurtyny nie ma, układ pionowy. */
(function () {
  'use strict';
  var H = document.documentElement, kurtyna = document.querySelector('.kurtyna');
  var ok = !!(window.gsap && window.ScrollTrigger && window.SplitText && window.CustomEase) &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) { H.classList.remove('ruch', 'kurtyna-on'); if (kurtyna) kurtyna.remove(); return; }

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  /* ---------- tokeny ruchu (SILNIKI.md #1, wzór jjettas): nazwane krzywe w jednym miejscu ----------
     reveal    wejścia (szybki start, długie miękkie lądowanie)       = dawne „ebl”
     editorial zmiany tła i koloru, menu
     ui        hovery i drobne przełączenia (0,3 s)
     cover     kurtyny, skosy, okno logo (wolny start i koniec, szybki środek)
     ebl-io    przejazdy do kotwic i linia kurtyny (zostaje z poprzedniej wersji)
     Te same krzywe są w CSS jako --e-reveal, --e-editorial, --e-ui, --e-cover (css/paleta.css). */
  var KRZYWE = { reveal: '0.16,1,0.3,1', editorial: '0.65,0.05,0.36,1', ui: '0.4,0,0.2,1', cover: '0.85,0,0.15,1',
    ebl: '0.16,1,0.3,1', 'ebl-io': '0.65,0,0.35,1' };
  Object.keys(KRZYWE).forEach(function (n) { CustomEase.create(n, KRZYWE[n]); });
  /* domyślny scrub dla efektów „przy przewijaniu” (jjettas): od 80% do 60% ekranu, opóźnienie .6 s */
  var SCRUB = { start: 'top 80%', end: 'bottom 60%', scrub: .6 };
  var EIO = gsap.parseEase('ebl-io');
  ScrollTrigger.config({ ignoreMobileResize: true });
  var Q = function (s, r) { return (r || document).querySelector(s); };
  var QA = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- płynne przewijanie: tylko mysz ---------- */
  var lenis = null, kurtynaTrwa = false;
  if (window.Lenis && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    /* lerp .14 i wheelMultiplier .8 (jjettas .16/.72): krótszy „ogon” niż dawne .09, strona nie przejeżdża celu */
    lenis = new Lenis({ lerp: .14, wheelMultiplier: .8, smoothWheel: true, allowNestedScroll: true, stopInertiaOnNavigate: true });
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
        if (o.rodzaj === 'obraz' || o.rodzaj === 'medalion') gsap.set(el, { clearProps: 'clipPath,transform' });
        if (o.rodzaj === 'podpis') gsap.set(el, { '--p1': 0, '--p2': 0 });
        return;
      }
      if (o.rodzaj === 'linie') linie(el, { delay: d });
      else if (o.rodzaj === 'etykieta') wytrzyj(el, d);
      else if (o.rodzaj === 'obraz') gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, delay: d, ease: 'ebl', clearProps: 'clipPath,transform' });
      else if (o.rodzaj === 'podpis') rysuj(el, { delay: .35 + d, duration: 2.2 });
      else if (o.rodzaj === 'medalion') gsap.to(el, { clipPath: 'circle(72% at 50% 50%)', scale: 1, duration: 1.7, delay: d, ease: 'ebl', clearProps: 'clipPath,transform' });
      else { el.classList.remove('czeka'); gsap.fromTo(el, { opacity: 0, y: o.y || 40 }, { opacity: 1, y: 0, duration: 1.2, delay: i * .1, ease: 'ebl', clearProps: 'opacity,transform' }); }
    });
  }
  function kolejka(sel, rodzaj, start, y) {
    var el = typeof sel === 'string' ? QA(sel) : sel; if (!el.length) return;
    var wp = el.map(function (x) {
      var o = { el: x, rodzaj: rodzaj, stan: 'czeka', y: y };
      if (rodzaj === 'obraz') gsap.set(x, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.14, transformOrigin: '50% 100%' });
      else if (rodzaj === 'podpis') gsap.set(x, { '--p1': 1, '--p2': 1 });
      else if (rodzaj === 'medalion') gsap.set(x, { clipPath: 'circle(0% at 50% 50%)', scale: .9 });
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

  /* ---------- pierwszy ekran kurczy się do ramki między dwoma rzędami napisu (Lando, SILNIKI #4) ----------
     Fala przechodzi z tła sekcji na osobną warstwę .hero-fala (index.html), którą przycina clip-path: inset().
     Komputer: sekcja przypięta na ok. 90 vh; ramka inset(18% 30%) + skala .92, tekst gaśnie i ucieka w górę, dwa rzędy
     napisu zjeżdżają na środek i chowają się „za” ramkę (maska rzędów gaśnie tylko w pasie ramki).
     Telefon: bez pinu, lekkie zwężenie zwykłym scrubem. Plakietka „Image de synthèse” jedzie z rogiem ramki. */
  var fala = Q('.hero-fala'), pasN = Q('.pas-napisu'), tresc = Q('.hero-tresc');
  var RAMA_PC = { fx: 30, fy: 18, s: .08, r: 6, rzedy: true, tekst: true }, RAMA_TEL = { fx: 5, fy: 3, s: 0, r: 14 };
  function rama(p, o) {
    var W = hero.clientWidth, Hh = hero.clientHeight, s = 1 - o.s * p, st = hero.style;
    var fx = W * o.fx / 100 * p, fy = Hh * o.fy / 100 * p;
    var lewa = W / 2 - (W / 2 - fx) * s, dol = Hh / 2 - (Hh / 2 - fy) * s;
    st.setProperty('--fx', fx.toFixed(1) + 'px'); st.setProperty('--fy', fy.toFixed(1) + 'px');
    st.setProperty('--fr', (o.r * p).toFixed(2) + 'px'); st.setProperty('--fs', s.toFixed(4)); st.setProperty('--fp', p.toFixed(3));
    st.setProperty('--pr', Math.max(Math.max(16, (W - 1180) / 2), lewa + 12).toFixed(1) + 'px');
    st.setProperty('--pb', Math.max(14, dol + 12).toFixed(1) + 'px');
    if (o.rzedy && pasN) {
      var ps = pasN.style;
      ps.setProperty('--ml', lewa.toFixed(1) + 'px'); ps.setProperty('--mr', (W - lewa).toFixed(1) + 'px'); ps.setProperty('--ma', (1 - p).toFixed(3));
      ps.setProperty('--pas-y', ((Hh / 2 - (pasN.offsetTop + pasN.offsetHeight / 2)) * gsap.parseEase('power2.inOut')(p)).toFixed(1) + 'px');
    }
    if (o.tekst && tresc) {
      var q = Math.min(1, p / .5);
      tresc.style.opacity = q ? (1 - q).toFixed(3) : ''; tresc.style.transform = q ? 'translateY(' + (-56 * q).toFixed(1) + 'px)' : '';
    }
  }
  function bezRamy() {
    hero.classList.remove('hero-rama');
    ['--fx', '--fy', '--fr', '--fs', '--fp', '--pr', '--pb'].forEach(function (v) { hero.style.removeProperty(v); });
    if (pasN) ['--ml', '--mr', '--ma', '--pas-y'].forEach(function (v) { pasN.style.removeProperty(v); });
    if (tresc) { tresc.style.opacity = ''; tresc.style.transform = ''; }
  }
  if (hero && fala) mm.add({ pc: KOMPUTER, tel: TELEFON }, function (c) {
    var o = c.conditions.pc ? RAMA_PC : RAMA_TEL, stan = { p: 0 }, nag = Q('.naglowek');
    hero.classList.add('hero-rama');
    var rysujR = function () { rama(stan.p, o); };
    gsap.to(stan, { p: 1, ease: 'none', onUpdate: rysujR, scrollTrigger: c.conditions.pc ? {
      trigger: hero, start: function () { return 'top ' + (nag ? nag.offsetHeight : 0) + 'px'; },
      end: function () { return '+=' + Math.round(innerHeight * .9); }, pin: true, scrub: SCRUB.scrub, anticipatePin: 1,
      invalidateOnRefresh: true, onRefresh: rysujR
    } : { trigger: hero, start: 'top top', end: 'bottom top', scrub: SCRUB.scrub, onRefresh: rysujR } });
    rysujR();
    return bezRamy;
  });

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

  H.classList.add('ruch-js');

  /* ---------- kurtyna ---------- */
  var poKurtynie = Promise.resolve();
  function zdejmij() {
    if (!kurtyna) return; kurtyna.remove(); kurtyna = null; kurtynaTrwa = false;
    H.classList.remove('kurtyna-on', 'k-okno-on', 'k-tlo'); if (lenis) lenis.start();
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
        if (!kurtyna) return;
        if (znak && znak.tagName === 'IMG') { try { okno(znak, pod, kl); } catch (e) { zdejmij(); otwarta(); } return; }
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

  /* Okno logo (Lando, SILNIKI #3): koło medalionu z damą otwiera się jak przesłona i staje się oknem na falę
     pierwszego ekranu (maska kurtyny z dziurą w kształcie koła), potem okno z różowozłotą obręczą rośnie do pełnego
     ekranu (krzywa „cover”, 1,25 s; telefon ok. 0,9 s). Logo nie jest przerysowane: znika spod maski, obręcz to kreska CSS.
     LOGO_KOLO: środek i promień wnętrza koła w img/logo-dama-zlota.webp (ułamki szerokości/wysokości obrazu). */
  var LOGO_KOLO = { x: .495, y: .382, r: .45 };
  function okno(img, pod, kl) {
    var b = img.getBoundingClientRect();
    if (!b.width) throw new Error('brak logo');
    var ox = b.left + b.width * LOGO_KOLO.x, oy = b.top + b.height * LOGO_KOLO.y, r0 = b.width * LOGO_KOLO.r;
    var rMax = Math.hypot(Math.max(ox, innerWidth - ox), Math.max(oy, innerHeight - oy)) + 6;
    var k = innerWidth <= 900 ? .72 : 1, m = { r: 0 };
    var obr = document.createElement('span'); obr.className = 'k-obrecz'; kurtyna.appendChild(obr);
    kurtyna.style.setProperty('--ox', ox.toFixed(1) + 'px'); kurtyna.style.setProperty('--oy', oy.toFixed(1) + 'px');
    obr.style.left = ox + 'px'; obr.style.top = oy + 'px';
    var ustaw = function () {
      kurtyna.style.setProperty('--or', m.r.toFixed(1) + 'px');
      obr.style.width = obr.style.height = (2 * m.r + 4).toFixed(1) + 'px';
    };
    ustaw(); kurtyna.classList.add('k-okno'); H.classList.add('k-okno-on', 'k-tlo');
    gsap.timeline({ onComplete: zdejmij })
      .to(pod, { yPercent: -118, duration: .36, ease: 'power3.in' }, 0)
      .to(kl, { scaleX: 0, opacity: 0, duration: .6, ease: 'ebl-io' }, 0)
      .to(m, { r: r0, duration: .8 * k, ease: 'reveal', onUpdate: ustaw }, .1)
      .to(obr, { opacity: 1, duration: .35, ease: 'ui' }, .4 * k)
      .to(img, { opacity: 0, duration: .4, ease: 'ui' }, .72 * k)
      .to(m, { r: rMax, duration: 1.25 * k, ease: 'cover', onUpdate: ustaw }, .95 * k)
      .to(obr, { opacity: 0, duration: .5 * k, ease: 'ui' }, 1.6 * k)
      .add(function () { H.classList.remove('k-okno-on'); }, 1.3 * k)
      .add(function () { kurtynaTrwa = false; otwarta(); }, 1.5 * k);
  }

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
  kolejka('.stopka-slogan', 'linie', 'top 90%');

  /* ---------- ilustracje marki (damy z różą i w kapeluszu): odsłona kołem od środka, potem lekki parallax ---------- */
  kolejka('.ilustracja-obraz', 'medalion', 'top 86%');
  QA('.ilustracja').forEach(function (f) {
    mm.add({ pc: KOMPUTER, tel: TELEFON }, function (c) {
      var a = c.conditions.pc ? 9 : 5;
      gsap.fromTo(f, { yPercent: a }, { yPercent: -a, ease: 'none',
        scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

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

  /* ---------- zabiegi ----------
     Przy 2 kartach (EMS i kriolipoliza, 03.10.2026) poziomy tor zostawiał pół ekranu pustego: karty stoją obok siebie
     w siatce (css/paleta.css), wchodzą od dołu, obraz płynie wolniej niż karta, wielkie słowo w tle jedzie.
     Tor wraca sam, gdy zabiegów będzie co najmniej TOR_OD. */
  var TOR_OD = 3, malo = QA('#soins .karta').length < TOR_OD;
  if (malo) {
    kolejka('#soins .karta', 'akapit', 'top 90%', 60);
    mm.add(KOMPUTER, function () {
      var sek = Q('#soins'); if (!sek) return;
      gsap.fromTo(Q('.slowo-tlo', sek), { xPercent: 4 }, { xPercent: -16, ease: 'none',
        scrollTrigger: { trigger: sek, start: 'top bottom', end: 'bottom top', scrub: true } });
      QA('.karta', sek).forEach(function (k) {
        gsap.fromTo(k, { '--py': '-5%' }, { '--py': '5%', ease: 'none',
          scrollTrigger: { trigger: k, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
  }
  /* poziomy tor (komputer, od TOR_OD kart) */
  if (!malo) mm.add(KOMPUTER, function () {
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
  if (!malo) mm.add(TELEFON, function () { kolejka('#soins .karta', 'akapit', 'top 92%', 50); });

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

  /* Linia przez kroki wizyty ze świecącą głowicą (Orchid „How it works”, SILNIKI #16): różowozłota linia rysuje się
     scrubem, głowica świeci na jej końcu, krok zapala się (numer w złocie 24K), gdy głowica go mija.
     Cztery kroki w rzędzie: linia pozioma nad kartami; dwie kolumny i telefon: pionowa wzdłuż lewej krawędzi kart. */
  var kroki = Q('#visite .kroki');
  if (kroki) {
    var krokiLi = QA('li', kroki), progi = [], stanK = { p: 0 };
    var mierzK = function () {
      var pion = krokiLi.length > 1 && krokiLi[1].offsetTop !== krokiLi[0].offsetTop;
      kroki.classList.toggle('pion', pion);
      var dl = (pion ? kroki.offsetHeight : kroki.offsetWidth) || 1;
      progi = krokiLi.map(function (li) { return ((pion ? li.offsetTop : li.offsetLeft) + 12) / dl; });
    };
    var rysujK = function () {
      kroki.style.setProperty('--kp', stanK.p.toFixed(4));
      krokiLi.forEach(function (li, i) { li.classList.toggle('zapalony', stanK.p >= progi[i]); });
    };
    kroki.classList.add('z-linia'); mierzK(); rysujK();
    gsap.to(stanK, { p: 1, ease: 'none', onUpdate: rysujK,
      scrollTrigger: { trigger: kroki, start: SCRUB.start, end: SCRUB.end, scrub: SCRUB.scrub, onRefresh: function () { mierzK(); rysujK(); } } });
  }

  /* Skośna kurtyna #visite → #monika (jjettas, SILNIKI #8): len wjeżdża po przekątnej na noc wizyty.
     #monika nachodzi na koniec #visite o O (komputer 40 vh, telefon 18 vh; tyle samo pustej nocy dochodzi na dole wizyty,
     więc treść nie zmienia miejsca); clip-path: polygon z górną krawędzią od (0, O) do (100%, .22·O) prostuje się do 0.
     Na krawędzi cienka różowozłota linia. Bez skryptu i przy ograniczonym ruchu: zwykła prosta granica. */
  var mon = Q('#monika'), wiz = Q('#visite');
  if (mon && wiz) mm.add({ pc: KOMPUTER, tel: TELEFON }, function (c) {
    var O = function () { return Math.round(innerHeight * (c.conditions.pc ? .4 : .18)); };
    var ust = function () { var o = O() + 'px'; mon.style.setProperty('--skos-o', o); wiz.style.setProperty('--skos-o', o); };
    ust(); mon.classList.add('skos'); wiz.classList.add('pod-skosem');
    ScrollTrigger.addEventListener('refreshInit', ust);
    gsap.fromTo(mon, { '--sl': function () { return O() + 'px'; }, '--sr': function () { return Math.round(O() * (c.conditions.pc ? .22 : .35)) + 'px'; } },
      { '--sl': '0px', '--sr': '0px', ease: 'cover',
        scrollTrigger: { trigger: mon, start: 'top 88%', end: 'top 12%', scrub: SCRUB.scrub, invalidateOnRefresh: true } });
    return function () {
      ScrollTrigger.removeEventListener('refreshInit', ust);
      mon.classList.remove('skos'); wiz.classList.remove('pod-skosem');
      ['--skos-o', '--sl', '--sr'].forEach(function (v) { mon.style.removeProperty(v); wiz.style.removeProperty(v); });
    };
  });

  /* Unoszenie kart zabiegów (jjettas, SILNIKI #14): ±6 px i ±0,4° w pętli 6,4 / 7,5 / 8,6 s w różnych fazach, tylko gdy
     sekcja jest w kadrze. Animowane są właściwości translate/rotate, więc nie gryzą się z transformem wejścia (GSAP). */
  var kartyZ = QA('#soins .karta');
  if (kartyZ.length) ScrollTrigger.create({ trigger: '#soins', start: 'top bottom', end: 'bottom top',
    onToggle: function (st) { kartyZ.forEach(function (k) { k.classList.add('unosi'); k.classList.toggle('w-kadrze', st.isActive); }); } });

  /* Kursor-latarka (CSS) zastąpiona płynem WebGL: js/gl.js (płótno w .hero-fala, ładowane po tym pliku). */

  /* ---------- Monika i stopka: wielkie słowo w tle jedzie, panel stopki się unosi ---------- */
  gsap.fromTo('#monika .slowo-tlo', { xPercent: 4 }, { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '#monika', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.stopka-panel', { y: 110, scale: .94 }, { y: 0, scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.stopka', start: 'top bottom', end: 'top 25%', scrub: true } });

  /* po wczytaniu czcionek i obrazów przeliczyć pozycje */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (location.hash) setTimeout(function () { odslon(); }, 300);
})();
