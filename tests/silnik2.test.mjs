// SILNIKI-2 (03.10.2026, projekt/wzory/SILNIKI-2.md): 15 poprawek z pomiaru wideo. Tylko komputer z ruchem;
// telefon i ograniczony ruch bez nowych efektów; decyzje Daniela (twarz Moniki, formularz, plakietki, paleta) nietknięte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const kod = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(kod('js/dane.js') + kod('js/teksty.js'), ctx);
const { T, EBL } = ctx.window;
const html = kod('index.html'), s2 = kod('js/silnik2.js'), pal = kod('css/paleta.css'), gl = kod('js/gl.js'),
  ruch = kod('js/ruch.js'), pet = kod('js/petardy.js'), fx = kod('js/efekty.js'), site = kod('js/site.js');
const blokS2 = pal.slice(pal.indexOf('SILNIKI-2 (03.10.2026'));

test('silnik2.js: po efekty.js, tylko komputer z ruchem, bez konsoli, każda gałąź ze sprzątaniem', () => {
  assert.ok(html.indexOf('<script src="js/silnik2.js"></script>') > html.indexOf('<script src="js/efekty.js"></script>'));
  assert.match(s2, /prefers-reduced-motion: reduce/);
  assert.match(s2, /H\.classList\.contains\('ruch-js'\)/);
  assert.match(s2, /var KOMPUTER = '\(min-width: 901px\)'/);
  assert.doesNotMatch(s2, /console\./);
  assert.equal((s2.match(/mm\.add\(/g) || []).length, 3);
  assert.equal((s2.match(/return function \(\) \{/g) || []).length, 3);
  // warstwy tylko ze skryptu; CSS chowa je na telefonie i przy ograniczonym ruchu
  assert.doesNotMatch(html, /class="[^"]*(menu-przycisk|menu-pelne|panel-ekran|polysk|monika-noc)/);
  assert.match(pal, /@media \(max-width: 900px\), \(prefers-reduced-motion: reduce\) \{\s*\.menu-przycisk, \.menu-pelne, \.panel-ekran, \.polysk, \.monika-noc, \.k-cien \{ display: none !important; \}/);
});

test('#1 płyn = maska: tusz ×0,3, zanik .90/klatkę (≤ 600 ms), nic nad blokiem tekstu, twarz bez efektu, bez refrakcji', () => {
  assert.match(gl, /TUSZ = \.55 \* \.3/);
  assert.match(gl, /ZANIK_T = 6\.7/);
  assert.ok(Math.pow(1 / (1 + 6.7 / 60), 36) < .03);                     // po 600 ms przy 60 kl./s zostaje < 3%
  assert.match(gl, /uBlok/);
  assert.match(gl, /float wolne=smoothstep\(0\.,40\.,length\(bd\)\);/);    // brzeg 40 px nad etykietą, H1 i przyciskami
  assert.match(gl, /trescEl = hero\.querySelector\('\.hero-tresc'\)/);
  assert.match(gl, /vec3\(\.039,\.043,\.051\)\*m/);                       // #101C3A → #1A2747
  assert.match(gl, /float poza=ma\*\(1\.-fa\);/);
  assert.doesNotMatch(gl, /uRefr|REFR/);
  // twarz Moniki nigdy nie deformowana (głębia tylko poza głową)
  assert.match(gl, /\(1\.-gh\)/);
});

test('#2 kurtyna: logo od dołu .9 s, okno 1,2 s nad twarzą, rośnie .45 s expo.in do skali ≥ 30, bezpiecznik 4 s', () => {
  assert.match(ruch, /var KURT = \{ buduj: \.9, okno: 1\.2, otworz: \.3, rosnie: \.45, skala: 30, h1: \.1 \};/);
  assert.ok(.3 + 1.2 + .3 + .45 <= 2.6);                                   // start skryptu + kurtyna ≤ 2,6 s
  assert.match(ruch, /clipPath: 'inset\(100% 0% 0% 0%\)' \}, \{ clipPath: 'inset\(0% 0% 0% 0%\)', duration: KURT\.buduj/);
  assert.match(ruch, /ease: 'expo\.in'/);
  assert.match(ruch, /function przyTwarzy\(img\)/);
  assert.match(ruch, /var rK = Math\.max\(rMax, r0 \* KURT\.skala\)/);
  assert.match(ruch, /setTimeout\(function \(\) \{ zdejmij\(\); otwarta\(\); \}, 4000\)/);
  assert.match(ruch, /dispatchEvent\(new CustomEvent\('ebl:po-kurtynie'\)\)/);
  assert.match(pal, /\.kurtyna\.k-okno \.k-znak \{ overflow: visible; \}/);
});

test('#3 menu pełnoekranowe: wypukła krawędź .55 s, kadry i linki stagger, Esc, pułapka fokusu, aria, inert', () => {
  for (const k of ['menu_ouvrir', 'menu_fermer', 'menu_nav', 'menu_langues', 'cta_rdv', 'telephone', 'image_synthese']) { assert.ok(T.fr[k], k); assert.match(s2, new RegExp("tekst\\('" + k + "'\\)")); }
  assert.match(s2, /var MENU = \{ spada: \.55, kadry: \.25, kadryCo: \.06, linki: \.35, linkiCo: \.07, wejscie: \.6, zamkniecie: \.6 \};/);
  assert.match(s2, /CustomEase\.create\('menu', '0\.65,0\.05,0,1'\)/);
  assert.match(pal, /\.mp-nic \{ clip-path: ellipse\(150% var\(--my, 0%\) at 50% 0%\);/);
  assert.match(s2, /m, \{ y: 160, duration: MENU\.spada/);
  assert.match(s2, /yPercent: 110 \}, \{ yPercent: 0, duration: MENU\.wejscie/);
  assert.match(s2, /aria-expanded/); assert.match(s2, /aria-modal/);
  assert.match(s2, /e\.key === 'Escape'/); assert.match(s2, /e\.key !== 'Tab'/);
  assert.match(s2, /setAttribute\('inert', ''\)/);
  assert.match(s2, /D\.telefonTekst/);                                      // telefon z js/dane.js, nie wpisany
  for (const f of ['img/rtx/ems-urzadzenie-900.webp', 'img/rtx/krio-urzadzenie-900.webp', 'img/rtx/kabina-daniel-1200.webp', 'img/logo-dama-zlota.webp'])
    assert.ok(existsSync(new URL('../' + f, import.meta.url)), f);
  assert.match(s2, /el\('span', 'plakietka', tekst\('image_synthese'\)\)/);   // kadry RTX z plakietką
});

test('#4 rolka tekstu .27 s, kontakt bez zmian; #5 bloki na wielkich nagłówkach (raz, top 80%)', () => {
  assert.match(pal, /transition: transform \.27s cubic-bezier\(\.65, \.05, 0, 1\)/);
  assert.match(s2, /e\.closest\('#contact'\)/);
  assert.match(ruch, /var BLOK = \{ rosnie: \.45, co1: \.08, znika: \.6, co2: \.1 \};/);
  assert.match(ruch, /ease: 'power3\.inOut'/); assert.match(ruch, /ease: 'expo\.inOut'/);
  assert.match(ruch, /kolejka\(H2_BLOKI, 'bloki', 'top 80%'\)/);
  assert.equal((html.match(/<h2 class="h-blok"/g) || []).length, 5);
  assert.match(ruch, /'#0A142C' : '#D4A49A'/);                             // granat na lnie, różowe złoto na granacie
  assert.match(pet, /W\.EBL_BLOKI/);                                        // tytuły paneli w torze
});

test('#6–#8 orbita jaśniejsza, #monika z granatu w len, pętle wideo RTX z wejściem „telewizor”', () => {
  assert.match(fx, /o\.opacity = \(\(\.5 \+ \.5 \* Math\.pow\(p, 1\.3\)\)/);
  assert.match(ruch, /noc\.className = 'monika-noc'/);
  assert.match(ruch, /color: '#F6F0E4' \}, \{ color: kol\[i\], ease: 'editorial'/);
  assert.match(ruch, /innerHeight \* \.6/);
  for (const f of ['krio-mgla.mp4', 'krio-mgla-plakat.webp', 'kabina-swiatlo.mp4', 'kabina-swiatlo-plakat.webp']) {
    assert.ok(existsSync(new URL('../img/rtx/' + f, import.meta.url)), f); assert.match(pet, new RegExp(f.replace('.', '\\.')));
  }
  assert.match(pet, /muted loop playsinline preload="none"/);
  assert.match(pet, /scaleY: \.004 \}, \{ scaleY: \.08, duration: \.25, ease: 'expo\.out' \}/);
  assert.match(pet, /scaleY: 1, duration: \.3, ease: 'expo\.inOut'/);
  assert.match(pet, /filter: 'brightness\(2\.2\)'/);
  assert.match(pet, /IntersectionObserver/);                                // wideo gra tylko w kadrze
  assert.match(pet, /Q\('\.plakietka', f\)\.textContent/);
});

test('#9 przechył ±6° + połysk; #10 przelot światła; #11 medalion; #12 tło toru; #13 kula; #14 pas; ceny bez licznika', () => {
  assert.match(s2, /ry\(\(x - \.5\) \* 12\); rx\(\(\.5 - y\) \* 12\);/);
  assert.match(s2, /transformPerspective: 900/);
  assert.match(s2, /scale: 1\.04, duration: \.25/);
  assert.match(pal, /rgba\(246, 240, 228, \.28\) 50%/);
  assert.match(gl, /PRZ_DL = 2, PRZ_CO = \[8, 10\], PRZ_SLABY = \.4/);
  assert.match(gl, /PAR_M = 8/);
  assert.match(pet, /var TLO = \[\[10, 20, 44\], \[16, 28, 58\], \[14, 26, 54\]\];/);   // #0A142C → #101C3A → #0E1A36
  assert.match(pal, /#visite \.kula\.kula-glowa \{[^}]*width: 520px;[^}]*filter: blur\(60px\); opacity: \.55; mix-blend-mode: screen;/);
  assert.match(ruch, /gsap\.quickTo\(kula, 'x', \{ duration: \.8/);
  assert.match(pal, /\.pas-smuga \{[^}]*filter: blur\(40px\);/);
  const ceny = []; EBL.zabiegi.forEach(z => (z.ceny || []).forEach(c => ceny.push(c.cena)));
  assert.deepEqual(ceny, [100, 180, 350, 500]);
  assert.doesNotMatch(fx, /n: ceny\[i\]/);
});

test('tor: liczone tylko dwa zabiegi („01 / 02”), pierwsza wizyta bez numeru, z podpisem i przyciskiem rezerwacji', () => {
  assert.equal(EBL.zabiegi.length, 2);
  assert.match(html, /<span class="tor3-z">\/ 02<\/span>/);
  const wiz = html.slice(html.indexOf('<article class="panel panel-wizyta"'), html.indexOf('</article>', html.indexOf('panel-wizyta')));
  assert.doesNotMatch(wiz, /panel-nr/);
  assert.match(wiz, /<p class="panel-nad" data-t="tor_3_nad"><\/p>/);
  assert.match(wiz, /href="#contact" data-t="cta_rdv"/);
  assert.ok(T.fr.tor_3_nad);
  assert.match(pet, /classList\.contains\('karta'\)/);
  assert.match(pet, /tor3-licznik-off/);
  assert.match(site, /a\.querySelector\('a'\)\.textContent = tekst\(lang, 'reserver_soin'\)/);
  // analizator: ekran z napisami przyciemniony i rozmyty
  assert.ok(existsSync(new URL('../img/rtx/analizator-900.webp', import.meta.url)));
  assert.match(site, /img\/rtx\/analizator-900\.webp/);
  assert.match(pal, /\.urzadzenie-ekran \{[^}]*filter: blur\(7px\) brightness\(\.38\)/);
});
