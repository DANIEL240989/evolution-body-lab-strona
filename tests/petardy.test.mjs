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
  for (const f of ['img/ilustracje/dama-roza-900.webp', 'img/glebia/dama-roza-900-glebia.webp']) {
    assert.ok(pet.includes(f), f); assert.ok(jest(f), f);
  }
  // druga strona: czysty granat z pyłem i pierścieniami w shaderze, bez obrazu kamienia; plakietka gaśnie z różą
  assert.doesNotMatch(pet, /img\/materialy\//);
  assert.match(pet, /vec3 pyl\(/);
  assert.match(pet, /plak\.style\.opacity/);
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
  // RTX: EMS = sama stacja (bez kombinezonu), kriolipoliza = urządzenie (przezroczyste tło), wizyta = kabina Daniela (kadr wtopiony w granat); wszystko z plakietką
  assert.match(site, /ems: \{ wolny: true, src: 'img\/rtx\/ems-urzadzenie-900\.webp', srcset: 'img\/rtx\/ems-urzadzenie-900\.webp 589w, img\/rtx\/ems-urzadzenie-1400\.webp 917w, img\/rtx\/ems-urzadzenie-2000\.webp 1310w'/);
  assert.doesNotMatch(site, /src: 'img\/rtx\/ems-kombinezon/);   // kombinezon niehigieniczny (Daniel 03.10.2026)
  for (const f of ['img/rtx/ems-urzadzenie-900.webp', 'img/rtx/ems-urzadzenie-1400.webp', 'img/rtx/krio-urzadzenie-900.webp', 'img/rtx/krio-urzadzenie-1400.webp', 'img/rtx/kabina-daniel-1200.webp', 'img/rtx/kabina-daniel-1920.webp']) assert.ok(jest(f), f);
  assert.match(site, /return h \+ '<span class="plakietka"><\/span>';/);   // każdy render i wideo RTX z plakietką
  assert.match(site, /cryo: \{ wolny: true, chlod: true, src: 'img\/rtx\/krio-urzadzenie-900\.webp'/);
  assert.match(site, /visite: \{ kadr: true, src: 'img\/rtx\/kabina-daniel-1200\.webp'/);
  assert.match(site, /preload="none"/);   // wideo (gdy wpisane w RTX) ładowane dopiero przy zbliżeniu
  assert.match(site, /prefers-reduced-motion: reduce/);
  for (const f of ['img/rtx/ems-urzadzenie-900.webp', 'img/rtx/ems-urzadzenie-1400.webp']) assert.ok(jest(f), f);
  assert.match(pet, /setProperty\('--ry'/);
  // panele na granacie: bez obrazów kamienia; do czasu renderów RTX element zastępczy (obręcz z monogramem), bez plakietki
  assert.doesNotMatch(site, /img\/materialy\//);
  assert.match(site, /rtx \? obrazRtx\(rtx\) : zastepczy\(\)/);
  assert.match(s, /class="panel-obraz panel-zastep"[\s\S]*class="zastep-krag zastep-medalion"[\s\S]*dama-kapelusz/);
  for (const k of ['tor_fond', 'tor_3_lien', 'visite_label', 'soins_fin', 'visite_pratique', 'reserver_soin']) assert.ok(T.fr[k], k);
  // kolejność sekcji i kotwice bez zmian
  assert.ok(html.indexOf('id="approche"') < html.indexOf('id="soins"') && html.indexOf('id="soins"') < html.indexOf('id="tarifs"'));
  assert.match(pet, /ScrollTrigger\.sort\(\)/);
  assert.match(pet, /ScrollTrigger\.addEventListener\('refresh', doCelu\)/);   // wejście linkiem #sekcja po pinach
});

test('pierwszy ekran: Monika narysowana na granacie, bez plakietki, mapa głębi pod stałą nazwą', () => {
  const fala = html.slice(html.indexOf('<div class="hero-fala"'), html.indexOf('</div>', html.indexOf('<div class="hero-fala"'))).replace(/<!--[\s\S]*?-->/g, '');
  assert.match(fala, /class="hero-monika" src="img\/monika-rys-hero\.webp"/);
  assert.match(fala, /data-t="h_wielki"/);
  assert.doesNotMatch(fala, /plakietka/);
  assert.doesNotMatch(sekcja('class="hero'), /plakietka/);   // granat to nie obraz AI, Monika to prawdziwa osoba
  for (const f of ['img/monika-rys.webp', 'img/monika-rys-hero.webp', 'img/monika-rys-hero-2048.webp', 'img/rtx/ems-urzadzenie-2000.webp', 'img/rtx/krio-urzadzenie-2000.webp', 'img/rtx/kabina-daniel-2880.webp', 'img/rtx/witryna-2880.webp', 'img/glebia/monika-rys-glebia.webp', 'narzedzia/monika_hero.py']) assert.ok(jest(f), f);
  assert.ok(gl.includes("'img/monika-rys-hero-2048.webp' : 'img/monika-rys-hero.webp'), 'img/glebia/monika-rys-glebia.webp'"));   // HD z mastera 8K na dużych ekranach
  assert.match(pal, /\.hero-imie, \.hero-monika \{ display: none; \}/);     // telefon bez zmian
  assert.match(ruch, /var LOGO_KOLO = \{ x: \.530, y: \.399, r: \.413 \}/);   // okno kurtyny w obręczy nowego logo
});
