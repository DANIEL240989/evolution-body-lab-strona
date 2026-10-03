// Teleport (#approche), tor „3 petardy w lewo” (#soins) i pierwszy ekran z Moniką (03.10.2026, js/petardy.js, js/gl.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const kod = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const jest = p => existsSync(new URL('../' + p, import.meta.url));
const ctx = { window: {} };
vm.runInNewContext(kod('js/dane.js') + kod('js/teksty.js'), ctx);
const { T, EBL } = ctx.window;
const html = kod('index.html'), pet = kod('js/petardy.js'), pal = kod('css/paleta.css'), site = kod('js/site.js'), ruch = kod('js/ruch.js'), gl = kod('js/gl.js');
const sekcja = id => html.slice(html.indexOf(id), html.indexOf('</section>', html.indexOf(id)));

test('petardy.js: ładowany po gl.js, tylko komputer z ruchem, bez komunikatów w konsoli', () => {
  assert.ok(html.indexOf('<script src="js/petardy.js"></script>') > html.indexOf('<script src="js/gl.js"></script>'));
  assert.match(pet, /prefers-reduced-motion: reduce/);
  assert.match(pet, /var KOMPUTER = '\(min-width: 901px\)'/);
  assert.match(pet, /H\.classList\.contains\('ruch-js'\)/);          // bez bibliotek ruchu nic nie startuje
  assert.doesNotMatch(pet, /console\./);
  // klasy przypiętych scen dodaje dopiero skrypt: bez JS układ pionowy
  assert.doesNotMatch(html, /class="[^"]*(portal-on|tor-on|portal-gl-on)/);
  assert.match(pal, /\.tor3-tlo, \.tor3-licznik, \.tor3-pasek \{ display: none; \}/);
  assert.match(pal, /\.portal-blysk, \.portal-wskazowka \{ display: none; \}/);
  assert.match(pet, /PIN_PORTAL = 2\.8, PIN_TOR = 3\.4/);
});

test('teleport: medalion z plakietką, manifest po drugiej stronie, WebGL z bezpiecznikami', () => {
  const s = sekcja('id="approche"');
  assert.match(html, /<section class="noc manifest portal" id="approche">/);
  assert.match(s, /class="portal-scena"[\s\S]*class="plakietka" data-t="image_synthese"/);
  assert.match(s, /img\/ilustracje\/dama-roza-900\.webp/);
  assert.match(s, /class="portal-druga[^"]*"[\s\S]*data-t="manifeste"/);
  assert.match(s, /id="objectifs"/);
  for (const f of ['img/ilustracje/dama-roza-900.webp', 'img/glebia/dama-roza-900-glebia.webp', 'img/materialy/granat-kora-3.webp', 'img/glebia/granat-kora-3-glebia.webp']) {
    assert.ok(pet.includes(f), f); assert.ok(jest(f), f);
  }
  assert.match(pet, /failIfMajorPerformanceCaveat: !SW/);
  assert.match(pet, /COMPILE_STATUS\)\) \{ gl\.deleteShader\(s\); return null; \}/);
  assert.match(pet, /webglcontextlost/);
  assert.match(pet, /saveData/);
  assert.match(pet, /Math\.min\(W\.devicePixelRatio \|\| 1, 1\.5\)/);
  assert.match(pet, /setAttribute\('aria-hidden', 'true'\)/);
  assert.match(pet, /scrub: \.8/);                                       // czas = przewijanie
  // etykieta manifestu nie wchodzi drugi raz z kolejki ruch.js
  assert.match(ruch, /\.etykieta:not\(\.portal-druga \.etykieta\)/);
  assert.ok(T.fr.portal_entrer);
});

test('tor: 3 panele, ceny z dane.js, „Réserver ce soin” nadal zaznacza zabieg w kreatorze', () => {
  const s = sekcja('id="soins"');
  assert.match(s, /class="tor3-tasma">\s*<div class="karty" id="karty-zabiegow"><\/div>/);
  assert.match(s, /class="panel panel-wizyta"[\s\S]*class="plakietka" data-t="image_synthese"[\s\S]*href="#contact"[\s\S]*href="#visite"/);
  assert.equal(EBL.zabiegi.length + 1, 3);
  assert.match(site, /a\.className = 'karta panel'/);                   // js/rezerwacja.js: #karty-zabiegow .karta a
  assert.match(site, /tekst\(lang, 'a_partir'\) \+ ' ' \+ z\.cena \+ ' €'/);
  assert.match(site, /if \(z\.test\)/);                                 // kriolipoliza z dopiskiem TEST
  assert.match(site, /var RTX = \{ ems: null, cryo: null, visite: null \}/);
  for (const m of site.match(/img\/materialy\/[a-z0-9-]+\.webp/g)) assert.ok(jest(m), m);
  for (const k of ['tor_fond', 'tor_3_lien', 'visite_label', 'soins_fin', 'visite_pratique', 'reserver_soin']) assert.ok(T.fr[k], k);
  // kolejność sekcji i kotwice bez zmian
  assert.ok(html.indexOf('id="approche"') < html.indexOf('id="soins"') && html.indexOf('id="soins"') < html.indexOf('id="tarifs"'));
  assert.match(pet, /ScrollTrigger\.sort\(\)/);
  assert.match(pet, /ScrollTrigger\.addEventListener\('refresh', doCelu\)/);   // wejście linkiem #sekcja po pinach
});

test('pierwszy ekran: Monika narysowana nad falą, bez plakietki na postaci, mapa głębi pod stałą nazwą', () => {
  const fala = html.slice(html.indexOf('<div class="hero-fala"'), html.indexOf('</div>', html.indexOf('<div class="hero-fala"'))).replace(/<!--[\s\S]*?-->/g, '');
  assert.match(fala, /class="hero-monika" src="img\/monika-rys-hero\.webp"/);
  assert.match(fala, /data-t="h_wielki"/);
  assert.doesNotMatch(fala, /plakietka/);
  assert.match(sekcja('class="hero'), /class="plakietka" data-t="image_synthese"/);   // plakietka zostaje na fali
  for (const f of ['img/monika-rys.webp', 'img/monika-rys-hero.webp', 'img/glebia/monika-rys-glebia.webp', 'narzedzia/monika_hero.py']) assert.ok(jest(f), f);
  assert.ok(gl.includes("'img/monika-rys-hero.webp', 'img/glebia/monika-rys-glebia.webp'"));
  assert.match(pal, /\.hero-imie, \.hero-monika \{ display: none; \}/);     // telefon bez zmian
  assert.match(ruch, /var LOGO_KOLO = \{ x: \.530, y: \.399, r: \.413 \}/);   // okno kurtyny w obręczy nowego logo
});
