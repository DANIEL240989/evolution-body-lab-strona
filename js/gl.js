/* Evolution Body Lab: silnik WebGL (03.10.2026). Daniel: „kilka efektów mamy, ale nie to, co w tamtych stronach”.
   Mechanika wzorów (projekt/wzory/SILNIKI.md #6 i #10), kod i shadery własne, bez bibliotek (CSP: tylko self + cdnjs):
   1. Pierwszy ekran (.hero-fala, komputer): od 03.10.2026 czysty głęboki granat liczony w shaderze (Daniel: „zamiast tego
      kamienia czysty ciemnogranatowy tło”), na nim gigantyczny napis i Monika (img/monika-rys-hero.webp) w 2,5D z mapy
      głębi (img/glebia/monika-rys-glebia.webp, jasne = blisko): paralaksa za myszą (wygładzenie ok. 0,35 s), lekki dryf,
      przy przewijaniu kamera „wjeżdża” (zoom zależny od głębi). Telefon: bez WebGL, granat z CSS.
   2. Płyn pod kursorem (komputer z myszą): symulacja na teksturach ping-pong w 1/6 rozdzielczości (adwekcja, wir,
      dywergencja, ciśnienie Jacobiego, odjęcie gradientu). Mysz wstrzykuje prędkość i „tusz” odcinkiem (bez kropek przy
      szybkim ruchu). Ślad rysuje ŚWIATŁO na granacie: połysk jak jedwab / ciekłe złoto (różowe złoto → 24K), włókna
      wzdłuż ruchu, refrakcja Moniki i napisu z rozszczepieniem barw na krawędzi; na twarzy Moniki prawie zero.
   3. Karty zabiegów (#soins) i medaliony ilustracji: przy wjeździe w ekran i przy najechaniu obraz faluje w shaderze,
      kanały RGB rozchodzą się przy krawędziach. Jeden wspólny kontekst poza DOM, wynik kopiowany do lekkiego płótna 2D
      tylko na czas efektu; po efekcie wraca zwykły <img>.
   Współpraca z js/ruch.js: płótno siedzi w .hero-fala, więc okno w logo (kurtyna) pokazuje żywy obraz, a ramka
   clip-path i skala z pinu kurczą płótno razem z warstwą. Plakietka „Image de synthèse” stoi nad płótnem.
   Bezpieczniki: ograniczony ruch, oszczędzanie danych / 2G, brak WebGL, błąd shadera albo FBO, utrata kontekstu,
   za wolne klatki → zostaje statyczny obraz CSS, bez komunikatów w konsoli. Programowy WebGL (SwiftShader) jest
   odrzucany (failIfMajorPerformanceCaveat); do testów w przeglądarce bez GPU: ?gl=sw. */
