import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const kod = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(kod('js/dane.js') + kod('js/teksty.js'), ctx);
const { T, JEZYKI, EBL } = ctx.window;
const html = kod('index.html');

test('kolejność języków: FR, EN, ES, PL, RU, DE', () => {
  assert.deepEqual([...JEZYKI], ['fr', 'en', 'es', 'pl', 'ru', 'de']);
});

test('każdy klucz data-t z HTML ma tekst francuski', () => {
  const klucze = [...html.matchAll(/data-t="([^"]+)"/g)].map(m => m[1]);
  klucze.push(...[...html.matchAll(/data-t-attr="[^:]+:([^"]+)"/g)].map(m => m[1]));
  const brak = klucze.filter(k => !T.fr[k]);
  assert.deepEqual(brak, []);
});

test('każdy zabieg ma nazwę i opis po francusku', () => {
  for (const z of EBL.zabiegi) {
    assert.ok(T.fr['s_' + z.id + '_t'], z.id);
    assert.ok(T.fr['s_' + z.id + '_d'], z.id);
  }
});

test('godziny pon-pt 9-19, weekend zamknięty', () => {
  assert.deepEqual([...EBL.godziny.dni], [1, 2, 3, 4, 5]);
  assert.equal(EBL.godziny.od, '09:00');
  assert.equal(EBL.godziny.do, '19:00');
});

test('Monika: tylko francuski i polski jako języki obsługi, nigdy "6 langues"', () => {
  assert.match(T.fr.langues_val, /français et polonais/);
  assert.doesNotMatch(JSON.stringify(T), /6 langues|six langues/i);
});

test('bez obietnic efektu', () => {
  assert.doesNotMatch(JSON.stringify(T.fr), /garanti[e]? |résultats? garantis(?! \?)|guérit|définitivement/i);
});

test('wersja pokazowa jest ukryta przed Google', () => {
  assert.match(html, /noindex/);
  assert.match(kod('robots.txt'), /Disallow: \//);
});

test('ruch: biblioteki z cdnjs mają SRI i crossorigin, Lenis i silnik ruchu lokalnie', () => {
  const cdn = [...html.matchAll(/<script src="https:\/\/cdnjs[^>]+>/g)].map(m => m[0]);
  assert.ok(cdn.length >= 2);
  for (const s of cdn) { assert.match(s, /integrity="sha384-[A-Za-z0-9+/=]+"/); assert.match(s, /crossorigin="anonymous"/); }
  assert.match(html, /<script src="js\/lenis\.min\.js"><\/script>/);
  assert.match(html, /<script src="js\/ruch\.js"><\/script>/);
});

test('ruch: ograniczony ruch i brak bibliotek = nic nie ukryte, bezpieczniki czasowe w CSS', () => {
  const ruch = kod('js/ruch.js'), css = kod('css/style.css');
  assert.match(ruch, /prefers-reduced-motion: reduce/);
  assert.match(ruch, /if \(!ok\) \{ H\.classList\.remove\('ruch', 'kurtyna-on'\)/);
  assert.match(css, /html\.kurtyna-on:not\(\.ruch-js\) \.kurtyna \{ animation: kurtyna-awaryjna \.5s 4s forwards/);
  assert.match(css, /html\.ruch:not\(\.ruch-js\)[^{]+\{ opacity: 0; animation: ruch-awaryjnie \.01s 3s forwards/);
  assert.match(ruch, /setTimeout\(function \(\) \{ zdejmij\(\); otwarta\(\); \}, 4000\)/);   // SILNIKI-2 #2: kurtyna ≤ 4 s
});

test('plakietka „Image de synthèse” przy obrazach AI, zdjęcie Moniki bez plakietki', () => {
  const sekcja = id => html.slice(html.indexOf(id), html.indexOf('</section>', html.indexOf(id)));
  // #soins: medalion damy w panelu „Première visite” (ilustracja AI) ma plakietkę
  assert.match(sekcja('id="soins"'), /class="plakietka" data-t="image_synthese"/);
  // pierwszy ekran i kontakt stoją na czystym granacie (nie obraz AI): bez plakietki
  for (const id of ['class="hero', 'id="contact"']) assert.doesNotMatch(sekcja(id), /plakietka/, id);
  assert.doesNotMatch(sekcja('id="monika"'), /plakietka/);
  assert.match(kod('js/site.js'), /\.plakietka'\)\.textContent = tekst\(lang, 'image_synthese'\)/);
});

test('teksty z wyróżnieniem (*słowo*) mają parzystą liczbę gwiazdek', () => {
  for (const k of [...html.matchAll(/class="[^"]*t-em[^"]*" data-t="([^"]+)"/g)].map(m => m[1])) {
    assert.ok(T.fr[k], k);
    assert.equal((T.fr[k].match(/\*/g) || []).length % 2, 0, k);
  }
});

test('ilustracje marki: plakietka, alt z kluczy, srcset, poza sekcją Moniki', () => {
  const fig = [...html.matchAll(/<figure class="ilustracja[\s\S]*?<\/figure>/g)].map(m => m[0]);
  assert.equal(fig.length, 2);   // kapelusz (wizyta), czarny kapelusz (pytania); róża jest medalionem teleportu (#approche)
  for (const f of fig) {
    assert.match(f, /class="plakietka" data-t="image_synthese"/);
    assert.match(f, /data-t-attr="alt:ilustracja_alt"/);
    assert.match(f, /srcset="[^"]+600w[^"]+900w"/);
    assert.match(f, /loading="lazy"/);
  }
  assert.ok(T.fr.ilustracja_alt);
  const monika = html.slice(html.indexOf('id="monika"'), html.indexOf('</section>', html.indexOf('id="monika"')));
  assert.doesNotMatch(monika, /ilustracj/);
});

test('ruch: efekty P1 silników (tokeny, okno logo, ramka hero, skos, linia kroków) tylko z JS, bez ukrywania treści', () => {
  const ruch = kod('js/ruch.js'), pal = kod('css/paleta.css');
  for (const n of ['reveal', 'editorial', 'ui', 'cover']) assert.match(ruch, new RegExp(n + ": '[0-9.,]+'"), n);
  for (const n of ['--e-reveal', '--e-editorial', '--e-ui', '--e-cover']) assert.match(pal, new RegExp(n + ':'), n);
  assert.match(ruch, /lerp: \.1[2-6]/);                                     // Lenis krótszy niż dawne .09
  assert.match(ruch, /matchMedia\('\(hover: hover\) and \(pointer: fine\)'\)\.matches\) \{\s*\n?\s*\/\*[^*]*\*\/\s*lenis = new Lenis/);
  assert.match(html, /<section class="hero noc">\s*<div class="hero-fala" aria-hidden="true">/);
  // warstwy i klasy ruchu włącza dopiero skrypt: bez JS fala zostaje tłem sekcji, granica #visite/#monika prosta
  assert.match(pal, /\.hero-fala \{ display: none; \}/);
  for (const k of ['hero-rama', 'k-okno', 'skos', 'pod-skosem', 'z-linia', 'zapalony']) assert.match(ruch, new RegExp("'" + k + "'"), k);
  assert.doesNotMatch(html, /class="[^"]*(hero-rama|skos|z-linia|unosi)/);
});

test('WebGL (js/gl.js): ładowany po ruch.js, bezpieczniki, mapy głębi na miejscu, latarka CSS usunięta', () => {
  const gl = kod('js/gl.js'), ruch = kod('js/ruch.js'), pal = kod('css/paleta.css');
  assert.ok(html.indexOf('<script src="js/gl.js"></script>') > html.indexOf('<script src="js/ruch.js"></script>'));
  // ograniczony ruch, oszczędzanie danych, brak WebGL: nic nie startuje, zostaje obraz CSS
  assert.match(gl, /prefers-reduced-motion: reduce/);
  assert.match(gl, /saveData/);
  assert.match(gl, /if \(wolno\(\) \|\| !W\.WebGLRenderingContext\) return;/);
  assert.match(gl, /failIfMajorPerformanceCaveat: !SW/);
  assert.match(gl, /COMPILE_STATUS\)\) \{ gl\.deleteShader\(s\); return null; \}/);   // błąd shadera = cicho null
  assert.doesNotMatch(gl, /console\./);
  assert.match(gl, /webglcontextlost/);
  // wydajność: dpr max 1.5 (telefon 1), pauza poza ekranem i przy ukrytej karcie
  assert.match(gl, /Math\.min\(W\.devicePixelRatio \|\| 1, TEL\.matches \? 1 : 1\.5\)/);
  assert.match(gl, /IntersectionObserver/);
  assert.match(gl, /visibilitychange/);
  // płótna aria-hidden, plakietka zostaje w HTML
  assert.equal((gl.match(/setAttribute\('aria-hidden', 'true'\)/g) || []).length, 2);
  for (const f of ['img/monika-rys-hero.webp', 'img/glebia/monika-rys-glebia.webp']) {
    assert.ok(gl.includes(f), f);
    assert.ok(readFileSync(new URL('../' + f, import.meta.url)).length > 1000, f);
  }
  // klasy włącza dopiero skrypt; przy ograniczonym ruchu płótna schowane także w CSS
  assert.match(pal, /\.hero\.gl-on \.hero-fala \{ display: block;/);
  assert.match(pal, /@media \(prefers-reduced-motion: reduce\) \{\s*\.gl-hero, \.gl-plotno \{ display: none; \}/);
  assert.doesNotMatch(html, /gl-on|gl-fx/);
  assert.doesNotMatch(ruch + pal, /hero-latarka/);
});

test('granat zamiast kamienia (03.10.2026): obrazy kamienia nie są ładowane, pliki Daniela zostają w repo', () => {
  const pliki = ['index.html', 'css/style.css', 'css/paleta.css', 'css/rezerwacja.css', 'js/site.js', 'js/gl.js', 'js/petardy.js', 'js/ruch.js'];
  const kamien = /img\/materialy\/(fala-|granat-kora|klif|karta-|kamien|lupek|kora-3d)/;
  for (const p of pliki) assert.doesNotMatch(kod(p).replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, ''), kamien, p);
  for (const f of ['fala-pc', 'fala-tel', 'granat-kora-3', 'klif-lustro', 'karta-1']) assert.ok(existsSync(new URL('../img/materialy/' + f + '.webp', import.meta.url)), f);
  const pal = kod('css/paleta.css');
  assert.match(pal, /--granat: #0A142C;/);
  assert.match(pal, /--tlo-granat: var\(--ziarno\), var\(--winieta\), var\(--granat\);/);
  assert.match(pal, /feTurbulence/);                                        // ziarno przeciw pasom gradientu
  // shader pierwszego ekranu: tło liczone, przygaszenie na twarzy Moniki
  const gl = kod('js/gl.js');
  assert.match(gl, /vec3 tlo\(vec2 q\)/);
  assert.match(gl, /float poza=ma\*\(1\.-fa\);/);                             // SILNIKI-2: płyn i przelot światła omijają twarz
});

test('Monika wycięta na końcu strony: prawdziwe zdjęcie bez plakietki, pliki pod stałymi nazwami', () => {
  const stopka = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
  assert.match(stopka, /<figure class="stopka-monika">[\s\S]*src="img\/monika-wycieta-900\.webp"[\s\S]*img\/monika-wycieta\.webp 1080w/);
  assert.match(stopka, /data-t-attr="alt:monika_alt"/);
  // Monika (figure) bez plakietki; plakietka tylko dla witryny AI w tle panelu (Daniel 03.10.2026)
  const fig = stopka.slice(stopka.indexOf('<figure class="stopka-monika">'), stopka.indexOf('</figure>', stopka.indexOf('<figure class="stopka-monika">')));
  assert.doesNotMatch(fig, /plakietka/);
  assert.equal((stopka.match(/class="plakietka/g) || []).length, 1);
  assert.match(stopka, /class="plakietka stopka-witryna-plak" data-t="image_synthese"/);
  assert.ok(existsSync(new URL('../img/rtx/witryna-1920.webp', import.meta.url)));
  for (const f of ['img/monika-wycieta.webp', 'img/monika-wycieta-900.webp']) assert.ok(existsSync(new URL('../' + f, import.meta.url)), f);
});
