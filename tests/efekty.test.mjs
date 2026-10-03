// Efekty „ultra” (js/efekty.js, 03.10.2026): tylko komputer, bez ograniczonego ruchu, bez ukrywania treści i formularza.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const kod = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(kod('js/dane.js') + kod('js/teksty.js'), ctx);
const { T } = ctx.window;
const html = kod('index.html'), fx = kod('js/efekty.js'), pal = kod('css/paleta.css'), gl = kod('js/gl.js'), ruch = kod('js/ruch.js'), pet = kod('js/petardy.js');

test('efekty.js: ładowany po petardy.js, tylko komputer z ruchem, bez konsoli', () => {
  assert.ok(html.indexOf('<script src="js/efekty.js"></script>') > html.indexOf('<script src="js/petardy.js"></script>'));
  assert.match(fx, /prefers-reduced-motion: reduce/);
  assert.match(fx, /H\.classList\.contains\('ruch-js'\)/);
  assert.match(fx, /var KOMPUTER = '\(min-width: 901px\)', MYSZ = '\(min-width: 901px\) and \(hover: hover\) and \(pointer: fine\)'/);
  assert.doesNotMatch(fx, /console\./);
  // każda warstwa efektu dodawana przez skrypt, nigdy w HTML; CSS chowa je na telefonie i przy ograniczonym ruchu
  assert.doesNotMatch(html, /class="[^"]*(kursor|zaslona|pyl|kropki|obrecz-blysk|pas-swiatla|orbita|cel-orbita)/);
  assert.match(pal, /@media \(max-width: 900px\), \(prefers-reduced-motion: reduce\) \{\s*\.kursor, \.zaslona, \.pyl, \.kropki, \.obrecz-blysk, \.pas-swiatla \{ display: none !important; \}/);
  // każda gałąź ma sprzątanie (gsap.matchMedia): 8 efektów = 8 funkcji powrotu
  assert.equal((fx.match(/mm\.add\(/g) || []).length, 8);
});

test('kursor: słowa z teksty.js, natywny kursor w kontakcie i nad polami, magnes ±10 px', () => {
  for (const k of ['kursor_voir', 'kursor_reserver', 'kursor_glisser']) { assert.ok(T.fr[k], k); assert.match(fx, new RegExp("tekst\\('" + k + "'\\)")); }
  assert.match(fx, /gsap\.quickTo\(k, 'x', \{ duration: \.5, ease: 'power3\.out' \}\)/);
  assert.match(fx, /el\.closest\('#contact, input, textarea, select, label, \.rdv, \.jezyki'\)\) return \['ukryty'/);
  assert.match(fx, /\* 10\); by\(/);
  assert.match(fx, /!b\.closest\('#contact, \.rdv'\)/);                 // kreator bez magnesu
  assert.doesNotMatch(pal, /#contact[^{]*\{[^}]*cursor: none/);
});

test('zasłona-medalion (SILNIKI-2 #11): koło .2 → 40 znaku .4 s expo.in, skok pod zasłoną, okno .33 s expo.out, ≤ .9 s', () => {
  assert.match(fx, /var ZASL = \{ znak: 75, od: \.2, do: 40, zakryj: \.4, odkryj: \.33, przerwa: \.06 \};/);
  assert.match(fx, /r: rMax, duration: ZASL\.zakryj, ease: 'expo\.in'/);
  assert.match(fx, /o: R \+ 4, duration: ZASL\.odkryj, ease: 'expo\.out'/);
  assert.ok(.4 + .06 + .33 <= .9);
  assert.doesNotMatch(fx, /ellipse|EX = 1\.22/);                           // elipsa usunięta
  assert.match(pal, /\.zaslona-brzeg \{ clip-path: circle\(var\(--zr, 0px\) at 50% 50%\); \}/);
  assert.match(pal, /mask-image: radial-gradient\(circle at 50% 50%, transparent var\(--zo, 0px\)/);
  assert.match(fx, /e\.key === 'Escape'/);
  assert.match(fx, /addEventListener\('pointerdown', przerwij, true\)/);
  assert.match(fx, /setTimeout\(koniec, 1200\)/);
  assert.match(fx, /e\.detail === 0/);                                     // klawiatura: zwykły skok bez zasłony
  assert.match(fx, /document\.addEventListener\('click', klik, true\)/);
  assert.match(ruch, /window\.EBL_LENIS = lenis;/);
  assert.ok(existsSync(new URL('../img/logo-dama-zlota.webp', import.meta.url)));
});

test('złoty pył: punkty WebGL z bezpiecznikami jak gl.js', () => {
  assert.match(fx, /gl\.drawArrays\(gl\.POINTS, 0, rysowane\)/);
  assert.match(fx, /gl\.blendFunc\(gl\.ONE, gl\.ONE\)/);                    // addytywnie
  assert.match(fx, /failIfMajorPerformanceCaveat: !SW/);
  assert.match(fx, /Math\.min\(W\.devicePixelRatio \|\| 1, 1\.5\)/);
  assert.match(fx, /COMPILE_STATUS\)\) \{ gl\.deleteShader\(s\); return null; \}/);
  assert.match(fx, /webglcontextlost/);
  assert.match(fx, /saveData/);
  assert.match(fx, /IntersectionObserver/);
  assert.match(fx, /visibilitychange/);
  assert.match(fx, /sr > 34 && rysowane > N \/ 4/);                        // samoobrona
  assert.match(fx, /ile: 380/); assert.match(fx, /ile: 460/);
  // kolory z palety: różowe złoto #D4A49A i 24K #FBE7A1
  assert.match(fx, /vec3\(\.831,\.643,\.604\),vec3\(\.984,\.906,\.631\)/);
});

test('połysk H2, ceny stoją od razu (bez licznika od 0), kontakt bez animacji formularza', () => {
  assert.match(fx, /main > section:not\(\.hero\) h2/);
  // SILNIKI-2: licznik od zera wyłączony („cena jak wygrana”); tekst ceny nigdy nie jest podmieniany, zostaje połysk
  assert.doesNotMatch(fx, /textContent = szablon|e\.textContent = /);
  assert.match(fx, /blysk\(e, false\); stat\.ceny\+\+;/);
  assert.doesNotMatch(fx, /#contact (form|\.rdv|input)/);
  assert.match(pal, /@keyframes blysk-tekst/);
  assert.match(pal, /\.blysk-tekst\.blysk-ciemny \{ --g1: #8C6418;/);      // na lnie ciemne złoto, bez „musztardy”
});

test('orbita celów, kropki „Première visite”, obręcze, pas światła', () => {
  assert.match(fx, /cele\.classList\.add\('orbita'\)/);
  assert.match(fx, /pin: true/);
  assert.match(fx, /pointerenter', wej\)/);                                // pauza po najechaniu
  assert.match(fx, /focusin', wej\)/);
  assert.match(fx, /polygon\(0 -15%, ' \+ W1 \+ '% -15%, ' \+ \(w \* 118 - 18\)/);   // skośna maska jjettas
  assert.match(fx, /#visite \.duo/);
  assert.match(fx, /function maskaZlota\(img, pierscien\)/);
  assert.match(pal, /mix-blend-mode: plus-lighter; animation: obrecz-blysk/);
  assert.match(fx, /pas\.className = 'pas-swiatla'/);
  assert.match(pal, /#contact\.z-pasem \{ isolation: isolate; \}/);
  assert.match(pal, /\.pas-swiatla \{[^}]*z-index: -1;[^}]*pointer-events: none; \}/);
});

test('medaliony: 2,5D z mapy głębi w shaderze kart (gl.js), mapy na miejscu', () => {
  assert.match(gl, /uniform sampler2D uImg,uGl;/);
  assert.match(gl, /'img\/glebia\/' \+ m\[1\] \+ '-900-glebia\.webp'/);
  for (const f of ['dama-kapelusz', 'dama-czarny-kapelusz', 'dama-roza']) assert.ok(existsSync(new URL(`../img/glebia/${f}-900-glebia.webp`, import.meta.url)), f);
});

test('pierwszy ekran: twarz Moniki bez głębi i bez unoszenia, głowa w ramce', () => {
  assert.match(gl, /float gh=smoothstep\(1\.35,\.9,length\(\(um0-vec2\(\.55,\.26\)\)\/vec2\(\.36,\.34\)\)\);/);
  assert.match(gl, /\(1\.-gh\)/);
  assert.doesNotMatch(gl, /przew \* 70/);
  assert.match(ruch, /st\.setProperty\('--mty'/);
  assert.match(gl, /getPropertyValue\('--mty'\)/);
  assert.match(pal, /translate\(calc\(var\(--fp, 0\) \* var\(--msx, 0px\)\), var\(--msy, 0px\)\)/);
  // teleport: twarz w medalionie płaska (bez głębi, rozmycia i rozszczepienia)
  assert.match(pet, /float fm=sm\(1\.35,\.95,length\(\(uv-vec2\(\.53,\.30\)\)\/vec2\(\.2,\.25\)\)\);/);
  assert.match(pet, /\*\(1\.-fm\);float ca=/);
});

test('tor: numer i tytuł panelu zawsze pod nagłówkiem sekcji', () => {
  assert.match(pet, /tor\.style\.setProperty\('--tor-gora', Math\.round\(gora \+ 28\) \+ 'px'\)/);
  assert.match(pet, /Math\.max\(\.45,/);
  assert.match(pal, /\.tor-on \.panel-tresc \{ top: var\(--tor-gora, calc\(var\(--nav, 80px\) \+ 120px\)\); justify-content: safe flex-end; \}/);
});