(function () {
  'use strict';
  var H = document.documentElement, W = window;
  var szukaj = location.search || '';
  var SW = /[?&]gl=sw\b/.test(szukaj);
  function wolno() {
    try {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
      var c = navigator.connection;
      if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return true;
    } catch (e) {}
    return /[?&]gl=0\b/.test(szukaj);
  }
  if (wolno() || !W.WebGLRenderingContext) return;

  var TEL = matchMedia('(max-width: 900px)'), MYSZ = matchMedia('(hover: hover) and (pointer: fine)');
  var stat = W.EBL_GL = { hero: 'brak', karty: 'brak', plyn: false, klatki: 0, srMs: 0 };

  /* ---------------------------------------------------------------- narzędzia GL (bez logów: błąd = null) */
  var ATR = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false,
    preserveDrawingBuffer: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: !SW };
  function kontekst(cv, atr) {
    var gl = null, v2 = false;
    try { gl = cv.getContext('webgl2', atr); v2 = !!gl; if (!gl) gl = cv.getContext('webgl', atr) || cv.getContext('experimental-webgl', atr); }
    catch (e) { gl = null; }
    return gl ? { gl: gl, v2: v2 } : null;
  }
  function shader(gl, typ, zr) {
    var s = gl.createShader(typ); gl.shaderSource(s, zr); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
    return s;
  }
  /* program + mapa uniformów (nazwa → lokalizacja), liczona raz: w pętli żadnego szukania */
  function program(gl, vs, fs) {
    var a = shader(gl, gl.VERTEX_SHADER, vs), b = shader(gl, gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    var p = gl.createProgram(); gl.attachShader(p, a); gl.attachShader(p, b);
    gl.bindAttribLocation(p, 0, 'aPos'); gl.linkProgram(p);
    gl.deleteShader(a); gl.deleteShader(b);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { gl.deleteProgram(p); return null; }
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var inf = gl.getActiveUniform(p, i); u[inf.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, inf.name); }
    return { p: p, u: u };
  }
  /* jeden duży trójkąt na cały ekran */
  function trojkat(gl) {
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    return b;
  }
  function tekstura(gl, filtr) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtr); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtr);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function piksel(gl, r, g, b, a) {
    var t = tekstura(gl, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, a]));
    return t;
  }
  function wgraj(gl, t, img, mip) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (mip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
  }
  function obraz(src) {
    return new Promise(function (ok, zle) {
      var i = new Image(); i.decoding = 'async';
      i.onload = function () { (i.decode ? i.decode() : Promise.resolve()).then(function () { ok(i); }, function () { ok(i); }); };
      i.onerror = zle; i.src = src;
    });
  }

  /* ---------------------------------------------------------------- shadery (GLSL ES 1.00: WebGL2 i WebGL1) */
  var VS = 'attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}';
  var VS_S = 'attribute vec2 aPos;uniform vec2 uTexel;varying vec2 vUv,vL,vR,vT,vB;' +
    'void main(){vUv=aPos*.5+.5;vL=vUv-vec2(uTexel.x,0.);vR=vUv+vec2(uTexel.x,0.);vT=vUv+vec2(0.,uTexel.y);vB=vUv-vec2(0.,uTexel.y);gl_Position=vec4(aPos,0.,1.);}';
  var P = 'precision highp float;precision highp sampler2D;';
  var PS = P + 'varying vec2 vUv,vL,vR,vT,vB;';
  var FS = {
    /* wstrzyknięcie wzdłuż odcinka A→B (ruch myszy w tej klatce), gaussowski profil */
    splat: P + 'varying vec2 vUv;uniform sampler2D uCel;uniform vec2 uA,uB;uniform vec3 uWart;uniform float uProm,uAsp;' +
      'void main(){vec2 p=vUv-uA,b=uB-uA;p.x*=uAsp;b.x*=uAsp;float h=clamp(dot(p,b)/max(dot(b,b),1e-9),0.,1.);vec2 d=p-b*h;' +
      'gl_FragColor=vec4(texture2D(uCel,vUv).xyz+uWart*exp(-dot(d,d)/uProm),1.);}',
    adwekcja: P + 'varying vec2 vUv;uniform sampler2D uV,uZr;uniform vec2 uTexel;uniform float uDt,uZanik;' +
      'void main(){vec2 c=vUv-uDt*texture2D(uV,vUv).xy*uTexel;gl_FragColor=texture2D(uZr,c)/(1.+uZanik*uDt);}',
    wir: PS + 'uniform sampler2D uV;void main(){float L=texture2D(uV,vL).y,R=texture2D(uV,vR).y,T=texture2D(uV,vT).x,B=texture2D(uV,vB).x;' +
      'gl_FragColor=vec4(.5*(R-L-T+B),0.,0.,1.);}',
    wirowosc: PS + 'uniform sampler2D uV,uW;uniform float uSila,uDt;void main(){float L=texture2D(uW,vL).x,R=texture2D(uW,vR).x,' +
      'T=texture2D(uW,vT).x,B=texture2D(uW,vB).x,C=texture2D(uW,vUv).x;vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));' +
      'f/=length(f)+1e-4;f*=uSila*C;f.y=-f.y;vec2 v=texture2D(uV,vUv).xy+f*uDt;gl_FragColor=vec4(clamp(v,-900.,900.),0.,1.);}',
    dywergencja: PS + 'uniform sampler2D uV;void main(){vec2 C=texture2D(uV,vUv).xy;float L=texture2D(uV,vL).x,R=texture2D(uV,vR).x,' +
      'T=texture2D(uV,vT).y,B=texture2D(uV,vB).y;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;' +
      'gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}',
    cisnienie: PS + 'uniform sampler2D uP,uD;void main(){float s=texture2D(uP,vL).x+texture2D(uP,vR).x+texture2D(uP,vT).x+texture2D(uP,vB).x;' +
      'gl_FragColor=vec4((s-texture2D(uD,vUv).x)*.25,0.,0.,1.);}',
    gradient: PS + 'uniform sampler2D uP,uV;void main(){float L=texture2D(uP,vL).x,R=texture2D(uP,vR).x,T=texture2D(uP,vT).x,B=texture2D(uP,vB).x;' +
      'gl_FragColor=vec4(texture2D(uV,vUv).xy-.5*vec2(R-L,T-B),0.,1.);}',
    mnoz: P + 'varying vec2 vUv;uniform sampler2D uT;uniform float uM;void main(){gl_FragColor=uM*texture2D(uT,vUv);}',

    /* pierwszy ekran (od 03.10.2026 bez kamienia, Daniel: „czysty ciemnogranatowy tło”): granat liczony w shaderze
       (ciemniejsze brzegi, dwie ledwo widoczne poświaty, ziarno), na nim gigantyczny napis i Monika z paralaksą 2,5D.
       Płyn: ślad kursora jest ŚWIATŁEM, nie farbą: połysk jak jedwab / ciekłe złoto (normalna z gradientu śladu,
       odblask za kursorem, włókna wzdłuż ruchu, jaśniejszy brzeg fałdy), dodawany do granatu, a Monika i napis są
       w śladzie lekko załamane (refrakcja z rozszczepieniem barw na krawędzi). Na Monice światło przygaszone,
       na twarzy prawie zero (maska owalu twarzy w kadrze img/monika-rys-hero.webp + alfa postaci). */
    hero: P + 'varying vec2 vUv;uniform sampler2D uTusz,uV,uMon,uMonGl,uNap;uniform vec2 uRes,uPar,uSwiatlo,uParM,uParW,uTx;uniform vec4 uMonK,uNapK;' +
      'uniform float uZoom,uPlyn,uCzas,uRefr,uMonOn;' +
      'vec2 gM,gW;' +
      'float wn(vec2 u){return step(0.,u.x)*step(u.x,1.)*step(0.,u.y)*step(u.y,1.);}' +
      'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}' +
      /* granat: baza #0B1530 w środku kadru, #050A17 na brzegach; poświata różowego złota za Moniką, chłodna w lewym górnym rogu */
      'vec3 tlo(vec2 q){vec2 u=q/uRes;vec2 o=uPar/uRes*.5;' +
      'vec3 c=mix(vec3(.043,.082,.188),vec3(.020,.039,.090),smoothstep(.15,1.05,length((u-vec2(.56,.46))*vec2(1.,1.3))));' +
      'vec2 d1=(u-vec2(.74,.52)-o)*vec2(1.6,1.);c+=vec3(.831,.643,.604)*.055*exp(-dot(d1,d1)*7.);' +
      'vec2 d2=(u-vec2(.18,.22)+o)*vec2(1.3,1.);c+=vec3(.12,.20,.38)*.09*exp(-dot(d2,d2)*5.);return c;}' +
      'vec3 kol(vec2 q){vec3 c=tlo(q);if(uMonOn>.5){' +
      'vec2 qw=.5*uRes+(q-.5*uRes)/(1.+uZoom*.7);vec2 uw=(qw-uNapK.xy)/uNapK.zw+gW;vec4 w=texture2D(uNap,uw)*wn(uw);c=mix(c,w.rgb,w.a);' +
      'vec2 qm=.5*uRes+(q-.5*uRes)/(1.+uZoom*1.4);vec2 um=(qm-uMonK.xy)/uMonK.zw+gM;vec4 m=texture2D(uMon,um)*wn(um);c=mix(c,m.rgb,m.a);}return c;}' +
      'vec3 zloto(float x){x=clamp(x,0.,1.);' +
      'vec3 c=mix(vec3(.30,.17,.13),vec3(.831,.643,.604),smoothstep(0.,.45,x));' +                 /* różowe złoto #D4A49A */
      'return mix(c,vec3(.984,.906,.631),smoothstep(.45,1.,x));}' +                                  /* 24K #FBE7A1 */
      'void main(){vec2 px=vec2(vUv.x,1.-vUv.y)*uRes;' +
      'gM=vec2(0.);gW=vec2(0.);float fa=0.,ma=0.;if(uMonOn>.5){vec2 qm0=.5*uRes+(px-.5*uRes)/(1.+uZoom*1.4);vec2 um0=(qm0-uMonK.xy)/uMonK.zw;' +
      /* głowa i twarz (owal liczony PRZED przesunięciem, więc stały): cała postać przesuwa się jak jedna warstwa,
         głębia działa tylko poza głową (włosy po bokach, ramiona) → twarz nigdy się nie rozciąga (Daniel 03.10.2026) */
      'float gh=smoothstep(1.35,.9,length((um0-vec2(.55,.26))/vec2(.36,.34)));' +
      'float dm=texture2D(uMonGl,um0).r;gM=-uParM*(.9+.4*(dm-.5)*(1.-gh))/uMonK.zw;dm=texture2D(uMonGl,um0+gM).r;gM=-uParM*(.9+.4*(dm-.5)*(1.-gh))/uMonK.zw;gW=-uParW/uNapK.zw;' +
      'vec2 uq=um0+gM;ma=texture2D(uMon,uq).a*wn(uq);fa=smoothstep(1.2,.72,length((uq-vec2(.52,.27))/vec2(.27,.25)));}' +
      'vec3 baza=kol(px);vec3 c=baza;' +
      'if(uPlyn>.5){vec4 tz=texture2D(uTusz,vUv);float m=smoothstep(.03,.6,tz.r);float kr=m*(1.-m)*4.;' +
      'if(m+kr>.002){vec2 v=texture2D(uV,vUv).xy;' +
      'float tw=1.-.92*fa;float att=(1.-.5*ma)*tw;' +                                                  /* twarz: prawie bez światła i refrakcji */
      'vec2 rf=v*uRefr*tw;float lr=length(rf);if(lr>.012)rf*=.012/lr;vec2 dir=lr>1e-5?rf/lr:vec2(1.,0.);' +
      'vec2 pq=px+rf*(m+kr)*uRes;vec2 ca=dir*kr*1.6;' +
      'vec3 zr=vec3(kol(pq+ca).r,kol(pq).g,kol(pq-ca).b);' +
      /* normalna z gradientu śladu: fałdy jedwabiu */
      'float hx=texture2D(uTusz,vUv+vec2(uTx.x,0.)).r-texture2D(uTusz,vUv-vec2(uTx.x,0.)).r;' +
      'float hy=texture2D(uTusz,vUv+vec2(0.,uTx.y)).r-texture2D(uTusz,vUv-vec2(0.,uTx.y)).r;' +
      'vec3 n=normalize(vec3(-hx*7.,hy*7.,1.));vec3 hv=normalize(normalize(vec3(uSwiatlo,.85))+vec3(0.,0.,1.));' +
      'float bl=pow(max(dot(n,hv),0.),42.);float rim=clamp(1.-n.z,0.,1.);' +
      'float wl=.85+.15*sin(dot(px,vec2(-dir.y,dir.x))*.16+tz.r*6.+uCzas*.4);' +            /* włókna wzdłuż ruchu */
      'float I=(.22*m+.30*rim*smoothstep(0.,.35,m)+.80*bl*m+.05*kr)*wl*att;' +
      'c=mix(baza,zr,clamp(kr*.9+m*.35,0.,1.)*tw);' +
      'c+=zloto(.25+.55*m+.6*bl)*I;' +
      'c=mix(c,c*vec3(1.06,.99,.93),m*.5*att);}}' +
      'c=min(c,vec3(1.));' +
      /* ziarno ok. ±1,5/255: na granacie bez pasów gradientu */
      'c+=(hash(px+fract(uCzas*.37))-.5)*3./255.;gl_FragColor=vec4(c,1.);}',

    /* karty i medaliony: fala + rozejście kanałów RGB przy krawędziach (tekstury z premultiplikowaną alfą) */
    karta: P + 'varying vec2 vUv;uniform sampler2D uImg,uGl;uniform vec2 uRes,uObr,uMysz;uniform float uWej,uNad,uCzas,uMa;' +
      'void main(){vec2 p=vec2(vUv.x,1.-vUv.y);float ar=uRes.x/uRes.y,ai=uObr.x/uObr.y;vec2 sk=ar>ai?vec2(1.,ai/ar):vec2(ar/ai,1.);' +
      'vec2 uv=(p-.5)*sk+.5;' +
      'float a=uWej,t=uCzas;' +
      'vec2 f=vec2(sin(p.y*9.+t*2.1)+.6*sin(p.y*23.-t*3.3),sin(p.x*7.-t*1.7)+.5*sin(p.x*19.+t*2.6));' +
      'vec2 dsp=f*.011*a+vec2(0.,a*a*.05*sin(p.x*3.1416));' +
      'vec2 q=(p-uMysz)*vec2(ar,1.);float r=length(q);' +
      'dsp+=(r>1e-4?q/r:vec2(0.))*sin(r*34.-t*5.5)*exp(-r*4.5)*.0065*uNad*sk*(1.-.75*uMa);' +
      /* 2,5D z mapy głębi (medaliony, img/glebia/*-glebia.webp, jasne = blisko): bliskie warstwy idą za kursorem */
      'vec2 pr=(uMysz-.5)*uNad*uMa*vec2(.05,.04);float dg=texture2D(uGl,uv).r;vec2 g=-pr*(dg-.42);' +
      'dg=texture2D(uGl,uv+g).r;g=-pr*(dg-.42);dsp+=g;' +
      'float kr=smoothstep(.18,.72,length((p-.5)*vec2(1.,1./max(ar,.5))));' +
      'vec2 o=(vec2(.010,.004)*a+vec2(.0045,.0018)*uNad)*(.25+kr);' +
      'vec4 cr=texture2D(uImg,uv+dsp+o),cg=texture2D(uImg,uv+dsp),cb=texture2D(uImg,uv+dsp-o);' +
      'gl_FragColor=vec4(cr.r,cg.g,cb.b,max(cg.a,max(cr.a,cb.a)));}'
  };

  /* ================================================================ 1. PIERWSZY EKRAN */
  var hero = document.querySelector('.hero'), fala = document.querySelector('.hero-fala');
  if (hero && fala) (function () {
    var cv = document.createElement('canvas'); cv.className = 'gl-hero'; cv.setAttribute('aria-hidden', 'true');
    var K = kontekst(cv, ATR); if (!K) return;
    var gl = K.gl, v2 = K.v2;
    var pr = {}, fbo = null, plyn = false, tex = {}, gotowe = false, raf = 0, widac = true;
    /* wersja HD z mastera 8K (Real-ESRGAN na RTX), te same proporcje i kadr: na wysokich/gęstych ekranach ostrzejsza tekstura */
    var POSTAC = [(innerHeight * Math.min(devicePixelRatio || 1, 1.5) > 1000 ? 'img/monika-rys-hero-2048.webp' : 'img/monika-rys-hero.webp'), 'img/glebia/monika-rys-glebia.webp'];
    var czcionkiGotowe = Promise.race([(document.fonts && document.fonts.ready) || Promise.resolve(), new Promise(function (r) { setTimeout(r, 2500); })]);
    /* parametry (komputer / telefon) */
    var PAR = [22, 14], SYM = 6, ITER = 14,
        ZANIK_V = 1.1, ZANIK_T = .85, WIR = 16, PROM = .0016, SILA = 1.5, TUSZ = .55, REFR = 2.4e-5;

    function zbuduj() {
      trojkat(gl);
      for (var k in FS) if (k !== 'karta') {
        pr[k] = program(gl, /^(wir|wirowosc|dywergencja|cisnienie|gradient)$/.test(k) ? VS_S : VS, FS[k]);
        if (!pr[k]) return false;
      }
      tex.zero = piksel(gl, 0, 0, 0, 0);
      tex.mon = piksel(gl, 0, 0, 0, 0); tex.monGl = piksel(gl, 128, 128, 128, 255); tex.nap = piksel(gl, 0, 0, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, tex.mon); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, tex.monGl); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, tex.nap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return true;
    }
    /* format FBO płynu: half float; bez renderowania do half float płyn wyłączony (2,5D zostaje) */
    var FMT = null;
    function format() {
      var f;
      if (v2) {
        if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return null;
        f = { wew: gl.RGBA16F, typ: gl.HALF_FLOAT, filtr: gl.LINEAR };
      } else {
        var hf = gl.getExtension('OES_texture_half_float'); if (!hf) return null;
        f = { wew: gl.RGBA, typ: hf.HALF_FLOAT_OES, filtr: gl.getExtension('OES_texture_half_float_linear') ? gl.LINEAR : gl.NEAREST };
      }
      var c = cel(4, 4, f), ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      usun(c); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return ok ? f : null;
    }
    function cel(w, h, f) {
      var t = tekstura(gl, f.filtr);
      gl.texImage2D(gl.TEXTURE_2D, 0, f.wew, w, h, 0, gl.RGBA, f.typ, null);
      var fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      return { t: t, fb: fb, w: w, h: h };
    }
    function usun(c) { if (c) { gl.deleteTexture(c.t); gl.deleteFramebuffer(c.fb); } }
    function para(w, h, f) {
      var o = { a: cel(w, h, f), b: cel(w, h, f) };
      o.zamien = function () { var x = o.a; o.a = o.b; o.b = x; };
      return o;
    }
    function fboPlynu(sw, sh) {
      if (fbo && fbo.sw === sw && fbo.sh === sh) return;
      if (fbo) ['v', 'tusz', 'p'].forEach(function (k) { usun(fbo[k].a); usun(fbo[k].b); }), usun(fbo.div), usun(fbo.wir);
      var tw = Math.min(512, sw * 2), th = Math.round(tw * sh / sw);
      fbo = { sw: sw, sh: sh, tw: tw, th: th, v: para(sw, sh, FMT), p: para(sw, sh, FMT), tusz: para(tw, th, FMT),
              div: cel(sw, sh, FMT), wir: cel(sw, sh, FMT) };
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    var cssW = 1, cssH = 1, dpr = 1, tryb = '';
    function rozmiar() {
      var w = fala.clientWidth, h = fala.clientHeight; if (!w || !h) return;
      dpr = Math.min(W.devicePixelRatio || 1, TEL.matches ? 1 : 1.5);
      cssW = w; cssH = h;
      var pw = Math.round(w * dpr), ph = Math.round(h * dpr);
      if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
      miejsca(); napis();
      if (plyn) { var sw = Math.max(48, Math.min(256, Math.round(w / SYM))); fboPlynu(sw, Math.max(32, Math.round(sw * h / w))); }
    }
    /* Monika i napis za nią (komputer): miejsce bierzemy z warstw DOM w .hero-fala (css/paleta.css), żeby płótno
       i wersja bez WebGL były w tym samym kadrze. Mapa głębi Moniki: img/glebia/monika-rys-glebia.webp (tymczasowa
       z alfy; podmiana na mapę z RTX = ten sam plik). */
    var monImg = fala.querySelector('.hero-monika'), napEl = fala.querySelector('.hero-imie');
    var monOn = false, monK = [0, 0, 1, 1], napK = [0, 0, 1, 1], napCv = null;
    function miejsca() {
      if (!monOn || !monImg) return;
      monK = [monImg.offsetLeft, monImg.offsetTop, monImg.offsetWidth || 1, monImg.offsetHeight || 1];
      if (napEl) napK = [napEl.offsetLeft, napEl.offsetTop, napEl.offsetWidth || 1, napEl.offsetHeight || 1];
    }
    function napis() {
      if (!monOn || !napEl || !napEl.offsetWidth) return;
      var cs = getComputedStyle(napEl), d = Math.min(W.devicePixelRatio || 1, 1.5);
      if (!napCv) napCv = document.createElement('canvas');
      var w = Math.round(napEl.offsetWidth * d), h = Math.round(napEl.offsetHeight * d);
      napCv.width = w; napCv.height = h;
      var c = napCv.getContext('2d'), t = napEl.textContent || '';
      if (cs.textTransform === 'uppercase') t = t.toUpperCase();
      c.clearRect(0, 0, w, h); c.scale(d, d);
      c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      if ('letterSpacing' in c) c.letterSpacing = cs.letterSpacing;
      c.fillStyle = cs.color; c.textBaseline = 'alphabetic';
      var m = c.measureText(t), asc = m.actualBoundingBoxAscent || parseFloat(cs.fontSize) * .7, desc = m.actualBoundingBoxDescent || 0;
      var y = (napEl.offsetHeight + asc - desc) / 2;
      c.fillText(t, 0, y);
      /* obrys 1 px różowym złotem (css/paleta.css: -webkit-text-stroke), żeby napis czytał się na granacie jako drugi plan */
      var sw = parseFloat(cs.webkitTextStrokeWidth) || 0;
      if (sw > 0) { c.lineWidth = sw; c.strokeStyle = cs.webkitTextStrokeColor; c.strokeText(t, 0, y); }
      gl.bindTexture(gl.TEXTURE_2D, tex.nap); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, napCv);
    }
    /* tło liczy shader: wczytujemy tylko Monikę z mapą głębi (komputer); na telefonie pierwszy ekran zostaje w CSS */
    var ladowanie = 0;
    function wczytaj() {
      var t = TEL.matches ? 'tel' : 'pc'; if (t === tryb) return Promise.resolve();
      tryb = t; var nr = ++ladowanie;
      if (t !== 'pc' || !monImg) { monOn = false; hero.classList.remove('gl-postac'); return Promise.resolve(); }
      return Promise.all([obraz(POSTAC[0]), obraz(POSTAC[1]).catch(function () { return null; })]).then(function (r) {
        if (nr !== ladowanie || gl.isContextLost()) return;
        wgraj(gl, tex.mon, r[0], v2); if (r[1]) wgraj(gl, tex.monGl, r[1], false);   /* WebGL2: mipmapy, Monika ostra bez migotania */
        monOn = true; miejsca();
        return czcionkiGotowe.then(function () { if (monOn) { napis(); hero.classList.add('gl-postac'); } });
      });
    }

    /* ---------------------------------------------------------------- wejście: mysz, żyroskop, przewijanie */
    var mx = 0, my = 0, sx = 0, sy = 0;                   /* cel i wygładzona paralaksa (-1..1) */
    var pA = [0, 0], pB = [0, 0], ruch = false, ostRuch = -1e9, czasPlynu = 0, start = 0, swiatlo = [0, 0];
    function kurtyna() { return H.classList.contains('kurtyna-on'); }
    function mysz(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = Math.max(-1, Math.min(1, e.clientX / innerWidth * 2 - 1)); my = Math.max(-1, Math.min(1, e.clientY / innerHeight * 2 - 1));
      if (!plyn || !widac || kurtyna()) return;
      var r = cv.getBoundingClientRect(); if (!r.width) return;
      var x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      if (x < -.05 || x > 1.05 || y < -.05 || y > 1.05) { ruch = false; pA[0] = -1; return; }
      if (pA[0] < 0 || !ruch && performance.now() - ostRuch > 400) { pA[0] = x; pA[1] = y; pB[0] = x; pB[1] = y; }
      pB[0] = x; pB[1] = y; ruch = true; ostRuch = performance.now();
    }
    pA[0] = -1;
    var g0 = null;
    function zyro(e) {
      if (e.gamma == null || e.beta == null) return;
      if (!g0) g0 = [e.gamma, e.beta];
      mx = Math.max(-1, Math.min(1, (e.gamma - g0[0]) / 22)); my = Math.max(-1, Math.min(1, (e.beta - g0[1]) / 22));
    }

    /* ---------------------------------------------------------------- symulacja */
    function rysujDo(c) {
      if (c) { gl.bindFramebuffer(gl.FRAMEBUFFER, c.fb); gl.viewport(0, 0, c.w, c.h); }
      else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height); }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function uzyj(p) { gl.useProgram(p.p); return p.u; }
    function tex2(jedn, t, loc) { gl.activeTexture(gl.TEXTURE0 + jedn); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, jedn); }
    function krok(dt, dtR) {
      var f = fbo, u, txw = 1 / f.sw, txh = 1 / f.sh, asp = cssW / cssH;
      if (ruch) {
        var dx = pB[0] - pA[0], dy = pB[1] - pA[1], dl = Math.hypot(dx * cssW, dy * cssH);
        if (dl > .5) {
          var vx = dx * f.sw / dtR * SILA, vy = dy * f.sh / dtR * SILA, mv = Math.hypot(vx, vy);
          if (mv > 700) { vx *= 700 / mv; vy *= 700 / mv; }
          u = uzyj(pr.splat); gl.uniform2f(u.uA, pA[0], pA[1]); gl.uniform2f(u.uB, pB[0], pB[1]);
          gl.uniform1f(u.uProm, PROM * (1 + Math.min(1, dl / 90) * .8)); gl.uniform1f(u.uAsp, asp);
          tex2(0, f.v.a.t, u.uCel); gl.uniform3f(u.uWart, vx, vy, 0); rysujDo(f.v.b); f.v.zamien();
          var ilosc = Math.min(1, dl / 34) * TUSZ;
          tex2(0, f.tusz.a.t, u.uCel); gl.uniform3f(u.uWart, ilosc, ilosc, ilosc); rysujDo(f.tusz.b); f.tusz.zamien();
          czasPlynu = 0;
        }
        pA[0] = pB[0]; pA[1] = pB[1]; ruch = false;
      }
      u = uzyj(pr.wir); gl.uniform2f(u.uTexel, txw, txh); tex2(0, f.v.a.t, u.uV); rysujDo(f.wir);
      u = uzyj(pr.wirowosc); gl.uniform2f(u.uTexel, txw, txh); tex2(0, f.v.a.t, u.uV); tex2(1, f.wir.t, u.uW);
      gl.uniform1f(u.uSila, WIR); gl.uniform1f(u.uDt, dt); rysujDo(f.v.b); f.v.zamien();
      u = uzyj(pr.dywergencja); gl.uniform2f(u.uTexel, txw, txh); tex2(0, f.v.a.t, u.uV); rysujDo(f.div);
      u = uzyj(pr.mnoz); tex2(0, f.p.a.t, u.uT); gl.uniform1f(u.uM, .8); rysujDo(f.p.b); f.p.zamien();
      u = uzyj(pr.cisnienie); gl.uniform2f(u.uTexel, txw, txh); tex2(1, f.div.t, u.uD);
      for (var i = 0; i < ITER; i++) { tex2(0, f.p.a.t, u.uP); rysujDo(f.p.b); f.p.zamien(); }
      u = uzyj(pr.gradient); gl.uniform2f(u.uTexel, txw, txh); tex2(0, f.p.a.t, u.uP); tex2(1, f.v.a.t, u.uV); rysujDo(f.v.b); f.v.zamien();
      u = uzyj(pr.adwekcja); gl.uniform2f(u.uTexel, txw, txh); gl.uniform1f(u.uDt, dt);
      tex2(0, f.v.a.t, u.uV); tex2(1, f.v.a.t, u.uZr); gl.uniform1f(u.uZanik, ZANIK_V); rysujDo(f.v.b); f.v.zamien();
      tex2(0, f.v.a.t, u.uV); tex2(1, f.tusz.a.t, u.uZr); gl.uniform1f(u.uZanik, ZANIK_T); rysujDo(f.tusz.b); f.tusz.zamien();
    }
    function wyczysc() {
      if (!fbo) return;
      [fbo.v.a, fbo.v.b, fbo.tusz.a, fbo.tusz.b, fbo.p.a, fbo.p.b].forEach(function (c) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, c.fb); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /* ---------------------------------------------------------------- klatka */
    var ost = 0, nrK = 0, pomiar = new Float32Array(120), pi = 0, suma = 0, wypelnione = 0, pominK = false, zdegradowane = 0;
    function klatka(t) {
      raf = requestAnimationFrame(klatka);
      if (TEL.matches && (pominK = !pominK)) return;            /* telefon: 30 kl./s wystarczy na sam dryf */
      var dtR = ost ? (t - ost) : 16.7; ost = t;
      var dt = Math.min(dtR / 1000, 1 / 30);
      if (!start) start = t;
      var czas = (t - start) / 1000;
      /* pomiar i samoobrona: jeśli średnia klatka > 45 ms, płyn wyłączony; > 90 ms, wraca obraz CSS */
      stat.klatki = ++nrK;
      if (nrK > 20) {                                            /* pierwsze klatki (wgrywanie tekstur) pomijamy */
        suma += dtR - pomiar[pi]; pomiar[pi] = dtR; pi = (pi + 1) % pomiar.length; if (wypelnione < pomiar.length) wypelnione++;
        stat.srMs = suma / wypelnione;
      }
      if (!SW && wypelnione >= 40 && nrK % 30 === 0) {
        if (stat.srMs > 90 && zdegradowane) { zatrzymaj(true); return; }
        if (stat.srMs > 45 && plyn) { plyn = false; stat.plyn = false; zdegradowane = 1; wypelnione = 0; suma = 0; pomiar.fill(0); }
      }
      var k = 1 - Math.exp(-dt / .35);
      sx += (mx - sx) * k; sy += (my - sy) * k;
      var p = PAR;
      var dryfX = Math.sin(czas * .21) * .22 + Math.sin(czas * .057) * .12, dryfY = Math.cos(czas * .17) * .18;
      if (TEL.matches) { dryfX *= 2.2; dryfY *= 2.2; }
      var przew = Math.max(0, Math.min(1.2, (W.scrollY || 0) / (innerHeight || 1)));
      var wjazd = Math.pow(Math.max(0, 1 - czas / 2.6), 3);    /* kamera osiada po starcie (kurtyna, okno w logo) */
      if (plyn) {
        if (ruch || czasPlynu < 6) { krok(dt, Math.max(dt, Math.min(dtR / 1000, .25))); czasPlynu += dt; }
        else if (czasPlynu < 1e9) { wyczysc(); czasPlynu = 1e9; }
      }
      var u = uzyj(pr.hero);
      gl.uniform2f(u.uRes, cssW, cssH);
      gl.uniform2f(u.uPar, (sx + dryfX) * p[0], (sy + dryfY) * p[1] + przew * p[1] * 1.4);
      gl.uniform2f(u.uSwiatlo, sx * .55, -sy * .55);
      if (fbo) gl.uniform2f(u.uTx, 1 / fbo.tw, 1 / fbo.th);
      gl.uniform1f(u.uZoom, przew * .07 + wjazd * .06); gl.uniform1f(u.uCzas, czas); gl.uniform1f(u.uRefr, REFR);
      /* Monika: większa paralaksa niż fala (bliżej kamery), przy przewijaniu unosi się szybciej; napis: mniejsza */
      gl.uniform1f(u.uMonOn, monOn ? 1 : 0);
      var hs = hero.style, fp = parseFloat(hs.getPropertyValue('--fp')) || 0, msx = fp * (parseFloat(hs.getPropertyValue('--msx')) || 0);
      /* ramka: czubek głowy ma stać z zapasem pod górną krawędzią ramki (--mty z js/ruch.js), z poprawką na zoom kamery */
      var Zm = 1 + (przew * .07 + wjazd * .06) * 1.4, mty = parseFloat(hs.getPropertyValue('--mty'));
      var msy = fp && !isNaN(mty) ? Math.max(0, (mty - cssH / 2) / Zm + cssH / 2 - monK[1]) : 0;
      gl.uniform4f(u.uMonK, monK[0] + msx, monK[1] + msy, monK[2], monK[3]); gl.uniform4f(u.uNapK, napK[0], napK[1], napK[2], napK[3]);
      /* bez unoszenia Moniki z przewijaniem: w ramce kadr ustawia js/ruch.js (--msy), głowa zawsze w ramce */
      gl.uniform2f(u.uParM, (sx + dryfX * .6) * 22, (sy + dryfY * .6) * 13);
      gl.uniform2f(u.uParW, sx * 9, sy * 5 + przew * 40);
      tex2(4, tex.mon, u.uMon); tex2(5, tex.monGl, u.uMonGl); tex2(6, tex.nap, u.uNap);
      var aktywny = plyn && czasPlynu < 1e9;
      gl.uniform1f(u.uPlyn, aktywny ? 1 : 0);
      tex2(2, aktywny ? fbo.tusz.a.t : tex.zero, u.uTusz); tex2(3, aktywny ? fbo.v.a.t : tex.zero, u.uV);
      rysujDo(null);
      if (!gotowe) { gotowe = true; requestAnimationFrame(function () { hero.classList.add('gl-on'); }); }
    }
    /* telefon: pierwszy ekran bez WebGL (czysty granat z CSS), dopóki Daniel nie zatwierdzi wersji mobilnej */
    function graj() {
      if (TEL.matches) { stop(); hero.classList.remove('gl-on'); gotowe = false; return; }
      if (!raf && widac && !document.hidden && pr.hero) { ost = 0; raf = requestAnimationFrame(klatka); }
    }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function zatrzymaj(calkiem) {
      stop(); hero.classList.remove('gl-on'); stat.hero = 'wylaczony';
      if (calkiem) { W.removeEventListener('pointermove', mysz); setTimeout(function () { cv.remove(); }, 900); pr = {}; }
    }

    /* ---------------------------------------------------------------- start */
    function init() {
      if (!zbuduj()) return false;
      FMT = MYSZ.matches && !TEL.matches ? format() : null;
      plyn = !!FMT; stat.plyn = plyn; tryb = '';
      return true;
    }
    if (!init()) return;
    stat.hero = v2 ? 'webgl2' : 'webgl1';
    fala.appendChild(cv);
    rozmiar();
    wczytaj().then(function () { rozmiar(); graj(); }, function () { zatrzymaj(true); });

    if ('ResizeObserver' in W) new ResizeObserver(function () { rozmiar(); }).observe(fala);
    else W.addEventListener('resize', rozmiar);
    var zmianaTrybu = function () {
      plyn = !!FMT && MYSZ.matches && !TEL.matches && !zdegradowane; stat.plyn = plyn;
      if (!FMT && MYSZ.matches && !TEL.matches) { FMT = format(); plyn = !!FMT; stat.plyn = plyn; }
      wczytaj().then(function () { rozmiar(); graj(); });
    };
    if (TEL.addEventListener) TEL.addEventListener('change', zmianaTrybu);
    W.addEventListener('pointermove', mysz, { passive: true });
    if (TEL.matches && !MYSZ.matches && W.DeviceOrientationEvent && typeof W.DeviceOrientationEvent.requestPermission !== 'function')
      W.addEventListener('deviceorientation', zyro, { passive: true });
    if ('IntersectionObserver' in W) new IntersectionObserver(function (w) {
      widac = w[w.length - 1].isIntersecting; widac ? graj() : stop();
    }).observe(hero);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : graj(); });
    cv.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); stop(); hero.classList.remove('gl-on'); gotowe = false; fbo = null; pr = {}; stat.hero = 'utracony';
    });
    cv.addEventListener('webglcontextrestored', function () {
      tex = {}; if (!init()) return; stat.hero = v2 ? 'webgl2' : 'webgl1'; rozmiar();
      wczytaj().then(function () { rozmiar(); graj(); }, function () {});
    });
  })();

  /* ================================================================ 2. KARTY ZABIEGÓW I MEDALIONY */
  (function () {
    var cele = [].slice.call(document.querySelectorAll('#soins .karta-obraz, .ilustracja-obraz'));
    if (!cele.length || !('IntersectionObserver' in W)) return;
    var cv = document.createElement('canvas'), K = kontekst(cv, { alpha: true, premultipliedAlpha: true, antialias: false, depth: false,
      stencil: false, preserveDrawingBuffer: false, failIfMajorPerformanceCaveat: !SW });
    if (!K) return;
    var gl = K.gl, pk = null, raf = 0, aktywne = [], DL_WEJ = 1.7;
    function init() {
      trojkat(gl); pk = program(gl, VS, FS.karta);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.clearColor(0, 0, 0, 0);
      return !!pk;
    }
    if (!init()) return;
    stat.karty = K.v2 ? 'webgl2' : 'webgl1';
    var stany = cele.map(function (el) {
      return { el: el, img: el.querySelector('img'), cv: null, ctx: null, t: null, w: 0, h: 0, wej: -1, nad: 0, nadCel: 0,
               mx: .5, my: .5, akt: false, czas0: 0, gl: null, glZr: glebia(el) };
    });
    function gotowy(s) { return s.img && s.img.complete && s.img.naturalWidth > 0; }
    /* mapa głębi ilustracji marki (ta sama nazwa co obraz, wersja 900): 2,5D przy najechaniu; brak mapy = szary piksel */
    function glebia(el) {
      var i = el.querySelector('img'), m = i && /img\/ilustracje\/(dama-[a-z-]+?)-(?:600|900)\.webp/.exec(i.getAttribute('src') || '');
      return m ? 'img/glebia/' + m[1] + '-900-glebia.webp' : null;
    }
    var szary = null;
    function mapaGlebi(s) {
      if (!szary) { szary = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, szary);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([107, 107, 107, 255])); }
      if (s.gl || !s.glZr || s.glLad) return;
      s.glLad = true;
      obraz(s.glZr).then(function (im) {
        if (gl.isContextLost()) return;
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        s.gl = t;
      }, function () {});
    }
    function przygotuj(s) {
      if (!s.cv) {
        s.cv = document.createElement('canvas'); s.cv.className = 'gl-plotno'; s.cv.setAttribute('aria-hidden', 'true');
        s.ctx = s.cv.getContext('2d'); s.img.insertAdjacentElement('afterend', s.cv);
      }
      if (!s.t) { s.t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, s.t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s.img);
        if (K.v2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
        else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        s.src = s.img.currentSrc;
      }
      var d = Math.min(W.devicePixelRatio || 1, TEL.matches ? 1 : 1.5);
      s.w = Math.max(2, Math.round(s.el.clientWidth * d)); s.h = Math.max(2, Math.round(s.el.clientHeight * d));
      if (s.cv.width !== s.w || s.cv.height !== s.h) { s.cv.width = s.w; s.cv.height = s.h; }
      if (cv.width < s.w || cv.height < s.h) { cv.width = Math.max(cv.width, s.w); cv.height = Math.max(cv.height, s.h); }
    }
    function wlacz(s) {
      if (!gotowy(s)) return;
      if (s.t && s.src !== s.img.currentSrc) { gl.deleteTexture(s.t); s.t = null; }
      przygotuj(s); mapaGlebi(s);
      if (!s.akt) { s.akt = true; aktywne.push(s); }
      if (!raf && !document.hidden) raf = requestAnimationFrame(petla);
    }
    var t0 = performance.now();
    function rysuj(s, t) {
      var u = pk.u, czas = (t - t0) / 1000, a = 0;
      if (s.wej >= 0) { var x = Math.min(1, (t - s.wej) / (DL_WEJ * 1000)); a = Math.pow(1 - x, 2.4); if (x >= 1) s.wej = -2; }
      var dt = s.ost ? Math.min(.1, (t - s.ost) / 1000) : .016; s.ost = t;
      s.nad += (s.nadCel - s.nad) * (1 - Math.exp(-dt / (s.nadCel ? .35 : .45)));
      gl.viewport(0, 0, s.w, s.h); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uRes, s.w, s.h); gl.uniform2f(u.uObr, s.img.naturalWidth, s.img.naturalHeight);
      gl.uniform2f(u.uMysz, s.mx, s.my); gl.uniform1f(u.uWej, a); gl.uniform1f(u.uNad, s.nad); gl.uniform1f(u.uCzas, czas);
      gl.uniform1f(u.uMa, s.gl ? 1 : 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, s.gl || szary);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, s.t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (s.img.style.transform !== s.cv.style.transform) s.cv.style.transform = s.img.style.transform;   /* tor poziomy (GSAP) */
      s.ctx.clearRect(0, 0, s.w, s.h);
      s.ctx.drawImage(cv, 0, cv.height - s.h, s.w, s.h, 0, 0, s.w, s.h);
      if (!s.el.classList.contains('gl-fx')) s.el.classList.add('gl-fx');
      return a > .001 || s.nadCel > 0 || s.nad > .002;
    }
    function petla(t) {
      raf = 0;
      gl.useProgram(pk.p); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(pk.u.uImg, 0); if (pk.u.uGl) gl.uniform1i(pk.u.uGl, 1);
      for (var i = aktywne.length - 1; i >= 0; i--) {
        var s = aktywne[i];
        if (!rysuj(s, t)) { s.akt = false; s.nad = 0; s.ost = 0; s.el.classList.remove('gl-fx'); aktywne.splice(i, 1); }
      }
      if (aktywne.length && !document.hidden) raf = requestAnimationFrame(petla);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0; }
      else if (aktywne.length && !raf) raf = requestAnimationFrame(petla);
    });
    /* wjazd w ekran: raz, gdy co najmniej 30% elementu widać */
    var io = new IntersectionObserver(function (w) {
      w.forEach(function (e) {
        var s = stany[cele.indexOf(e.target)]; if (!s || s.wej !== -1 || e.intersectionRatio < .3) return;
        var go = function () { s.wej = performance.now(); wlacz(s); };
        if (gotowy(s)) go(); else s.img.addEventListener('load', go, { once: true });
        io.unobserve(e.target);
      });
    }, { threshold: [0, .3] });
    stany.forEach(function (s) {
      if (!s.img) return;
      io.observe(s.el);
      /* najechanie: fala od kursora, RGB na krawędziach (karta: cały kafel reaguje, medalion: samo koło) */
      var strefa = s.el.closest('.karta') || s.el;
      strefa.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; s.nadCel = 1; wlacz(s); });
      strefa.addEventListener('pointerleave', function () { s.nadCel = 0; });
      strefa.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = s.el.getBoundingClientRect(); if (!r.width) return;
        s.mx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); s.my = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      }, { passive: true });
    });
    cv.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); if (raf) cancelAnimationFrame(raf); raf = 0;
      aktywne.forEach(function (s) { s.akt = false; s.el.classList.remove('gl-fx'); }); aktywne.length = 0;
      stany.forEach(function (s) { s.t = null; s.gl = null; s.glLad = false; }); szary = null; pk = null; stat.karty = 'utracony';
    });
    cv.addEventListener('webglcontextrestored', function () { if (init()) stat.karty = K.v2 ? 'webgl2' : 'webgl1'; });
    /* karty przebudowuje site.js tylko przy starcie (zmiana języka = przeładowanie), więc lista celów jest stała */
  })();
})();
