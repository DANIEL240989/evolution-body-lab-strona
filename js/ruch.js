/* Evolution Body Lab: silnik ruchu (03.10.2026). Daniel: „landonorris.com 1:1, połączyć z jjettas.com i orchid.security”.
   Odtworzony RUCH i RYTM tamtych stron, nie ich pliki. Sprawdzone rozwiązania z DASTAN BTP (js/ruch.js, 26.09):
   - jedna krzywa „ebl” na wejścia (szybki start, długie miękkie lądowanie), „ebl-io” na przejazdy i kurtynę;
   - kurtyna przy pierwszym wejściu w karcie: nazwa spod maski, różowozłota linia rośnie od środka, ekran się rozchyla;
   - nagłówki linia po linii spod maski (podział cofany po animacji), etykiety wycierane od kreski, zdjęcia spod maski;
   - pierwszy ekran: pas napisu w dwóch rzędach (prędkość i kierunek idą za przewijaniem);
   - manifest: schodki z bloków w różowym złocie i nocy przechodzą do zabiegów;
   - pierwsza wizyta: dwie połówki rozjeżdżają się, kula światła płynie, szklane karty wpływają;
   - ilustracje marki (manifest, pierwsza wizyta): medalion odsłania się kołem, potem lekko płynie z przewijaniem;
   - stopka: ciemny panel unosi się nad poświatą;
   - Lenis tylko z myszą (telefon i dotyk przewijają natywnie);
   SILNIKI P1 (03.10.2026, projekt/wzory/SILNIKI.md): nazwane krzywe (reveal/editorial/ui/cover), Lenis lerp .14,
   okno logo w kurtynie (Lando), pierwszy ekran kurczy się do ramki między rzędami napisu (Lando), skośna kurtyna
   #visite → #monika (jjettas), linia przez kroki wizyty ze świecącą głowicą (Orchid);
   TELEPORT w różę medalionu i tor „3 petardy w lewo” (03.10.2026): osobny plik js/petardy.js;
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
    window.EBL_LENIS = lenis;   /* js/efekty.js: przejście kolorem skacze do celu pod zasłoną */
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
  /* SILNIKI-2 #5: bloki odsłaniają wielkie nagłówki (Lando): na każdą linię blok rośnie od lewej (scaleX 0→1, .45 s
     power3.inOut, co .08 s), w chwili pełnego bloku pojawia się tekst, blok chowa się w prawo (1→0, .6 s expo.inOut,
     co .1 s). Blok różowe złoto #D4A49A na granacie, granat #0A142C na lnie. Raz; podział cofany po animacji. */
  var BLOK = { rosnie: .45, co1: .08, znika: .6, co2: .1 };
  function bloki(el, o) {
    o = o || {};
    var s = SplitText.create(el, { type: 'lines', linesClass: 'ebl-linia blok-linia', reduceWhiteSpace: false });
    el.classList.remove('czeka');
    /* na lnie granat; #monika wchodzi jeszcze w nocy (SILNIKI-2 #6), wtedy blok w różowym złocie */
    var noc = el.closest('section') && el.closest('section').querySelector(':scope > .monika-noc');
    var naLnie = !!el.closest('.jasna') && !(noc && +getComputedStyle(noc).opacity > .5);
    var kol = naLnie ? '#0A142C' : '#D4A49A', teksty = [], bl = [];
    s.lines.forEach(function (l) {
      var t = document.createElement('span'); t.className = 'blok-tekst';
      while (l.firstChild) t.appendChild(l.firstChild);
      var b = document.createElement('span'); b.className = 'blok'; b.setAttribute('aria-hidden', 'true'); b.style.background = kol;
      var w = document.createElement('span'); w.className = 'blok-ramka'; w.appendChild(t); w.appendChild(b); l.appendChild(w);
      teksty.push(t); bl.push(b);
    });
    gsap.set(teksty, { opacity: 0 }); gsap.set(bl, { scaleX: 0, transformOrigin: '0% 50%' });
    var tl = gsap.timeline({ delay: o.delay || 0, onComplete: function () { s.revert(); if (o.koniec) o.koniec(); } });
    bl.forEach(function (b, i) {
      var t0 = i * BLOK.co1, t1 = BLOK.rosnie + i * BLOK.co2;
      tl.to(b, { scaleX: 1, duration: BLOK.rosnie, ease: 'power3.inOut' }, t0)
        .set(teksty[i], { opacity: 1 }, t0 + BLOK.rosnie)
        .set(b, { transformOrigin: '100% 50%' }, Math.max(t0 + BLOK.rosnie, t1))
        .to(b, { scaleX: 0, duration: BLOK.znika, ease: 'expo.inOut' }, Math.max(t0 + BLOK.rosnie, t1));
    });
    return tl;
  }
  window.EBL_BLOKI = bloki;   /* js/petardy.js: tytuły paneli w torze (EMS, Cryolipolyse, Première visite) */

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
      else if (o.rodzaj === 'bloki') bloki(el, { delay: d });
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
  var fala = Q('.hero-fala'), pasN = Q('.pas-napisu'), tresc = Q('.hero-tresc'), monH = Q('.hero-monika');
  var RAMA_PC = { fx: 30, fy: 18, s: .08, r: 6, rzedy: true, tekst: true }, RAMA_TEL = { fx: 5, fy: 3, s: 0, r: 14 };
  function rama(p, o) {
    var W = hero.clientWidth, Hh = hero.clientHeight, s = 1 - o.s * p, st = hero.style;
    var fx = W * o.fx / 100 * p, fy = Hh * o.fy / 100 * p;
    var lewa = W / 2 - (W / 2 - fx) * s, dol = Hh / 2 - (Hh / 2 - fy) * s;
    st.setProperty('--fx', fx.toFixed(1) + 'px'); st.setProperty('--fy', fy.toFixed(1) + 'px');
    st.setProperty('--fr', (o.r * p).toFixed(2) + 'px'); st.setProperty('--fs', s.toFixed(4)); st.setProperty('--fp', p.toFixed(3));
    st.setProperty('--pr', Math.max(Math.max(16, (W - 1180) / 2), lewa + 12).toFixed(1) + 'px');
    st.setProperty('--pb', Math.max(14, dol + 12).toFixed(1) + 'px');
    /* Monika (komputer) przesuwa się do środka ramki, gdy ekran kurczy się w ramkę (jak portret u Lando) */
    /* kadr na twarz, nie na środek obrazu: twarz (ok. 58% szerokości obrazu) na osi ramki, czubek głowy z zapasem 6% wysokości
       pod górną krawędzią ramki (--mty: cel dla js/gl.js; --msy: przesunięcie warstwy DOM bez WebGL) */
    if (monH && monH.offsetWidth) {
      st.setProperty('--msx', (W / 2 - (monH.offsetLeft + monH.offsetWidth * .58)).toFixed(1) + 'px');
      var mty = fy + Hh * .06 * p;
      st.setProperty('--mty', mty.toFixed(1) + 'px'); st.setProperty('--msy', Math.max(0, mty - monH.offsetTop).toFixed(1) + 'px');
    }
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
    ['--fx', '--fy', '--fr', '--fs', '--fp', '--pr', '--pb', '--msx', '--mty', '--msy'].forEach(function (v) { hero.style.removeProperty(v); });
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

  /* ---------- kurtyna (SILNIKI-2 #2, 03.10.2026; pomiar na wideo: do treści 5,3 s, 1,8 s stało gotowe logo, 415 ms puste
     kółko, a okno pokazywało pusty granat). Teraz jak okno logo u Lando, razem ok. 2,0 s od startu skryptu:
     0–0,9 s   logo buduje się od dołu jak pasek postępu (jjettas), pod nim jego cień w 12% jasności;
     do 1,2 s  postój (≤ 0,3 s); logo stoi DOKŁADNIE nad twarzą Moniki z pierwszego ekranu (komputer), więc
     1,2 s     w medalionie otwiera się okno i od pierwszej klatki widać przez nie twarz (żywe płótno js/gl.js);
     1,55 s    okno razem z obręczą logo rośnie 0,45 s expo.in do skali ≥ 30 (bez pustego kółka i bez pauzy);
     1,9 s     H1 rusza 0,1 s przed końcem okna. Telefon: logo na środku, ten sam rytm (efekty telefonu bez zmian).
     Bezpiecznik: najpóźniej po 4 s kurtyny nie ma (bez skryptu gaśnie po 4 s z CSS). */
  var poKurtynie = Promise.resolve();
  var KURT = { buduj: .9, okno: 1.2, otworz: .3, rosnie: .45, skala: 30, h1: .1 };
  var LOGO_KOLO = { x: .520, y: .410, r: .400 };   /* medalion Moniki w kapeluszu (03.10.2026 wieczór): wnętrze złotej obręczy na 600×770 */
  var TWARZ = { x: .55, y: .27 };
  function zdejmij() {
    if (!kurtyna) return; kurtyna.remove(); kurtyna = null; kurtynaTrwa = false;
    H.classList.remove('kurtyna-on', 'k-okno-on', 'k-tlo'); if (lenis) lenis.start();
  }
  if (kurtyna && H.classList.contains('kurtyna-on')) {
    kurtynaTrwa = true; if (lenis) lenis.stop();
    var otwarta; poKurtynie = new Promise(function (r) { otwarta = r; });
    setTimeout(function () { zdejmij(); otwarta(); }, 4000);   /* bezpiecznik: najpóźniej po 4 s kurtyny nie ma */
    try { sessionStorage.setItem('ebl-kurtyna', '1'); } catch (e) {}
    try {
      var znak = Q('.k-znak img', kurtyna), pod = Q('.k-pod span', kurtyna), kl = Q('.k-linia', kurtyna);
      if (!znak) throw new Error('brak logo');
      przyTwarzy(znak);
      /* cień logo (12%, bez koloru) = „pusty pasek”, który logo wypełnia od dołu */
      var cien = znak.cloneNode(); cien.className = 'k-cien'; cien.alt = ''; znak.parentNode.insertBefore(cien, znak);
      gsap.timeline()
        .fromTo(znak, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: KURT.buduj, ease: 'power2.inOut' }, 0)
        .fromTo(kl, { scaleX: 0 }, { scaleX: 1, duration: KURT.buduj, ease: 'ebl-io' }, .1)
        .fromTo(pod, { yPercent: -118 }, { yPercent: 0, duration: .6, ease: 'ebl' }, .3);
      gsap.delayedCall(KURT.okno, function () {
        if (!kurtyna) return;
        try { okno(znak, cien, pod, kl); } catch (e) { zdejmij(); otwarta(); }
      });
    } catch (e) { zdejmij(); otwarta(); }
  } else if (kurtyna) { kurtyna.remove(); kurtyna = null; H.classList.remove('kurtyna-on'); }

  /* logo nad twarzą Moniki (komputer): przesunięcie całej kompozycji kurtyny (logo, linia, podpis), żeby środek medalionu
     wypadł na środku owalu twarzy z img/monika-rys-hero.webp (te same ułamki co owal twarzy w js/gl.js: .55 / .27) */
  function przyTwarzy(img) {
    if (innerWidth <= 900 || !monH || !monH.offsetWidth || !hero) return;
    var hr = hero.getBoundingClientRect(), b = img.getBoundingClientRect(); if (!b.width) return;
    var fx = hr.left + monH.offsetLeft + monH.offsetWidth * TWARZ.x, fy = hr.top + monH.offsetTop + monH.offsetHeight * TWARZ.y;
    var dx = fx - (b.left + b.width * LOGO_KOLO.x), dy = fy - (b.top + b.height * LOGO_KOLO.y);
    if (fy - b.height * LOGO_KOLO.y < 8) dy += 8 - (fy - b.height * LOGO_KOLO.y);   /* logo nie wychodzi nad ekran */
    kurtyna.style.setProperty('--kdx', dx.toFixed(1) + 'px'); kurtyna.style.setProperty('--kdy', dy.toFixed(1) + 'px');
    kurtyna.classList.add('k-przy-twarzy');
  }

  /* Okno logo (Lando): wnętrze medalionu staje się oknem na pierwszy ekran (maska kurtyny z dziurą w kształcie koła),
     a potem okno razem z obręczą logo rośnie do pełnego ekranu krzywą expo.in (0,45 s; telefon tak samo).
     Logo nie jest przerysowane: obręcz to ten sam obraz w skali okna.
     LOGO_KOLO: środek i promień wnętrza koła w img/logo-dama-zlota.webp (ułamki szerokości/wysokości obrazu). */
  function okno(img, cien, pod, kl) {
    var b = img.getBoundingClientRect();
    if (!b.width) throw new Error('brak logo');
    var ox = b.left + b.width * LOGO_KOLO.x, oy = b.top + b.height * LOGO_KOLO.y, r0 = b.width * LOGO_KOLO.r;
    var rMax = Math.hypot(Math.max(ox, innerWidth - ox), Math.max(oy, innerHeight - oy)) + 6;
    var rK = Math.max(rMax, r0 * KURT.skala), m = { r: 0 };
    kurtyna.style.setProperty('--ox', ox.toFixed(1) + 'px'); kurtyna.style.setProperty('--oy', oy.toFixed(1) + 'px');
    var ustaw = function () { kurtyna.style.setProperty('--or', m.r.toFixed(1) + 'px'); };
    ustaw(); kurtyna.classList.add('k-okno'); H.classList.add('k-okno-on', 'k-tlo');
    gsap.set([img, cien], { transformOrigin: (LOGO_KOLO.x * 100) + '% ' + (LOGO_KOLO.y * 100) + '%' });
    var t1 = KURT.otworz, t2 = KURT.otworz + KURT.rosnie;
    gsap.timeline({ onComplete: zdejmij })
      .to([pod, kl], { opacity: 0, duration: .25, ease: 'ui' }, 0)
      .to(cien, { opacity: 0, duration: .2, ease: 'ui' }, 0)
      .to(m, { r: r0, duration: KURT.otworz, ease: 'power2.out', onUpdate: ustaw }, 0)
      .to(m, { r: rK, duration: KURT.rosnie, ease: 'expo.in', onUpdate: function () {
        ustaw(); gsap.set(img, { scale: Math.max(1, m.r / r0) });
      } }, t1)
      .to(img, { opacity: 0, duration: KURT.rosnie * .45, ease: 'power2.in' }, t1 + KURT.rosnie * .55)
      .add(function () { H.classList.remove('k-okno-on'); }, t1 + KURT.rosnie * .5)
      .add(function () { kurtynaTrwa = false; otwarta(); }, t2 - KURT.h1);
  }

  function czcionki(ms) { return Promise.race([(document.fonts && document.fonts.ready) || Promise.resolve(), new Promise(function (r) { setTimeout(r, ms); })]); }
  Promise.all([poKurtynie, czcionki(1200)]).then(function () {
    /* js/gl.js: przelot światła przez Monikę (SILNIKI-2 #10) rusza po kurtynie */
    window.EBL_PO_KURTYNIE = true;
    try { document.dispatchEvent(new CustomEvent('ebl:po-kurtynie')); } catch (e) {}
    if (heroEt) wytrzyj(heroEt);
    if (h1) linie(h1, { duration: 1.2, stagger: .1, delay: 0 });
    if (lead) { lead.classList.remove('czeka'); gsap.fromTo(lead, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, delay: .45, ease: 'ebl', clearProps: 'opacity,transform' }); }
    if (podpisH) rysuj(podpisH, { delay: .5, duration: 2.6 });
  });

  /* ---------- nagłówki, etykiety, akapity, zdjęcia ---------- */
  /* wielkie nagłówki sekcji na komputerze: bloki (SILNIKI-2 #5, start 'top 80%'); reszta i telefon: linie spod maski */
  var H2_BLOKI = 'h2.h-blok';   /* index.html: „Comment se passe la première visite”, karta, Monika, pytania, „Prendre rendez-vous” */
  if (matchMedia(KOMPUTER).matches) {
    kolejka(QA('main > section:not(.hero) h2').filter(function (h) { return !h.matches(H2_BLOKI); }), 'linie', 'top 88%');
    kolejka(H2_BLOKI, 'bloki', 'top 80%');
  } else kolejka('main > section:not(.hero) h2', 'linie', 'top 88%');
  /* etykieta manifestu w teleporcie wchodzi razem z manifestem po drugiej stronie portalu (js/petardy.js) */
  kolejka('main > section:not(.hero) .etykieta:not(.portal-druga .etykieta)', 'etykieta', 'top 92%');
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

  /* manifest: słowa wychodzą z portalu w teleporcie (js/petardy.js); na telefonie i bez ruchu stoją od razu */
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

  /* ---------- zabiegi: tor „3 petardy w lewo” (pin + przesuw paneli) jest w js/petardy.js ---------- */

  /* ---------- pierwsza wizyta ---------- */
  var duo = Q('.duo');
  if (duo) {
    gsap.fromTo('.duo-l', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: duo, start: 'top bottom', end: 'bottom 20%', scrub: true } });
    gsap.fromTo('.duo-r', { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: duo, start: 'top bottom', end: 'bottom 20%', scrub: true } });
    gsap.fromTo('.duo-kreska', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: duo, start: 'top 85%', end: 'top 40%', scrub: true } });
  }
  /* kula światła: telefon jak dotąd (płynie z przewijaniem); komputer: SILNIKI-2 #13 (Orchid) większa kula prowadzona
     głowicą linii kroków (niżej, rysujK) */
  var kula = Q('#visite .kula'), kulaX = null, kulaY = null, kulaOn = false;
  if (kula) mm.add({ pc: KOMPUTER, tel: TELEFON }, function (c) {
    if (c.conditions.tel) {
      gsap.fromTo(kula, { yPercent: -38, scale: .78, opacity: .55 }, { yPercent: -60, scale: 1.08, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '#visite', start: 'top bottom', end: 'bottom top', scrub: true } });
      return;
    }
    kula.classList.add('kula-glowa'); kulaOn = true; gsap.set(kula, { xPercent: -50, yPercent: -50 });   /* środek kuli = głowica */
    kulaX = gsap.quickTo(kula, 'x', { duration: .8, ease: 'power3.out' }); kulaY = gsap.quickTo(kula, 'y', { duration: .8, ease: 'power3.out' });
    if (window.EBL_KULA) window.EBL_KULA();
    return function () { kulaOn = false; kulaX = kulaY = null; kula.classList.remove('kula-glowa'); gsap.set(kula, { clearProps: 'transform' }); kula.style.removeProperty('--kp'); };
  });
  kolejka('#visite .kroki li', 'akapit', 'top 92%', 80);

  /* Linia przez kroki wizyty ze świecącą głowicą (Orchid „How it works”, SILNIKI #16): różowozłota linia rysuje się
     scrubem, głowica świeci na jej końcu, krok zapala się (numer w złocie 24K), gdy głowica go mija.
     Cztery kroki w rzędzie: linia pozioma nad kartami; dwie kolumny i telefon: pionowa wzdłuż lewej krawędzi kart. */
  var kroki = Q('#visite .kroki'), wiz0 = Q('#visite');
  if (kroki) {
    var krokiLi = QA('li', kroki), progi = [], stanK = { p: 0 };
    var kOff = [0, 0], kWym = [0, 0], kPion = false;
    var mierzK = function () {
      var pion = krokiLi.length > 1 && krokiLi[1].offsetTop !== krokiLi[0].offsetTop;
      kroki.classList.toggle('pion', pion); kPion = pion;
      var wr = wiz0 && wiz0.getBoundingClientRect(), kr = kroki.getBoundingClientRect();
      if (wr) { kOff = [kr.left - wr.left, kr.top - wr.top]; kWym = [kr.width, kr.height]; }
      var dl = (pion ? kroki.offsetHeight : kroki.offsetWidth) || 1;
      progi = krokiLi.map(function (li) { return ((pion ? li.offsetTop : li.offsetLeft) + 12) / dl; });
    };
    var rysujK = function () {
      kroki.style.setProperty('--kp', stanK.p.toFixed(4));
      /* kula idzie za głowicą linii (quickTo .8 s = scrub .8), kolor różowe złoto → kość słoniowa (--kp w CSS) */
      if (kulaOn && kulaX) {
        kulaX(kOff[0] + (kPion ? 0 : stanK.p * kWym[0])); kulaY(kOff[1] + (kPion ? stanK.p * kWym[1] : -22));
        kula.style.setProperty('--kp', stanK.p.toFixed(3));
      }
      krokiLi.forEach(function (li, i) { li.classList.toggle('zapalony', stanK.p >= progi[i]); });
    };
    kroki.classList.add('z-linia'); mierzK(); rysujK();
    window.EBL_KULA = function () { mierzK(); rysujK(); };
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

  /* SILNIKI-2 #6 (Lando: tło zmienia kolor w trakcie przewijania): #monika wchodzi w granacie i na 60 vh przechodzi w len
     (krzywa „editorial”, scrub .6), tekst w tym samym odcinku z kości słoniowej #F6F0E4 do swojego koloru na lnie
     (#1E1A1C). Warstwa nocy .monika-noc leży pod treścią; skośna krawędź z różowozłotą linią zostaje. Tylko komputer. */
  if (mon) mm.add(KOMPUTER, function () {
    var noc = document.createElement('div'); noc.className = 'monika-noc'; noc.setAttribute('aria-hidden', 'true');
    mon.insertBefore(noc, mon.firstChild); mon.classList.add('z-noca');
    var tx = QA('#monika h2, #monika .cytat p, #monika .monika-tekst > p:not(.etykieta)');
    var kol = tx.map(function (e) { return getComputedStyle(e).color; });
    var st = { trigger: mon, start: 'top 88%', end: function () { return '+=' + Math.round(innerHeight * .6); }, scrub: SCRUB.scrub, invalidateOnRefresh: true };
    var t1 = gsap.fromTo(noc, { opacity: 1 }, { opacity: 0, ease: 'editorial', scrollTrigger: st });
    var t2 = tx.map(function (e, i) { return gsap.fromTo(e, { color: '#F6F0E4' }, { color: kol[i], ease: 'editorial', scrollTrigger: Object.assign({}, st) }); });
    return function () {
      [t1].concat(t2).forEach(function (t) { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); });
      gsap.set(tx, { clearProps: 'color' }); noc.remove(); mon.classList.remove('z-noca');
    };
  });

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
