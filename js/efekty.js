/* Evolution Body Lab: efekty „ultra” (03.10.2026). Daniel: „dawaj ultra bilionerskie efekty”. Mechanika wzorów
   (projekt/wzory/SILNIKI.md: landonorris, jjettas, orchid), kod, shadery i teksty własne. TYLKO komputer (≥ 901 px);
   telefon i ograniczony ruch: nic z tego pliku nie startuje, strona zostaje jak była.
   1. Kursor-soczewka: pierścień różowego złota idzie za myszą z opóźnieniem (quickTo .5 s, power3.out); nad kartami celów
      „Voir”, nad renderem w torze „Réserver” (klik = przycisk panelu), nad torem „Glisser”, nad medalionami soczewka
      (rozjaśnia), nad linkami rośnie. Przyciski pill przyciągają się do kursora (±10 px, power3.out). W kontakcie
      (#contact, kreator) i nad polami formularza pierścień znika, kursor zostaje natywny.
   2. Przejście medalionem (Lando, SILNIKI-2 #11): klik myszą w menu / „Prendre rendez-vous” → granatowe koło z różowozłotą
      krawędzią rośnie od środka (.4 s expo.in), w środku medalion logo; pod zasłoną skok do celu (Lenis immediate),
      potem w medalionie otwiera się okno na nowe miejsce (.33 s expo.out). Razem ≤ .9 s; Esc albo klik przerywa.
   3. Złoty pył WebGL: kilkaset punktów (jedno wywołanie gl.POINTS, ruch liczony w shaderze wierzchołków) w trzech
      głębiach, addytywnie; pierwszy ekran (w ramce .hero-fala, nad twarzą Moniki prawie nic) i teleport (pył leci na
      kamerę razem z przewijaniem). Mysz odpycha, przewijanie przesuwa warstwy wg głębi.
   4. Połysk złota na nagłówkach H2 po wejściu (linie spod maski robi ruch.js) i na cenach w cenniku. Ceny stoją od
      razu (SILNIKI-2: licznik od zera wyłączony, „cena jak wygrana”).
   5. Cele krążą wokół tytułu (Orchid): 4 karty na orbicie 3D, obrót z przewijaniem, pauza po najechaniu.
   6. „Première | visite” rozsypuje się w złote kropki i składa przy przewijaniu (jjettas), napis wchodzi skośną maską.
   7. Medaliony i logo: połysk złota przesuwa się po obręczy (maska ze złotych pikseli obrazu + gradient);
      2,5D z mapy głębi przy najechaniu robi js/gl.js (shader kart).
   8. Pas światła przed kontaktem (Orchid): szeroka smuga różowe złoto → 24K przejeżdża po granacie.
   Formularz i kreator #contact bez animacji wejścia. Plakietki „Image de synthèse” bez zmian.
   Bezpieczniki: dpr ≤ 1,5, rysowanie tylko w kadrze i przy widocznej karcie, samoobrona przy wolnych klatkach,
   błąd WebGL = cicho bez pyłu; bez komunikatów w konsoli. */
