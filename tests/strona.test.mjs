import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  assert.match(ruch, /setTimeout\(function \(\) \{ zdejmij\(\); otwarta\(\); \}, 6000\)/);
});

test('plakietka „Image de synthèse” przy obrazach AI, zdjęcie Moniki bez plakietki', () => {
  const sekcja = id => html.slice(html.indexOf(id), html.indexOf('</section>', html.indexOf(id)));
  for (const id of ['class="hero', 'id="soins"', 'id="contact"']) assert.match(sekcja(id), /class="plakietka" data-t="image_synthese"/, id);
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
  assert.equal(fig.length, 3);   // róża (manifest), kapelusz (wizyta), czarny kapelusz (pytania)
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
  assert.match(html, /<section class="hero noc">\s*<div class="hero-fala" aria-hidden="true"><\/div>/);
  // warstwy i klasy ruchu włącza dopiero skrypt: bez JS fala zostaje tłem sekcji, granica #visite/#monika prosta
  assert.match(pal, /\.hero-fala \{ display: none; \}/);
  for (const k of ['hero-rama', 'k-okno', 'skos', 'pod-skosem', 'z-linia', 'zapalony', 'unosi']) assert.match(ruch, new RegExp("'" + k + "'"), k);
  assert.doesNotMatch(html, /class="[^"]*(hero-rama|skos|z-linia|unosi)/);
  // plakietka hero jedzie z rogiem ramki, nie znika
  assert.match(pal, /\.hero\.hero-rama \.hero-obraz \.plakietka \{ right: var\(--pr/);
  assert.match(pal, /@media \(prefers-reduced-motion: reduce\) \{\s*#soins \.karta\.unosi \{ animation: none; \}/);
});
