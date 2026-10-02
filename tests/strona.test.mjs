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