(function () {
  'use strict';
  var H = document.documentElement, W = window;
  if (!(W.gsap && W.ScrollTrigger) || !H.classList.contains('ruch-js') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var Q = function (s, r) { return (r || document).querySelector(s); };
  var QA = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var KOMPUTER = '(min-width: 901px)', MYSZ = '(min-width: 901px) and (hover: hover) and (pointer: fine)';
  var mm = gsap.matchMedia();
  var szukaj = location.search || '', SW = /[?&]gl=sw\b/.test(szukaj);
  var stat = W.EBL_FX = { kursor: false, zaslona: 0, pyl: {}, blyski: 0, ceny: 0, orbita: false, kropki: 0, obrecze: 0, pas: false };
  function tekst(k) { var T = W.T || {}, l = H.lang || 'fr'; return (T[l] && T[l][k]) || (T.fr && T.fr[k]) || ''; }
  var sm = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  if (W.CustomEase) CustomEase.create('zaslona', '0.65,0.05,0,1');

  /* ================================================================ 1. KURSOR-SOCZEWKA I MAGNETYCZNE PRZYCISKI */
  mm.add(MYSZ, function () {
    var k = document.createElement('div'); k.className = 'kursor'; k.setAttribute('aria-hidden', 'true');
    k.innerHTML = '<span class="kursor-krag"></span><span class="kursor-slowo"></span>';
    document.body.appendChild(k);
    var slowoEl = Q('.kursor-slowo', k), stan = '', slowo = '', pierwszy = true, ost = null;
    H.classList.add('kursor-on'); stat.kursor = true;
    var xTo = gsap.quickTo(k, 'x', { duration: .5, ease: 'power3.out' }), yTo = gsap.quickTo(k, 'y', { duration: .5, ease: 'power3.out' });
    /* co jest pod kursorem: kolejność ma znaczenie (najpierw miejsca, gdzie pierścień znika) */
    function rozpoznaj(el) {
      if (!el || !el.closest) return ['', ''];
      if (H.classList.contains('kurtyna-on') || H.classList.contains('zaslona-on')) return ['ukryty', ''];
      if (el.closest('#contact, input, textarea, select, label, .rdv, .jezyki')) return ['ukryty', ''];
      var pill = el.closest('.pill');
      if (pill) return ['przycisk', ''];
      if (el.closest('#soins.tor-on .panel-obraz')) return ['slowo', tekst('kursor_reserver')];
      if (el.closest('a, button, summary')) return [el.closest('.cel') ? 'slowo' : 'link', el.closest('.cel') ? tekst('kursor_voir') : ''];
      if (el.closest('.ilustracja-obraz, .monika-foto, .stopka-monika')) return ['soczewka', ''];
      if (el.closest('#soins.tor-on .tor3-scena')) return ['slowo', tekst('kursor_glisser')];
      return ['', ''];
    }
    function ustaw(s, w) {
      if (s !== stan) { k.setAttribute('data-stan', s); stan = s; }
      if (w !== slowo) { slowoEl.textContent = w; slowo = w; }
    }
    function ruch(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      ost = e;
      var r = rozpoznaj(e.target), x = e.clientX, y = e.clientY;
      /* nad przyciskiem pierścień lekko „lepi się” do jego środka */
      if (r[0] === 'przycisk') {
        var b = e.target.closest('.pill').getBoundingClientRect();
        x += (b.left + b.width / 2 - x) * .35; y += (b.top + b.height / 2 - y) * .35;
      }
      if (pierwszy) { gsap.set(k, { x: x, y: y }); pierwszy = false; }
      xTo(x); yTo(y);
      ustaw(r[0], r[1]);
    }
    function poza() { ustaw('ukryty', ''); pierwszy = true; }
    /* po przewinięciu kółkiem element pod kursorem się zmienia, a mysz stoi: odśwież stan */
    function poPrzewinieciu() { if (ost) { var el = document.elementFromPoint(ost.clientX, ost.clientY); if (el) { var r = rozpoznaj(el); ustaw(r[0], r[1]); } } }
    W.addEventListener('pointermove', ruch, { passive: true });
    document.addEventListener('mouseleave', poza);
    W.addEventListener('blur', poza);
    W.addEventListener('scroll', poPrzewinieciu, { passive: true });
    ustaw('ukryty', '');

    /* render w torze: klik = „Réserver ce soin” (zaznacza zabieg w kreatorze) albo „Prendre rendez-vous” w panelu wizyty */
    function klikRender(e) {
      var po = e.target.closest && e.target.closest('#soins.tor-on .panel-obraz'); if (!po || e.button !== 0) return;
      var a = Q('.panel-cta a.pill.solid', po.closest('.panel')); if (!a) return;
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: W, detail: 1, clientX: e.clientX, clientY: e.clientY }));
    }
    document.addEventListener('click', klikRender);

    /* magnetyczne przyciski: ±10 px w stronę kursora, power3.out; kontakt (kreator) bez ruchu */
    var magnesy = QA('.pill').filter(function (b) { return !b.closest('#contact, .rdv'); });
    var sprzezone = magnesy.map(function (b) {
      var bx = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3.out' }), by = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3.out' });
      var w = function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = b.getBoundingClientRect(); if (!r.width) return;
        var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2), dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        bx(Math.max(-1, Math.min(1, dx)) * 10); by(Math.max(-1, Math.min(1, dy)) * 10);
      };
      var l = function () { gsap.to(b, { x: 0, y: 0, duration: .7, ease: 'power3.out', overwrite: true }); };
      b.addEventListener('pointermove', w); b.addEventListener('pointerleave', l);
      return [b, w, l];
    });
    return function () {
      W.removeEventListener('pointermove', ruch); document.removeEventListener('mouseleave', poza); W.removeEventListener('blur', poza);
      W.removeEventListener('scroll', poPrzewinieciu); document.removeEventListener('click', klikRender);
      sprzezone.forEach(function (s) { s[0].removeEventListener('pointermove', s[1]); s[0].removeEventListener('pointerleave', s[2]); gsap.set(s[0], { clearProps: 'transform' }); });
      k.remove(); H.classList.remove('kursor-on'); stat.kursor = false;
    };
  });

  /* ================================================================ 2. PRZEJŚCIE MEDALIONEM (SILNIKI-2 #11) */
  /* Lando zakrywa ekran znakiem „4” i odkrywa nową stronę tym samym znakiem. U nas znak marki to medalion (koło z obręczą
     różowego złota): klik myszą w menu / stopkę / przycisk z kotwicą → granatowy medalion rośnie od środka ekranu
     (skala .2 → 40 średnicy znaku, .4 s expo.in), w środku logo; pod zasłoną skok Lenisa do celu; potem w medalionie
     otwiera się okno na nowe miejsce (.33 s expo.out). Razem ≤ .9 s (było: elipsa 1,2 s). Esc albo klik przerywa. */
  var ZASL = { znak: 75, od: .2, do: 40, zakryj: .4, odkryj: .33, przerwa: .06 };
  mm.add(KOMPUTER, function () {
    var z = document.createElement('div'); z.className = 'zaslona'; z.setAttribute('aria-hidden', 'true');
    z.innerHTML = '<span class="zaslona-brzeg"></span><span class="zaslona-tlo"></span><span class="zaslona-okno"></span>' +
      '<span class="zaslona-znak"><img src="img/logo-dama-zlota.webp" width="600" height="770" alt="" decoding="async"></span>';
    document.body.appendChild(z);
    var znak = Q('.zaslona-znak', z), stanZ = { r: 0, o: 0 }, tl = null, skok = null, bezpiecznik = 0;
    function rysuj() {
      z.style.setProperty('--zr', Math.max(0, stanZ.r).toFixed(1) + 'px');
      z.style.setProperty('--zo', Math.max(0, stanZ.o).toFixed(1) + 'px');
      z.classList.toggle('okno', stanZ.o > .5);
    }
    function koniec() {
      clearTimeout(bezpiecznik); if (tl) { tl.kill(); tl = null; }
      if (skok) { var s = skok; skok = null; s(); }
      z.classList.remove('jest'); H.classList.remove('zaslona-on'); gsap.set(znak, { clearProps: 'all' }); z.style.opacity = '';
      stanZ.r = stanZ.o = 0; rysuj();
      W.removeEventListener('keydown', klawisz, true); W.removeEventListener('pointerdown', przerwij, true);
    }
    function przerwij() { if (!tl) return; tl.kill(); tl = null; if (skok) { var s = skok; skok = null; s(); } gsap.to(z, { opacity: 0, duration: .2, ease: 'power1.out', onComplete: koniec }); }
    function klawisz(e) { if (e.key === 'Escape') przerwij(); }
    function cel(h) { try { return h.length > 1 && document.getElementById(decodeURIComponent(h.slice(1))); } catch (e) { return null; } }
    function klik(e) {
      if (e.defaultPrevented || e.button !== 0 || e.detail === 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('.menu a[href^="#"], .stopka-menu a[href^="#"], a.pill[href^="#"]');
      if (!a || a.closest('#contact')) return;
      var h = a.getAttribute('href'), c = cel(h); if (!c) return;
      e.preventDefault();
      if (tl) { przerwij(); return; }   /* ponowny klik w trakcie: od razu do celu */
      var R = Math.hypot(innerWidth, innerHeight) / 2 + 8, r0 = ZASL.znak, rMax = Math.max(R, r0 * ZASL.do);
      stanZ.r = r0 * ZASL.od; stanZ.o = 0; rysuj();
      z.classList.add('jest'); H.classList.add('zaslona-on'); stat.zaslona++;
      skok = function () {
        if (location.hash !== h) history.pushState(null, '', h);
        var y0 = Math.round(c.getBoundingClientRect().top + W.scrollY);
        if (W.EBL_LENIS) W.EBL_LENIS.scrollTo(y0, { immediate: true, force: true }); else W.scrollTo(0, y0);
        ScrollTrigger.update();
      };
      W.addEventListener('keydown', klawisz, true); W.addEventListener('pointerdown', przerwij, true);
      var t1 = ZASL.zakryj + ZASL.przerwa;
      tl = gsap.timeline({ onComplete: koniec })
        .to(stanZ, { r: rMax, duration: ZASL.zakryj, ease: 'expo.in', onUpdate: rysuj }, 0)
        .fromTo(znak, { opacity: 0, scale: .86 }, { opacity: 1, scale: 1, duration: .16, ease: 'power3.out' }, ZASL.zakryj - .12)
        .add(function () { if (skok) { var s = skok; skok = null; s(); } }, ZASL.zakryj)
        .to(stanZ, { o: R + 4, duration: ZASL.odkryj, ease: 'expo.out', onUpdate: rysuj }, t1)
        .to(znak, { opacity: 0, scale: 1.12, duration: .14, ease: 'power2.in' }, t1);
      bezpiecznik = setTimeout(koniec, 1200);   /* nigdy nie blokuje dłużej niż 1,2 s */
    }
    document.addEventListener('click', klik, true);   /* faza przechwytywania: przed płynnym przejazdem z ruch.js */
    return function () { document.removeEventListener('click', klik, true); koniec(); z.remove(); };
  });

  /* ================================================================ 3. ZŁOTY PYŁ (WebGL, punkty) */
  function bezGL() {
    try { var c = navigator.connection; if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return true; } catch (e) {}
    return /[?&]gl=0\b/.test(szukaj) || !W.WebGLRenderingContext;
  }
  /* aS: x, y (0..1), z = głębia (1 = blisko), w = los. Tryb 0: pole przed obiektywem (pierwszy ekran), tryb 1: tunel
     (teleport: punkty lecą na kamerę z przewijaniem). Mysz odpycha (uM, siła uRep), uCisza = owal, w którym pyłu prawie nie ma. */
  var VS_P = 'attribute vec4 aS;uniform vec2 uRes,uM;uniform vec4 uCisza;uniform float uT,uSc,uDpr,uLot,uTryb,uRep,uI;' +
    'varying float vA,vZ;varying vec3 vC;' +
    'void main(){float z=aS.z,w=aS.w;vec2 p;float s=1.,f=1.;' +
    'if(uTryb<.5){' +
    'vec2 o=vec2(sin(uT*(.05+.08*w)+w*40.)*(16.+44.*z),cos(uT*(.04+.06*z)+w*17.)*(12.+30.*z));' +
    'float Hh=uRes.y*1.3;p=vec2(aS.x*uRes.x*1.1-uRes.x*.05,mod(aS.y*Hh-uT*(3.+10.*z)-uSc*(.08+.6*z),Hh)-uRes.y*.15)+o;' +
    's=1.+4.2*z*z;' +
    '}else{' +
    'float d=fract(z-uLot*1.7-uT*.008);float k=1./(.1+d*1.5);' +
    'vec2 q=(aS.xy*2.-1.)*vec2(uRes.x/uRes.y,1.)*.9;' +
    'p=.5*uRes+q*k*uRes.y*.16+vec2(sin(uT*.2+w*30.),cos(uT*.17+w*11.))*6.;' +
    's=.8+5.5*pow(1.-d,2.2);f=smoothstep(1.,.72,d)*smoothstep(0.,.1,d);z=1.-d;' +
    '}' +
    'vec2 dm=p-uM;float r=length(dm);float pc=uRep*(1.-smoothstep(0.,180.,r))*(.35+.65*z);if(r>.5)p+=dm/r*pc*70.;' +
    'float tw=.55+.45*sin(uT*(.5+1.7*w)+w*60.);' +
    'float ci=mix(.1,1.,smoothstep(.65,1.25,length((p-uCisza.xy)/max(uCisza.zw,vec2(1.)))));' +
    'vA=(.16+.64*z)*tw*uI*ci*f;vZ=z;' +
    'vC=mix(vec3(.831,.643,.604),vec3(.984,.906,.631),step(.52,w));' +
    'gl_PointSize=s*uDpr*(1.+.5*pc);' +
    'gl_Position=vec4(p.x/uRes.x*2.-1.,1.-p.y/uRes.y*2.,0.,1.);}';
  var FS_P = 'precision mediump float;varying float vA,vZ;varying vec3 vC;' +
    'void main(){vec2 q=gl_PointCoord*2.-1.;float d=dot(q,q);if(d>1.)discard;' +
    'float a=exp(-d*mix(5.5,2.4,vZ))*smoothstep(1.,.75,d);' +
    'vec3 c=mix(vC,vec3(1.,.97,.9),exp(-d*16.)*.55);gl_FragColor=vec4(c*a*vA,a*vA);}';

  function pyl(gospodarz, o) {
    if (bezGL()) return null;
    var cv = document.createElement('canvas'); cv.className = 'pyl ' + (o.klasa || ''); cv.setAttribute('aria-hidden', 'true');
    var atr = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false,
      powerPreference: 'high-performance', failIfMajorPerformanceCaveat: !SW };
    var gl = null;
    try { gl = cv.getContext('webgl', atr) || cv.getContext('experimental-webgl', atr); } catch (e) { gl = null; }
    if (!gl) return null;
    function sh(t, zr) { var s = gl.createShader(t); gl.shaderSource(s, zr); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; } return s; }
    var a = sh(gl.VERTEX_SHADER, VS_P), b = sh(gl.FRAGMENT_SHADER, FS_P); if (!a || !b) return null;
    var pg = gl.createProgram(); gl.attachShader(pg, a); gl.attachShader(pg, b); gl.bindAttribLocation(pg, 0, 'aS'); gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return null;
    var u = {}, n = gl.getProgramParameter(pg, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var inf = gl.getActiveUniform(pg, i); u[inf.name] = gl.getUniformLocation(pg, inf.name); }
    /* punkty: stałe losy z ziarnem (ten sam układ przy każdym wejściu), głębia z przewagą dalekich drobin */
    var N = o.ile, dane = new Float32Array(N * 4), ziarno = o.ziarno || 7;
    function los() { ziarno = (ziarno * 16807) % 2147483647; return (ziarno - 1) / 2147483646; }
    for (var j = 0; j < N; j++) { dane[j * 4] = los(); dane[j * 4 + 1] = los(); dane[j * 4 + 2] = Math.pow(los(), 1.8); dane[j * 4 + 3] = los(); }
    var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, dane, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.useProgram(pg); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.clearColor(0, 0, 0, 0);
    gospodarz.appendChild(cv);
    var cw = 1, ch = 1, dpr = 1, raf = 0, widac = false, t0 = performance.now(), ost = 0, sr = 0, nk = 0, rysowane = N, zywy = true;
    var mx = -1e4, my = -1e4, sx = -1e4, sy = -1e4, rep = 0, repCel = 0, ruchT = 0;
    function rozmiar() {
      cw = gospodarz.clientWidth || 1; ch = gospodarz.clientHeight || 1; dpr = Math.min(W.devicePixelRatio || 1, 1.5);
      var w = Math.round(cw * dpr), h = Math.round(ch * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
    function mysz(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = cv.getBoundingClientRect(); if (!r.width) return;
      var kx = cw / r.width, ky = ch / r.height;   /* ramka pierwszego ekranu skaluje płótno (transform) */
      mx = (e.clientX - r.left) * kx; my = (e.clientY - r.top) * ky;
      repCel = mx > -60 && my > -60 && mx < cw + 60 && my < ch + 60 ? 1 : 0; ruchT = performance.now();
      if (sx < -1e3) { sx = mx; sy = my; }
    }
    W.addEventListener('pointermove', mysz, { passive: true });
    function klatka(t) {
      raf = 0; if (!zywy) return;
      var dt = ost ? t - ost : 16.7; ost = t;
      var k = 1 - Math.exp(-dt / 1000 / .14); sx += (mx - sx) * k; sy += (my - sy) * k;
      if (t - ruchT > 2500) repCel = 0;   /* mysz stoi: pył wraca na miejsce */
      rep += (repCel - rep) * (1 - Math.exp(-dt / 1000 / .5));
      var dop = o.co ? o.co() : {};
      gl.viewport(0, 0, cv.width, cv.height); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uRes, cw, ch); gl.uniform2f(u.uM, sx, sy); gl.uniform1f(u.uRep, rep);
      gl.uniform1f(u.uT, (t - t0) / 1000); gl.uniform1f(u.uSc, dop.sc || 0); gl.uniform1f(u.uLot, dop.lot || 0);
      gl.uniform1f(u.uDpr, dpr); gl.uniform1f(u.uTryb, o.tryb || 0); gl.uniform1f(u.uI, dop.i == null ? 1 : dop.i);
      var c = dop.cisza || [-1e4, -1e4, 1, 1]; gl.uniform4f(u.uCisza, c[0], c[1], c[2], c[3]);
      gl.drawArrays(gl.POINTS, 0, rysowane);
      /* samoobrona: średnia klatka > 34 ms → połowa drobin; > 60 ms przy minimum → pył wyłączony */
      if (++nk > 30) {
        sr = sr ? sr * .94 + dt * .06 : dt;
        if (!SW && nk % 30 === 0) {
          if (sr > 34 && rysowane > N / 4) { rysowane = Math.round(rysowane / 2); sr = 0; }
          else if (sr > 60) { api.stop(); return; }
        }
      }
      if (widac && !document.hidden) raf = requestAnimationFrame(klatka);
    }
    function graj() { if (!raf && zywy && widac && !document.hidden) { ost = 0; raf = requestAnimationFrame(klatka); } }
    var io = 'IntersectionObserver' in W ? new IntersectionObserver(function (w) { widac = w[w.length - 1].isIntersecting; graj(); }) : null;
    if (io) io.observe(gospodarz); else { widac = true; }
    var ro = 'ResizeObserver' in W ? new ResizeObserver(rozmiar) : null; if (ro) ro.observe(gospodarz);
    var wid = function () { graj(); }; document.addEventListener('visibilitychange', wid);
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); api.stop(); });
    rozmiar(); graj();
    requestAnimationFrame(function () { cv.classList.add('pyl-on'); });
    var api = { cv: cv, stop: function () {
      zywy = false; if (raf) cancelAnimationFrame(raf); raf = 0; if (io) io.disconnect(); if (ro) ro.disconnect();
      W.removeEventListener('pointermove', mysz); document.removeEventListener('visibilitychange', wid); cv.remove();
    }, ile: function () { return zywy ? rysowane : 0; } };
    return api;
  }
  mm.add(KOMPUTER, function () {
    var lista = [];
    /* pierwszy ekran: w warstwie ramki (kurczy się razem z nią); nad twarzą Moniki prawie bez pyłu */
    var fala = Q('.hero .hero-fala'), mon = Q('.hero-monika');
    if (fala) {
      var p1 = pyl(fala, { ile: 380, tryb: 0, ziarno: 11, klasa: 'pyl-hero', co: function () {
        var c = null;
        if (mon && mon.offsetWidth) c = [mon.offsetLeft + mon.offsetWidth * .52, mon.offsetTop + mon.offsetHeight * .3, mon.offsetWidth * .3, mon.offsetHeight * .3];
        return { sc: W.scrollY || 0, i: H.classList.contains('kurtyna-on') ? 0 : .85, cisza: c };
      } });
      if (p1) { lista.push(p1); stat.pyl.hero = 380; }
    }
    /* teleport: pył leci na kamerę razem z przewijaniem (postęp pinu z js/petardy.js) */
    var scena = Q('#approche.portal-on .portal-scena');
    if (scena) {
      var p2 = pyl(scena, { ile: 460, tryb: 1, ziarno: 29, klasa: 'pyl-portal', co: function () {
        var stP = ScrollTrigger.getAll().filter(function (s) { return s.pin === scena; })[0], p = stP ? stP.progress : 0;
        return { lot: p, i: .3 + .7 * sm(.18, .55, p) - .25 * sm(.85, 1, p) };
      } });
      if (p2) { lista.push(p2); stat.pyl.portal = 460; }
    }
    W.EBL_PYL = lista;
    return function () { lista.forEach(function (p) { p.stop(); }); stat.pyl = {}; };
  });

  /* ================================================================ 4. POŁYSK ZŁOTA NA H2 I LICZNIKI CEN */
  function blysk(el, jasne) {
    if (!el || el.classList.contains('blysk-tekst')) return;
    el.style.setProperty('--c', getComputedStyle(el).color);
    if (jasne) el.classList.add('blysk-ciemny');
    el.classList.add('blysk-tekst'); stat.blyski++;
    var zdejmij = function () { el.classList.remove('blysk-tekst', 'blysk-ciemny'); el.style.removeProperty('--c'); };
    el.addEventListener('animationend', zdejmij, { once: true });
    setTimeout(zdejmij, 2600);
  }
  mm.add(KOMPUTER, function () {
    var st = [];
    /* nagłówki: połysk po tym, jak linie wyjdą spod maski (ruch.js cofa podział po animacji) */
    QA('main > section:not(.hero) h2').forEach(function (h) {
      st.push(ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () {
        var proby = 0;
        (function czekaj() {
          if (h.querySelector('.ebl-linia') || h.classList.contains('czeka')) { if (++proby < 20) setTimeout(czekaj, 150); return; }
          blysk(h, !!h.closest('.jasna'));
        })();
      } }));
    });
    /* ceny w cenniku stoją od razu (SILNIKI-2: licznik od zera wyłączony, „cena jak wygrana”); po wejściu w kadr
       przelatuje po nich tylko połysk złota, co .12 s */
    var el = QA('#cennik .cennik-cena');
    if (el.length) st.push(ScrollTrigger.create({ trigger: '#cennik', start: 'top 82%', once: true, onEnter: function () {
      el.forEach(function (e, i) { setTimeout(function () { blysk(e, false); stat.ceny++; }, 120 * i); });
    } }));
    return function () { st.forEach(function (s) { s.kill(); }); };
  });

  /* ================================================================ 5. CELE NA ORBICIE WOKÓŁ TYTUŁU */
  mm.add(KOMPUTER, function () {
    var cele = Q('#objectifs'), siatka = cele && Q('.siatka4', cele), karty = cele ? QA('.cel', cele) : [];
    if (!siatka || karty.length < 3) return;
    var wr = karty.map(function (k) { var o = document.createElement('div'); o.className = 'cel-orbita'; k.parentNode.insertBefore(o, k); o.appendChild(k); return o; });
    cele.classList.add('orbita'); stat.orbita = true;
    var kat = 0, katCel = 0, dryf = 0, off = 0, zamrozony = null, Rx = 1, Ry = 1, widac = false, ost = 0, n = wr.length;
    function miary() {
      Rx = Math.min(innerWidth * .34, 520); Ry = innerHeight * .19;
      cele.style.setProperty('--orx', Rx.toFixed(0) + 'px'); cele.style.setProperty('--ory', Ry.toFixed(0) + 'px');
    }
    miary();
    var st = ScrollTrigger.create({ trigger: cele, start: 'top top', end: function () { return '+=' + Math.round(innerHeight * 1.5); },
      pin: true, anticipatePin: 1, invalidateOnRefresh: true, onRefresh: miary });
    function rysuj() {
      for (var i = 0; i < n; i++) {
        var a = (kat + i * 360 / n) * Math.PI / 180, zz = Math.cos(a), p = (zz + 1) / 2;
        var x = Rx * Math.sin(a), y = Ry * zz, s = .72 + .28 * p;
        var o = wr[i].style;
        o.transform = 'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) perspective(900px) rotateY(' + (-Math.sin(a) * 24).toFixed(2) + 'deg) scale(' + s.toFixed(4) + ')';
        /* z tyłu i za tytułem prawie znika: tytuł i etykieta zawsze czytelne */
        o.opacity = ((.5 + .5 * Math.pow(p, 1.3)) * (zz < 0 ? 1 - .55 * Math.pow(1 - Math.abs(Math.sin(a)), 1.5) : 1)).toFixed(3);
        o.zIndex = zz > 0 ? 3 : 1;
        o.filter = p < .5 ? 'blur(' + ((.5 - p) * 2).toFixed(2) + 'px)' : '';
        wr[i].classList.toggle('z-przodu', p > .82);
      }
    }
    function tik() {
      var t = performance.now(), dt = ost ? Math.min(.1, (t - ost) / 1000) : .016; ost = t;
      var z = st.progress * 360 - 40;
      if (zamrozony != null) off = zamrozony - (z + dryf);
      else { dryf += dt * 3.5; off *= Math.exp(-dt / .9); }
      katCel = z + dryf + off;
      kat += (katCel - kat) * (1 - Math.exp(-dt / .18));
      rysuj();
    }
    var io = new IntersectionObserver(function (w) {
      var v = w[w.length - 1].isIntersecting;
      if (v && !widac) { ost = 0; gsap.ticker.add(tik); } else if (!v && widac) gsap.ticker.remove(tik);
      widac = v;
    }, { rootMargin: '10% 0px' });
    io.observe(cele);
    var wej = function () { zamrozony = katCel; cele.classList.add('pauza'); }, wyj = function () { zamrozony = null; cele.classList.remove('pauza'); };
    wr.forEach(function (w) { w.addEventListener('pointerenter', wej); w.addEventListener('pointerleave', wyj); w.addEventListener('focusin', wej); w.addEventListener('focusout', wyj); });
    katCel = kat = st.progress * 360 - 40; rysuj();
    ScrollTrigger.sort(); ScrollTrigger.refresh();
    return function () {
      io.disconnect(); gsap.ticker.remove(tik); st.kill(true);
      wr.forEach(function (w) { var k = w.firstElementChild; w.parentNode.insertBefore(k, w); w.remove(); });
      cele.classList.remove('orbita', 'pauza'); cele.style.removeProperty('--orx'); cele.style.removeProperty('--ory'); stat.orbita = false;
    };
  });

  /* ================================================================ 6. „PREMIÈRE | VISITE” Z ZŁOTYCH KROPEK */
  mm.add(KOMPUTER, function () {
    var duo = Q('#visite .duo'), sek = Q('#visite'); if (!duo || !sek) return;
    var czesci = QA('.duo-l, .duo-r', duo); if (czesci.length < 2) return;
    var cv = document.createElement('canvas'); cv.className = 'kropki'; cv.setAttribute('aria-hidden', 'true');
    sek.insertBefore(cv, duo); duo.classList.add('kropki-on');
    var ctx = cv.getContext('2d'), kropki = [], stan = { a: 0, b: 0 }, dpr = 1, gotowe = false, KR = 4.6, NAD = 240, POD = 300;
    /* okrągłe drobiny z miękkim brzegiem (sprite), nie kwadraty: kość słoniowa, różowe złoto, 24K */
    var SPR = {};
    ['#F6F0E4', '#D4A49A', '#FBE7A1'].forEach(function (k) {
      var c = document.createElement('canvas'); c.width = c.height = 16; var x = c.getContext('2d'), g = x.createRadialGradient(8, 8, 0, 8, 8, 8);
      g.addColorStop(0, k); g.addColorStop(.55, k); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 16, 16); SPR[k] = c;
    });
    var ziarno = 3; function los() { ziarno = (ziarno * 16807) % 2147483647; return (ziarno - 1) / 2147483646; }
    function maska(el, w) {
      var W1 = (w * 118).toFixed(2);
      el.style.clipPath = w >= 1 ? '' : 'polygon(0 -15%, ' + W1 + '% -15%, ' + (w * 118 - 18).toFixed(2) + '% 115%, 0 115%)';
    }
    function probkuj() {
      kropki = []; ziarno = 3;
      czesci.forEach(function (el, j) {
        var cs = getComputedStyle(el), w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
        var c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h);
        var x = c.getContext('2d'), t = el.textContent || '';
        if (cs.textTransform === 'uppercase') t = t.toUpperCase();
        x.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        if ('letterSpacing' in x) x.letterSpacing = cs.letterSpacing;
        x.textBaseline = 'alphabetic'; x.fillStyle = '#fff';
        var m = x.measureText(t), asc = m.actualBoundingBoxAscent || parseFloat(cs.fontSize) * .7, desc = m.actualBoundingBoxDescent || 0;
        var y0 = (h + asc - desc) / 2;
        x.fillText(t, (w - m.width) / 2 > 0 ? (w - m.width) / 2 : 0, y0);
        var d = x.getImageData(0, 0, c.width, c.height).data, kol = j ? [212, 164, 154] : [246, 240, 228];
        for (var yy = KR / 2; yy < c.height; yy += KR) for (var xx = KR / 2; xx < c.width; xx += KR) {
          if (d[((yy | 0) * c.width + (xx | 0)) * 4 + 3] < 120) continue;
          var kierunek = j ? 1 : -1;
          kropki.push({ j: j, tx: xx, ty: yy, ox: xx + kierunek * (60 + los() * 320) + (los() - .5) * 80, oy: yy + (los() - .2) * 260,
            ex: xx + (los() - .5) * 220, ey: yy - 80 - los() * 220, d: los() * .38, r: .7 + los() * .9, z: los() < .16, kol: kol });
        }
      });
      stat.kropki = kropki.length; gotowe = true;
    }
    function rozmiar() {
      dpr = Math.min(W.devicePixelRatio || 1, 1.5);
      var top = Math.max(0, duo.offsetTop - NAD), h = duo.offsetHeight + NAD + POD;
      cv.style.top = top + 'px'; cv.style.height = h + 'px';
      cv.width = Math.round(sek.clientWidth * dpr); cv.height = Math.round(h * dpr);
      probkuj(); rysuj();
    }
    var e3 = function (x) { return 1 - Math.pow(1 - x, 3); };
    function rysuj() {
      if (!gotowe) return;
      var a = stan.a, b = stan.b, w = sm(.8, 1, a) * (1 - sm(0, .3, b));
      czesci.forEach(function (el) { maska(el, w); });
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      var widoczne = 1 - w; if (widoczne < .01 || (a < .001 && b < .001)) return;
      var cr = cv.getBoundingClientRect(), baz = czesci.map(function (el) { var r = el.getBoundingClientRect(); return [r.left - cr.left, r.top - cr.top]; });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (var i = 0; i < kropki.length; i++) {
        var k = kropki[i], ea = e3(Math.max(0, Math.min(1, (a - k.d) / .62))), eb = e3(Math.max(0, Math.min(1, (b - k.d * .5) / .7)));
        if (ea <= 0) continue;
        var x = k.ox + (k.tx - k.ox) * ea, y = k.oy + (k.ty - k.oy) * ea;
        x += (k.ex - k.tx) * eb; y += (k.ey - k.ty) * eb;
        var al = ea * (1 - eb) * widoczne * (k.z ? 1 : .82);
        if (al < .02) continue;
        ctx.globalAlpha = al;
        var r = k.r * 1.5 * (k.z ? 1.25 : 1) * (1 + (1 - ea) * .8);
        ctx.drawImage(SPR[k.z ? '#FBE7A1' : (k.j ? '#D4A49A' : '#F6F0E4')], baz[k.j][0] + x - r, baz[k.j][1] + y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    }
    var tw1 = gsap.to(stan, { a: 1, ease: 'none', onUpdate: rysuj, scrollTrigger: { trigger: duo, start: 'top 96%', end: 'top 42%', scrub: .6 } });
    var tw2 = gsap.to(stan, { b: 1, ease: 'none', onUpdate: rysuj, scrollTrigger: { trigger: duo, start: 'bottom 34%', end: 'bottom -12%', scrub: .6 } });
    var gotoweF = (document.fonts && document.fonts.ready) || Promise.resolve();
    gotoweF.then(function () { rozmiar(); });
    var naRefresh = function () { if (gotowe) rozmiar(); };
    ScrollTrigger.addEventListener('refresh', naRefresh);
    maska(czesci[0], 0); maska(czesci[1], 0);
    return function () {
      tw1.scrollTrigger && tw1.scrollTrigger.kill(); tw1.kill(); tw2.scrollTrigger && tw2.scrollTrigger.kill(); tw2.kill();
      ScrollTrigger.removeEventListener('refresh', naRefresh);
      czesci.forEach(function (el) { el.style.clipPath = ''; }); cv.remove(); duo.classList.remove('kropki-on'); stat.kropki = 0;
    };
  });

  /* ================================================================ 7. POŁYSK ZŁOTA PO OBRĘCZY MEDALIONÓW I LOGO */
  /* maska = złote piksele obrazu (ciepłe, jasne, nieprzezroczyste), w medalionach tylko zewnętrzny pierścień;
     liczona raz z pomniejszonej kopii (256 px), plik obrazu bez zmian */
  function maskaZlota(img, pierscien) {
    var w = 256, h = Math.max(1, Math.round(256 * img.naturalHeight / img.naturalWidth));
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h);
    var id; try { id = x.getImageData(0, 0, w, h); } catch (e) { return null; }
    var d = id.data, ile = 0;
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
      var i = (yy * w + xx) * 4, r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      var zl = a > 150 && r > 110 && r - b > 50 && g - b > 18 && r >= g ? Math.min(1, (r - b - 50) / 60) * Math.min(1, (r + g) / 330) : 0;
      if (pierscien) { var dx = xx / w - .5, dy = yy / h - .5; zl *= sm(.37, .44, Math.sqrt(dx * dx + dy * dy)); }
      d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.round(zl * 255); if (zl > .1) ile++;
    }
    if (ile < 40) return null;
    x.putImageData(id, 0, 0);
    return c.toDataURL('image/png');
  }
  mm.add(KOMPUTER, function () {
    var dodane = [];
    var cele = QA('.ilustracja-obraz').map(function (el) { return [el, Q('img', el), true]; })
      .concat(QA('.naglowek .logo-obraz, .stopka-logo .logo-obraz').map(function (el) { return [el, Q('img', el), false]; }));
    var io = new IntersectionObserver(function (w) { w.forEach(function (e) { e.target.classList.toggle('obrecz-widac', e.isIntersecting); }); });
    cele.forEach(function (c) {
      var el = c[0], img = c[1]; if (!img) return;
      var zrob = function () {
        if (!img.naturalWidth || Q('.obrecz-blysk', el)) return;
        var m = maskaZlota(img, c[2]); if (!m) return;
        var s = document.createElement('span'); s.className = 'obrecz-blysk'; s.setAttribute('aria-hidden', 'true');
        s.style.webkitMaskImage = s.style.maskImage = 'url(' + m + ')';
        var pl = Q('.plakietka', el); el.insertBefore(s, pl || null);
        el.classList.add('z-obrecza'); io.observe(el); dodane.push([el, s]); stat.obrecze++;
      };
      if (img.complete && img.naturalWidth) zrob(); else img.addEventListener('load', zrob, { once: true });
    });
    return function () { io.disconnect(); dodane.forEach(function (d) { d[1].remove(); d[0].classList.remove('z-obrecza', 'obrecz-widac'); }); stat.obrecze = 0; };
  });

  /* ================================================================ 8. PAS ŚWIATŁA PRZED KONTAKTEM */
  mm.add(KOMPUTER, function () {
    var c = Q('#contact'); if (!c) return;
    var pas = document.createElement('div'); pas.className = 'pas-swiatla'; pas.setAttribute('aria-hidden', 'true');
    pas.innerHTML = '<i class="pas-smuga"></i><i class="pas-nic"></i>';
    c.insertBefore(pas, c.firstChild); c.classList.add('z-pasem'); stat.pas = true;
    var smuga = Q('.pas-smuga', pas), nic = Q('.pas-nic', pas);
    var tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 96%', end: 'top 18%', scrub: .6 } })
      .fromTo(nic, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, ease: 'none', duration: .45 }, 0)
      .fromTo(smuga, { xPercent: -42, scaleX: .2, opacity: 0 }, { xPercent: 0, scaleX: 1, opacity: 1, ease: 'none', duration: .55 }, 0)
      .to(smuga, { xPercent: 36, opacity: .38, ease: 'none', duration: .45 }, .55)
      .to(nic, { opacity: .5, ease: 'none', duration: .45 }, .55);
    return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); pas.remove(); c.classList.remove('z-pasem'); stat.pas = false; };
  });

  ScrollTrigger.sort();
  ScrollTrigger.refresh();
})();
