/* Evolution Body Lab: TELEPORT i „3 PETARDY W LEWO” (03.10.2026). Daniel o landonorris.com / jjettas.com:
   „3 petardy w lewą stronę, przewijanie w dół, wejście przez okulary jak teleport”. Mechanika wzorów, kod i shadery własne.

   1. TELEPORT (#approche): scena przypięta na PIN_PORTAL ekranów. Czas = przewijanie (scrub), płynnie w obie strony.
      0–.62  kamera wjeżdża w różę medalionu damy (img/ilustracje/dama-roza-900.webp): 2,5D z mapy głębi
             (img/glebia/dama-roza-900-glebia.webp, jasne = blisko), bliskie warstwy rosną szybciej niż dalekie, lekki obrót
             spiralą, zoom wykładniczy (stała „prędkość lotu”) do ZOOM_MAX; od .3 rozmycie promieniste i rozszczepienie barw;
      .54–.8 trzy złote obręcze (złoto 24K → różowe złoto) przelatują przez kadr, .635 rozbłysk (biel → 24K → różowe złoto);
      .62–1  druga strona: czysty głęboki granat (Daniel 03.10.2026: „zamiast tego kamienia czysty ciemnogranatowy tło”),
             liczony w shaderze, bez obrazu: złoty pył w trzech warstwach głębi wylatuje z tunelu (zoom 5 → 1), pierścienie
             światła rozchodzą się powoli od środka, ziarno przeciw pasom gradientu; manifest wychodzi z portalu słowo po
             słowie (skala .42 → 1, rozmycie 16 → 0 px), potem chwila na czytanie. Plakietka gaśnie razem z różą.
      Mysz: paralaksa 2,5D (tylko komputer z myszą). Plakietka „Image de synthèse” stoi w rogu, dopóki widać ilustrację.
   2. TOR (#soins): scena przypięta na PIN_TOR ekranów; przewijanie w dół przesuwa 3 pełnoekranowe panele w lewo
      odcinkami „petarda” (krzywa .7,0,.2,1: wolny start, strzał, miękkie lądowanie), między nimi postój; obraz w panelu
      jedzie wolniej niż panel (paralaksa .42), tytuł szybciej (.22), numer jeszcze szybciej, tytuł pochyla się z prędkością
      przewijania; wielki napis w tle jedzie w prawo; licznik 01/03 w złocie 24K, pasek postępu różowym złotem.
   Tylko komputer (min-width 901 px) z ruchem: telefon i ograniczony ruch = statyczny układ z css/paleta.css (decyzja
   Daniela 03.10.2026: najpierw desktop). Bez WebGL teleport jedzie warstwą DOM (zoom obrazu, rozmycie, błysk CSS).
   Bezpieczniki WebGL jak w js/gl.js: ograniczony ruch / oszczędzanie danych / brak GL / błąd shadera / utrata kontekstu
   / za wolne klatki → wersja DOM, bez komunikatów w konsoli; dpr ≤ 1,5; rysowanie tylko, gdy scena jest w kadrze. */
(function () {
  'use strict';
  var H = document.documentElement, W = window;
  if (!(W.gsap && W.ScrollTrigger) || !H.classList.contains('ruch-js') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (W.CustomEase) CustomEase.create('petarda', '0.7,0,0.2,1');
  var Q = function (s, r) { return (r || document).querySelector(s); };
  var QA = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var KOMPUTER = '(min-width: 901px)';
  var PIN_PORTAL = 2.8, PIN_TOR = 3.4;                  /* długość pinów w wysokościach ekranu (vh / 100) */
  var ROZA = [.33, .673];                               /* środek czerwonej róży w medalionie Moniki (dama-roza-900.webp od 03.10.2026, u, v) */
  var ZOOM_MAX = 64, ZOOM_DOM = 14;
  var mm = gsap.matchMedia();
  var MYSZ = matchMedia('(hover: hover) and (pointer: fine)');
  var sm = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function nav() { var n = Q('.naglowek'); H.style.setProperty('--nav', (n ? n.offsetHeight : 80) + 'px'); }
  nav(); W.addEventListener('resize', nav);

  /* ================================================================ WebGL teleportu (osobny lekki kontekst) */
  var szukaj = location.search || '', SW = /[?&]gl=sw\b/.test(szukaj);
  function bezGL() {
    try { var c = navigator.connection; if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return true; } catch (e) {}
    return /[?&]gl=0\b/.test(szukaj) || !W.WebGLRenderingContext;
  }
  var VS = 'attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}';
  var FS = 'precision highp float;varying vec2 vUv;' +
    'uniform sampler2D uImg,uGl;uniform vec2 uRes,uFok,uMysz,uOff;uniform float uP,uCzas,uS,uN,uZmax;' +
    'float sm(float a,float b,float x){return smoothstep(a,b,x);}' +
    'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}' +
    'float glb(vec2 u){return texture2D(uGl,clamp(u,0.,1.)).r;}' +
    'vec4 med(vec2 u){vec4 c=texture2D(uImg,clamp(u,0.,1.));float w=step(0.,u.x)*step(u.x,1.)*step(0.,u.y)*step(u.y,1.);return vec4(c.rgb*c.a,c.a)*w;}' +
    /* złoty pył: jedna warstwa siatki z losowymi drobinami (kolor z palety: różowe złoto → 24K) */
    'vec3 pyl(vec2 q,float sk,float s){q*=sk;vec2 c=floor(q),f=fract(q)-.5;float h=hash(c+s);if(h<.84)return vec3(0.);' +
    'vec2 o=vec2(hash(c+s+1.7),hash(c+s+4.3))-.5;float d=length(f-o*.6);float r=.02+.05*hash(c+s+9.1);' +
    'float tw=.55+.45*sin(uCzas*(1.+2.*hash(c+s+2.2))+h*40.);return mix(vec3(.831,.643,.604),vec3(.984,.906,.631),hash(c+s+5.5))*smoothstep(r,0.,d)*tw;}' +
    'vec3 zl(float x){x=clamp(x,0.,1.);vec3 c=mix(vec3(.55,.33,.27),vec3(.831,.643,.604),sm(0.,.4,x));' +
    'c=mix(c,vec3(.89,.71,.28),sm(.35,.7,x));return mix(c,vec3(.984,.906,.631),sm(.7,1.,x));}' +
    'void main(){' +
    'vec2 px=(vec2(vUv.x,1.-vUv.y)-.5)*uRes;float mn=min(uRes.x,uRes.y);float r=length(px)/mn;' +
    'float p=uP;float t1=clamp(p/.62,0.,1.);float e=pow(t1,1.75);float Z=exp(log(uZmax)*e);' +
    /* spirala: obrót kadru rośnie z kwadratem drogi */
    'float an=e*e*.55;vec2 pr=mat2(cos(an),-sin(an),sin(an),cos(an))*(px-uOff*(1.-sm(0.,.5,t1)));' +
    'vec2 F=mix(vec2(.5),uFok,sm(0.,.55,t1));float k=.18+1.9*e;' +
    'vec2 par=(uMysz*.016+vec2(sin(uCzas*.23),cos(uCzas*.19))*.0025)*(1.-t1);' +
    'vec2 q=pr/uS;vec2 uv=F+q/Z;' +
    /* twarz Moniki (owal w medalionie, liczony bez głębi): płaska warstwa, bez rozciągania głębią, rozmycia i rozszczepienia */
    'float fm=sm(1.35,.95,length((uv-vec2(.53,.30))/vec2(.2,.25)));' +
    'for(int i=0;i<3;i++){float d=mix(glb(uv),.5,fm);uv=F+q/(Z*(1.+k*(d-.5)))+par*(d-.45)*(1.-fm);}' +
    /* rozmycie promieniste wokół punktu ogniskowego + rozszczepienie barw */
    'float bl=.5*sm(.3,.62,p)*(1.-sm(.62,.66,p))*(1.-fm);float ca=(.012*sm(.25,.6,p)+.004*sm(.0,.3,p))*(1.-fm);' +
    'vec3 acc=vec3(0.);float aa=0.;float n=0.;' +
    'for(int i=0;i<20;i++){if(float(i)>=uN)break;float f=1.-bl*float(i)/max(uN,1.);vec2 d=(uv-F)*f;' +
    'vec4 cr=med(F+d*(1.+ca)),cg=med(F+d),cb=med(F+d*(1.-ca));acc+=vec3(cr.r,cg.g,cb.b);aa+=cg.a;n+=1.;}' +
    'acc/=n;aa/=n;' +
    /* połysk złota wędrujący po medalionie (tylko przed wjazdem) */
    'float sh=pow(max(0.,1.-abs(dot(q,vec2(.8,.6))-mod(uCzas*.16,2.6)+1.3)*3.),6.)*.22*(1.-t1);' +
    'vec3 bg=mix(vec3(.047,.086,.180),vec3(.020,.037,.082),sm(.05,1.05,r*1.1))+vec3(.83,.64,.6)*.06*sm(.75,.0,r)*(1.-t1);' +
    'vec3 A=bg*(1.-aa)+acc+acc*sh;' +
    /* tunel: winieta zaciska się w czerwieni róży */
    'A*=1.-.75*sm(.25,.95,r)*sm(.2,.62,t1);' +
    /* druga strona: czysty granat z głębią (bez obrazu): ciemniejsze brzegi, ledwo jaśniejszy środek, pył i pierścienie */
    'float t2=clamp((p-.62)/.33,0.,1.);float e2=1.-pow(1.-t2,3.);float Z2=mix(5.,1.,e2);' +
    'vec2 g=px/mn;vec2 gm=g+uMysz*.012;' +
    'vec3 B=mix(vec3(.047,.086,.180),vec3(.020,.037,.082),sm(.05,1.05,length(g*vec2(.82,1.))));' +
    'B+=vec3(.831,.643,.604)*.035*exp(-dot(g,g)*5.);' +
    'vec3 P=vec3(0.);for(int i=0;i<3;i++){float fi=float(i);float z=Z2*(1.+fi*.55);' +
    'vec2 qd=gm*(1.+fi*.18)/z*(1.+.05*sin(uCzas*.1+fi))+vec2(uCzas*.004*(fi+1.),-uCzas*.006);' +
    'P+=pyl(qd,26.+fi*14.,fi*17.)*(.55-fi*.13);}' +
    'B+=P*(.35+.65*e2)*(1.-.75*sm(.42,.0,length(g*vec2(.62,1.))));' +
    /* pierścienie światła: rozchodzą się powoli od środka, przygasają z promieniem */
    'for(int j=0;j<3;j++){float R=fract(uCzas*.035+float(j)/3.)*1.5;float w=.0035+.012*R;' +
    'B+=vec3(.831,.643,.604)*exp(-pow((length(g)-R)/w,2.))*.07*(1.-R/1.5)*sm(0.,.15,R);}' +
    'vec3 c=mix(A,B,sm(.615,.655,p));' +
    /* trzy złote obręcze lecą przez kadr (różne promienie dla R/G/B = aberracja) */
    'float rg=0.;vec3 rc=vec3(0.);for(int j=0;j<3;j++){float o=.54+float(j)*.04;float R=(p-o)*7.;' +
    'if(R>0.){float w=.006+.05*R;float fade=(1.-sm(.72,.82,p))*sm(0.,.05,R);' +
    'vec3 ri=vec3(exp(-pow((r*1.012-R)/w,2.)),exp(-pow((r-R)/w,2.)),exp(-pow((r*.988-R)/w,2.)));' +
    'float a=atan(px.y,px.x);rc+=ri*zl(.55+.45*sin(a*2.+float(j)*2.1+uCzas*.6))*fade*(1.2-float(j)*.25);}}' +
    'c+=rc;' +
    /* rozbłysk: biel w środku, złoto 24K, różowe złoto na brzegu */
    'float fl=exp(-pow((p-.635)/.032,2.));vec3 fc=mix(vec3(.831,.643,.604),vec3(.984,.906,.631),sm(.7,.1,r));fc=mix(fc,vec3(1.,.99,.95),sm(.3,.0,r));' +
    'c=c*(1.-.6*fl)+fc*fl*(1.6-r);' +
    /* ziarno ok. ±1,5/255: na ciemnym gradiencie nie ma pasów */
    'c+=(hash(px+fract(uCzas*.37))-.5)*3./255.;gl_FragColor=vec4(c,1.);}';

  function silnikPortalu(scena) {
    if (bezGL()) return null;
    var cv = document.createElement('canvas'); cv.className = 'portal-gl'; cv.setAttribute('aria-hidden', 'true');
    var atr = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false,
      powerPreference: 'high-performance', failIfMajorPerformanceCaveat: !SW };
    var gl = null;
    try { gl = cv.getContext('webgl', atr) || cv.getContext('experimental-webgl', atr); } catch (e) { gl = null; }
    if (!gl) return null;
    function sh(t, z) { var s = gl.createShader(t); gl.shaderSource(s, z); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; } return s; }
    var pg = null, u = {}, tex = [], gotowe = false, raf = 0, aktywny = false, widac = false, stanP = 0, dpr = 1, N = 16;
    function zbuduj() {
      var a = sh(gl.VERTEX_SHADER, VS), b = sh(gl.FRAGMENT_SHADER, FS); if (!a || !b) return false;
      pg = gl.createProgram(); gl.attachShader(pg, a); gl.attachShader(pg, b); gl.bindAttribLocation(pg, 0, 'aPos'); gl.linkProgram(pg);
      if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return false;
      var n = gl.getProgramParameter(pg, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var inf = gl.getActiveUniform(pg, i); u[inf.name] = gl.getUniformLocation(pg, inf.name); }
      var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      for (var j = 0; j < 2; j++) {
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(j === 1 ? [128, 128, 128, 255] : [0, 0, 0, 0]));
        tex.push(t);
      }
      return true;
    }
    if (!zbuduj()) return null;
    function obraz(src) {
      return new Promise(function (ok, zle) { var i = new Image(); i.decoding = 'async'; i.onload = function () { ok(i); }; i.onerror = zle; i.src = src; });
    }
    var ZR = ['img/ilustracje/dama-roza-900.webp', 'img/glebia/dama-roza-900-glebia.webp'];
    var wczytane = null;
    function wczytaj() {
      if (wczytane) return wczytane;
      wczytane = Promise.all(ZR.map(function (s, j) {
        return obraz(s).then(function (im) {
          if (gl.isContextLost()) return;
          gl.bindTexture(gl.TEXTURE_2D, tex[j]); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        });
      }));
      return wczytane;
    }
    var cw = 1, ch = 1, medS = 1, medO = [0, 0];
    function rozmiar() {
      cw = scena.clientWidth || 1; ch = scena.clientHeight || 1; dpr = Math.min(W.devicePixelRatio || 1, 1.5);
      var med = scena.querySelector('.portal-medalion'); medS = (med && med.offsetWidth) || Math.min(cw, ch) * .74;
      medO = med ? [med.offsetLeft - cw / 2, med.offsetTop - ch / 2] : [0, 0];   /* środek medalionu (translate -50% nie zmienia offsetów) */   /* ten sam rozmiar co obraz DOM */
      var w = Math.round(cw * dpr), h = Math.round(ch * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
    var mx = 0, my = 0, sx = 0, sy = 0, t0 = performance.now(), ost = 0, sr = 0, nk = 0;
    W.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
    }, { passive: true });
    function rysuj(t) {
      if (gl.isContextLost()) return;
      var dt = ost ? t - ost : 16.7; ost = t;
      var k = 1 - Math.exp(-dt / 1000 / .45); sx += (mx - sx) * k; sy += (my - sy) * k;
      gl.viewport(0, 0, cv.width, cv.height); gl.useProgram(pg);
      gl.uniform2f(u.uRes, cw, ch); gl.uniform2f(u.uFok, ROZA[0], ROZA[1]); gl.uniform2f(u.uMysz, sx, sy);
      gl.uniform1f(u.uP, stanP); gl.uniform1f(u.uCzas, (t - t0) / 1000); gl.uniform1f(u.uS, medS); gl.uniform2f(u.uOff, medO[0], medO[1]);
      gl.uniform1f(u.uN, N); gl.uniform1f(u.uZmax, ZOOM_MAX);
      ['uImg', 'uGl'].forEach(function (n, j) { gl.activeTexture(gl.TEXTURE0 + j); gl.bindTexture(gl.TEXTURE_2D, tex[j]); gl.uniform1i(u[n], j); });
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      /* samoobrona: średnia klatka > 40 ms → mniej próbek rozmycia; > 90 ms przy 6 próbkach → wersja DOM */
      if (++nk > 20) {
        sr = sr ? sr * .94 + dt * .06 : dt;
        if (!SW && nk % 30 === 0) {
          if (sr > 40 && N > 6) { N = Math.max(6, N - 5); sr = 0; }
          else if (sr > 90 && N <= 6) wylacz();
        }
      }
    }
    function petla(t) { raf = 0; rysuj(t); if ((aktywny || widac) && !document.hidden) raf = requestAnimationFrame(petla); }
    function graj() { if (!raf && gotowe && (aktywny || widac) && !document.hidden) raf = requestAnimationFrame(petla); }
    var api = { gotowy: false };
    function wylacz() { if (raf) cancelAnimationFrame(raf); raf = 0; api.gotowy = false; gotowe = false; scena.classList.remove('portal-gl-on'); if (api.onWylacz) api.onWylacz(); }
    api.ustaw = function (p) { stanP = p; if (gotowe && !raf) graj(); };
    api.aktywny = function (a) { aktywny = a; graj(); };
    api.start = function () {
      if (cv.parentNode !== scena) scena.insertBefore(cv, scena.firstChild);
      rozmiar();
      wczytaj().then(function () {
        if (gl.isContextLost()) return;
        gotowe = true; api.gotowy = true; rysuj(performance.now());
        requestAnimationFrame(function () { if (gotowe) scena.classList.add('portal-gl-on'); });
        graj();
      }, function () { wylacz(); });
    };
    api.stop = function () { if (raf) cancelAnimationFrame(raf); raf = 0; scena.classList.remove('portal-gl-on'); if (cv.parentNode) cv.remove(); };
    if ('ResizeObserver' in W) new ResizeObserver(function () { if (cv.parentNode) { rozmiar(); if (gotowe) rysuj(performance.now()); } }).observe(scena);
    if ('IntersectionObserver' in W) new IntersectionObserver(function (w) { widac = w[w.length - 1].isIntersecting; graj(); }).observe(scena);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) graj(); });
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); wylacz(); });
    return api;
  }

  /* ================================================================ 1. TELEPORT */
  var portal = Q('#approche.portal'), pScena = portal && Q('.portal-scena', portal);
  var silnik = null, silnikProba = false;
  if (pScena) mm.add(KOMPUTER, function () {
    var img = Q('.portal-obraz img', pScena), blysk = Q('.portal-blysk', pScena), wsk = Q('.portal-wskazowka', pScena),
        et = Q('.portal-druga .etykieta', pScena), tekst = Q('.portal-druga .manifest-tekst', pScena),
        plak = Q(':scope > .plakietka', pScena);
    portal.classList.add('portal-on');
    if (img) img.loading = 'eager';
    if (!silnikProba) { silnikProba = true; silnik = silnikPortalu(pScena); }
    var glOk = function () { return silnik && silnik.gotowy; };
    var podzial = W.SplitText && tekst ? SplitText.create(tekst, { type: 'words', wordsClass: 'ebl-slowo', reduceWhiteSpace: false }) : null;
    var slowa = podzial ? podzial.words : [];
    var stan = { p: 0 };
    /* wersja DOM (bez WebGL): ten sam scenariusz na zwykłym obrazie */
    function dom(p) {
      if (!img) return;
      var t1 = Math.min(1, p / .62), e = Math.pow(t1, 1.75), Z = Math.exp(Math.log(ZOOM_DOM) * e), f = sm(0, .55, t1);
      var S = img.offsetWidth || 1, tx = -(ROZA[0] - .5) * S * f * Z, ty = -(ROZA[1] - .5) * S * f * Z;
      img.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + (e * e * 31).toFixed(2) + 'deg) scale(' + Z.toFixed(3) + ')';
      img.style.filter = p > .3 ? 'blur(' + (sm(.3, .62, p) * 14).toFixed(1) + 'px) saturate(' + (1 + sm(.3, .6, p)).toFixed(2) + ')' : '';
      img.style.opacity = (1 - sm(.6, .64, p)).toFixed(3);
    }
    function rysuj() {
      var p = stan.p;
      if (glOk()) { silnik.ustaw(p); if (img && img.style.transform) { img.style.transform = ''; img.style.filter = ''; img.style.opacity = ''; } }
      else dom(p);
      if (blysk) blysk.style.opacity = glOk() ? 0 : Math.exp(-Math.pow((p - .635) / .04, 2)).toFixed(3);
      /* plakietka dotyczy ilustracji: po drugiej stronie (czysty granat) nie ma obrazu AI */
      if (plak) plak.style.opacity = (1 - sm(.6, .645, p)).toFixed(3);
    }
    if (silnik) silnik.onWylacz = rysuj;
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: pScena, start: 'top top', end: function () { return '+=' + Math.round(innerHeight * PIN_PORTAL); },
      pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
      onToggle: function (st) { if (silnik) silnik.aktywny(st.isActive); }
    } });
    tl.to(stan, { p: 1, duration: 1, onUpdate: rysuj }, 0);
    if (wsk) tl.fromTo(wsk, { opacity: 1 }, { opacity: 0, duration: .07 }, 0);
    if (slowa.length) tl.fromTo(slowa, { opacity: 0, scale: .42, filter: 'blur(16px)', yPercent: 18 },
      { opacity: 1, scale: 1, filter: 'blur(0px)', yPercent: 0, duration: .15, stagger: .012, ease: 'power3.out' }, .655);
    if (et) tl.fromTo(et, { opacity: 0, clipPath: 'inset(0% 50% 0% 50%)' }, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: .1, ease: 'power2.out' }, .8);
    /* tekstury ładujemy, gdy scena jest ok. półtora ekranu przed kadrem */
    var io = 'IntersectionObserver' in W ? new IntersectionObserver(function (w) {
      if (w[w.length - 1].isIntersecting) { io.disconnect(); if (silnik) silnik.start(); }
    }, { rootMargin: '150% 0px 150% 0px' }) : null;
    if (io) io.observe(pScena); else if (silnik) silnik.start();
    rysuj();
    return function () {
      if (io) io.disconnect();
      if (silnik) silnik.stop();
      if (podzial) podzial.revert();
      portal.classList.remove('portal-on');
      if (img) { img.style.transform = ''; img.style.filter = ''; img.style.opacity = ''; }
      [blysk, wsk, et, plak].forEach(function (x) { if (x) x.removeAttribute('style'); });
    };
  });

  /* ================================================================ 2. TOR „3 PETARDY W LEWO” */
  var tor = Q('#soins.tor3'), tScena = tor && Q('.tor3-scena', tor);
  if (tScena) mm.add(KOMPUTER, function () {
    var tasma = Q('.tor3-tasma', tScena), panele = QA('.panel', tasma), tlo = Q('.tor3-tlo', tScena),
        nrEl = Q('.tor3-nr-akt', tScena), pasek = Q('.tor3-pasek', tScena), zEl = Q('.tor3-z', tScena);
    if (!tasma || panele.length < 2) return;
    tor.classList.add('tor-on');
    var N = panele.length, vw = 1, stan = { x: 0 }, akt = 0, skCel = 0, sk = 0;
    if (zEl) zEl.textContent = '/ ' + (N < 10 ? '0' : '') + N;
    QA('img', tasma).forEach(function (i) { i.loading = 'eager'; });
    var cz = panele.map(function (p) {
      var im = Q('.panel-obraz > img', p);
      return { p: p, wolna: !im, img: im || Q('.panel-obraz > .kadr', p) || Q('.panel-obraz .urzadzenie:not(.urzadzenie-obok)', p) ||
        Q('.panel-obraz .zastep', p), obok: Q('.panel-obraz .urzadzenie-obok', p), plak: Q('.panel-obraz .plakietka', p), tyt: Q('.panel-tytul', p), nr: Q('.panel-nr', p), d: QA('.panel-opis, .panel-cena, .panel-cta', p) };
    });
    function szer() { vw = tScena.clientWidth || innerWidth; tor.style.setProperty('--vw', vw + 'px'); dopasuj(); }
    /* Numer i tytuł panelu nigdy na nagłówku sekcji (Daniel 03.10.2026: „01” i „03” wchodziły na „Chaque soin et son prix”
       przy innej wysokości okna). Treść panelu zaczyna się pod nagłówkiem i licznikiem (+28 px); jeśli się nie mieści,
       tytuł i numer maleją (do 45%), zamiast wychodzić w górę. Działa dla każdej wysokości okna. */
    var glowaEl = Q('.tor3-glowa', tScena), licznikEl = Q('.tor3-licznik', tScena);
    function dopasuj() {
      var gora = 0;
      [glowaEl, licznikEl].forEach(function (e) { if (e && e.offsetHeight) gora = Math.max(gora, e.offsetTop + e.offsetHeight); });
      tor.style.setProperty('--tor-gora', Math.round(gora + 28) + 'px');
      panele.forEach(function (p) {
        var tr = Q('.panel-tresc', p), ty = Q('.panel-tytul', p), nr = Q('.panel-nr', p); if (!tr || !ty) return;
        ty.style.fontSize = ''; if (nr) nr.style.fontSize = '';
        for (var k = 0; k < 3; k++) {
          var nad = tr.scrollHeight - tr.clientHeight; if (nad <= 1) break;
          var fs = parseFloat(getComputedStyle(ty).fontSize), h = ty.offsetHeight + (nr ? nr.offsetHeight : 0);
          var f = Math.max(.45, (h - nad - 4) / h);
          ty.style.fontSize = (fs * f).toFixed(1) + 'px';
          if (nr) nr.style.fontSize = (parseFloat(getComputedStyle(nr).fontSize) * f).toFixed(1) + 'px';
        }
      });
    }
    szer();
    function rysuj() {
      var x = stan.x;
      tasma.style.transform = 'translate3d(' + (-x * vw).toFixed(1) + 'px,0,0)';
      cz.forEach(function (c, i) {
        var off = i - x, a = Math.min(1, Math.abs(off));
        if (a >= 1.2) return;
        c.img && c.img.style.setProperty('--ix', (-off * vw * .42).toFixed(1) + 'px');
        c.img && c.img.style.setProperty('--is', (1.06 + .16 * a).toFixed(4));
        /* urządzenie z RTX (wolno stojące): obrót 3D przy przejeździe, jak „petarda”, plus pochylenie z prędkości */
        c.img && c.img.style.setProperty('--ry', (-off * 26 - sk * 1.4).toFixed(2) + 'deg');
        /* drugi element w głębi (kombinezon EMS): dalej od kamery, więc jedzie wolniej i obraca się mniej */
        if (c.obok) { c.obok.style.setProperty('--ix', (-off * vw * .62).toFixed(1) + 'px'); c.obok.style.setProperty('--ry', (-off * 16 - sk).toFixed(2) + 'deg');
          c.obok.style.opacity = Math.max(0, 1 - a * 1.6).toFixed(3); }
        /* warstwy bez ramki (urządzenie, wideo z maską, obręcz): nie są przycinane krawędzią panelu, więc gasną przy
           wyjeździe, zamiast wjeżdżać na sąsiedni panel albo urywać się na jego krawędzi */
        if (c.wolna && c.img) { c.img.style.opacity = Math.max(0, 1 - a * 1.5).toFixed(3); if (c.plak) c.plak.style.opacity = c.img.style.opacity; }
        c.tyt && c.tyt.style.setProperty('--tx', (off * vw * .22).toFixed(1) + 'px');
        c.tyt && c.tyt.style.setProperty('--sk', sk.toFixed(2) + 'deg');
        c.nr && c.nr.style.setProperty('--nx', (off * vw * .5).toFixed(1) + 'px');
        c.d.forEach(function (d, j) { d.style.setProperty('--dx', (off * vw * (.08 + j * .05)).toFixed(1) + 'px'); d.style.setProperty('--to', Math.max(0, 1 - a * 1.6).toFixed(3)); });
      });
      if (tlo) tlo.style.setProperty('--bx', (x * vw * .3 - vw * .08).toFixed(1) + 'px');
      if (pasek) pasek.style.setProperty('--tp', (x / (N - 1)).toFixed(4));
      var k = Math.min(N - 1, Math.max(0, Math.round(x)));
      if (k !== akt && nrEl) {
        var w = k > akt ? 1 : -1; akt = k;
        nrEl.textContent = (k < 9 ? '0' : '') + (k + 1);
        gsap.fromTo(nrEl, { yPercent: 100 * w }, { yPercent: 0, duration: .55, ease: 'reveal', overwrite: true });
      }
    }
    /* pochylenie tytułów z prędkością przewijania (wygasa samo) */
    function tik() {
      sk += (skCel - sk) * .14; skCel *= .9;
      if (Math.abs(sk) > .01 || Math.abs(skCel) > .01) rysuj();
    }
    var tl = gsap.timeline({ scrollTrigger: {
      trigger: tScena, start: 'top top', end: function () { return '+=' + Math.round(innerHeight * PIN_TOR); },
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      onRefresh: function () { szer(); rysuj(); },
      onUpdate: function (st) { skCel = Math.max(-7, Math.min(7, st.getVelocity() / -260)); },
      onToggle: function (st) { st.isActive ? gsap.ticker.add(tik) : gsap.ticker.remove(tik); }
    } });
    /* postój, petarda, postój, petarda, postój */
    tl.to({}, { duration: .14 });
    for (var i = 1; i < N; i++) {
      tl.to(stan, { x: i, duration: 1, ease: W.CustomEase ? 'petarda' : 'power3.inOut', onUpdate: rysuj });
      tl.to({}, { duration: i < N - 1 ? .38 : .16 });
    }
    rysuj();
    return function () {
      gsap.ticker.remove(tik);
      tor.classList.remove('tor-on'); tor.style.removeProperty('--vw'); tor.style.removeProperty('--tor-gora');
      panele.forEach(function (p) { ['.panel-tytul', '.panel-nr'].forEach(function (s) { var e = Q(s, p); if (e) e.style.fontSize = ''; }); });
      tasma.style.transform = '';
      cz.forEach(function (c) {
        [c.img, c.obok, c.plak].forEach(function (el) { if (el) el.style.opacity = ''; });
        [c.img, c.obok, c.tyt, c.nr].concat(c.d).forEach(function (el) { if (el) ['--ix', '--is', '--ry', '--tx', '--sk', '--nx', '--dx', '--to'].forEach(function (v) { el.style.removeProperty(v); }); });
      });
      if (nrEl) { nrEl.textContent = '01'; gsap.set(nrEl, { clearProps: 'transform' }); }
    };
  });

  /* ================================================================ kolejność pinów i wejście linkiem do sekcji */
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  /* wejście z adresem #sekcja: przeglądarka skacze, zanim piny dodadzą wysokość; po każdym przeliczeniu (czcionki, obrazy)
     wracamy do celu, dopóki użytkownik sam nie ruszy strony (najdłużej 4 s) */
  var cel = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (cel) {
    var ruszyl = false, koniec = performance.now() + 4000;
    var stop = function () { ruszyl = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (n) { W.addEventListener(n, stop, { once: true, passive: true }); });
    var doCelu = function () {
      if (ruszyl || performance.now() > koniec) { ScrollTrigger.removeEventListener('refresh', doCelu); return; }
      var y = Math.round(cel.getBoundingClientRect().top + W.scrollY);
      if (Math.abs(y - W.scrollY) > 2) W.scrollTo(0, y);
    };
    ScrollTrigger.addEventListener('refresh', doCelu);
    doCelu();
  }
})();
