import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const kod = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(kod('js/dane.js') + kod('js/teksty.js') + kod('js/rezerwacja.js'), ctx);
const { T, EBL, EBL_REZ: R } = ctx.window;
const html = kod('index.html');
const js = kod('js/rezerwacja.js');
const css = kod('css/rezerwacja.css');
const sekcja = id => html.slice(html.indexOf('id="' + id + '"'), html.indexOf('</section>', html.indexOf('id="' + id + '"')));

// poniedziałek 5.10.2026, 8:00 (czas lokalny)
const PON = new Date(2026, 9, 5, 8, 0);

test('ceny z dane.js: EMS 100 € / séance, kriolipoliza 180 / 350 / 500 € za 1–3 strefy, kriolipoliza TEST', () => {
  const ems = EBL.zabiegi.find(z => z.id === 'ems'), cryo = EBL.zabiegi.find(z => z.id === 'cryo');
  assert.deepEqual([...ems.ceny.map(c => c.cena)], [100]);
  assert.deepEqual([...cryo.ceny].map(c => [c.strefy, c.cena]), [[1, 180], [2, 350], [3, 500]]);
  assert.equal(cryo.test, true);
  assert.equal(EBL.rezerwacjeOnline, false);
  // cennik nie ma cen wpisanych na sztywno w HTML ani w skrypcie
  assert.doesNotMatch(sekcja('tarifs'), /\d+\s*€/);
  assert.doesNotMatch(js, /\b(100|180|350|500)\b/);
});

test('opcje kreatora: EMS, kriolipoliza 1–3 strefy, pierwsza wizyta-konsultacja', () => {
  assert.deepEqual([...R.opcje()].map(o => o.id), ['ems', 'cryo-1', 'cryo-2', 'cryo-3', 'conseil']);
  assert.equal(R.nazwaOpcji(R.opcje()[2], 'fr'), 'Cryolipolyse · 2 zones');
  assert.equal(R.nazwaOpcji(R.opcje()[1], 'fr'), 'Cryolipolyse · 1 zone');
});

test('sloty 9:00–18:00 co 30 min (ostatni start 18:00)', () => {
  const s = [...R.sloty()];
  assert.equal(s.length, 19);
  assert.equal(s[0], '09:00'); assert.equal(s[1], '09:30'); assert.equal(s.at(-1), '18:00');
  assert.ok(!s.includes('18:30'));
});

test('weekendy i przeszłe dni nieaktywne, pon–pt aktywne', () => {
  assert.equal(R.dzienAktywny(new Date(2026, 9, 10), PON), false);   // sobota
  assert.equal(R.dzienAktywny(new Date(2026, 9, 11), PON), false);   // niedziela
  assert.equal(R.dzienAktywny(new Date(2026, 9, 2), PON), false);    // piątek w przeszłości
  for (let d = 5; d <= 9; d++) assert.equal(R.dzienAktywny(new Date(2026, 9, d), PON), true, 'październik ' + d);
  // dziś po 16:00 nie zostaje żaden slot z zapasem 2 h, więc dzień gaśnie
  assert.equal(R.dzienAktywny(new Date(2026, 9, 5), new Date(2026, 9, 5, 16, 30)), false);
  assert.equal(R.slotWolny(new Date(2026, 9, 5), '09:30', new Date(2026, 9, 5, 8, 0)), false);
  assert.equal(R.slotWolny(new Date(2026, 9, 5), '10:00', new Date(2026, 9, 5, 8, 0)), true);
  // pierwszy wolny dzień w sobotę = poniedziałek
  const p = R.pierwszyAktywny(new Date(2026, 9, 10, 12, 0));
  assert.deepEqual([p.getFullYear(), p.getMonth(), p.getDate()], [2026, 9, 12]);
});

test('telefon francuski: 0X XX XX XX XX i +33', () => {
  for (const ok of ['06 12 34 56 78', '0612345678', '+33 6 12 34 56 78', '+33612345678', '0033 6 12 34 56 78', '04.93.12.34.56'])
    assert.equal(R.telefonOk(ok), true, ok);
  for (const zle of ['', '612345678', '06 12 34 56', '+48 600 100 200', '00 12 34 56 78', 'abc']) assert.equal(R.telefonOk(zle), false, zle);
});

test('wiadomość WhatsApp zawiera zabieg, datę, godzinę i dane; link wa.me z numerem z dane.js', () => {
  const w = { opcja: R.opcje()[2], dzien: new Date(2026, 9, 6), godzina: '10:30', nom: 'Claire Martin', tel: '06 12 34 56 78', mail: '', message: '' };
  const m = R.wiadomosc(w, 'fr');
  assert.match(m, /Cryolipolyse · 2 zones \(350\s€\)/);
  assert.match(m, /Mardi 6 octobre 2026/);
  assert.match(m, /10:30/);
  assert.match(m, /Claire Martin/);
  assert.doesNotMatch(m, /E-mail :/);   // puste pola opcjonalne nie wchodzą
  const link = R.linkWhatsApp(w, 'fr');
  assert.ok(link.startsWith('https://wa.me/' + EBL.whatsapp.replace(/\D/g, '') + '?text='));
  assert.equal(decodeURIComponent(link.split('?text=')[1]), m);
  assert.ok(R.linkMail(w, 'fr').startsWith('mailto:' + EBL.email + '?subject='));
});

test('nigdy „confirmé”: prośba, nie potwierdzona rezerwacja', () => {
  assert.doesNotMatch(JSON.stringify(T), /confirmé/i);
  assert.doesNotMatch(js.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''), /confirmé/i);
  assert.match(T.fr.rdv_pret_t, /Demande prête à envoyer/);
  assert.match(T.fr.rdv_pret_d, /pas encore un rendez-vous/);
});

test('formularz bez pól o zdrowiu (RODO art. 9), z etykietami i zgodą', () => {
  const form = html.slice(html.indexOf('<form class="rdv-form"'), html.indexOf('</form>'));
  assert.doesNotMatch(form, /sant[ée]|m[ée]dical|traitement|grossesse|contre-indication|poids|taille|ant[ée]c[ée]dent/i);
  const pola = [...form.matchAll(/<(?:input|textarea)[^>]*\bname="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(pola, ['nom', 'tel', 'mail', 'message', 'accord']);
  for (const id of ['rdv-nom', 'rdv-tel', 'rdv-mail', 'rdv-msg', 'rdv-accord']) assert.match(form, new RegExp('<label for="' + id + '"'), id);
  assert.match(T.fr.rdv_message_aide, /ne pas indiquer d’informations de santé/);
});

test('dostępność: grid kalendarza, aria-selected, aria-live na podsumowaniu, obsługa klawiatury', () => {
  assert.match(html, /<table class="rdv-siatka" role="grid"/);
  assert.match(html, /<div class="rdv-pret" id="rdv-pret" aria-live="polite"/);
  assert.match(js, /aria-selected/);
  for (const k of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']) assert.match(js, new RegExp("'" + k + "'"), k);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.rdv \*/);
});

test('rezerwacje online: tylko szkielet API, bez zmyślonego adresu', () => {
  assert.match(js, /function wyslijDoApi\(/);
  assert.match(js, /var API_REZERWACJI = null;/);
  assert.doesNotMatch(js, /fetch\('[^']+'/);
});

test('cennik i kreator w stronie: link „Tarifs” w menu, nowe pliki dołączone, formularz bez animacji wejścia', () => {
  assert.match(html, /<a href="#tarifs" data-t="nav_tarifs"><\/a>/);
  assert.ok(html.indexOf('id="soins"') < html.indexOf('id="tarifs"') && html.indexOf('id="tarifs"') < html.indexOf('id="visite"'));
  assert.ok(html.indexOf('css/paleta.css') < html.indexOf('css/rezerwacja.css'));
  assert.ok(html.indexOf('js/site.js') < html.indexOf('js/rezerwacja.js'));
  // js/ruch.js animuje h2 i .etykieta w sekcjach: w kreatorze ich nie ma
  const rdv = html.slice(html.indexOf('<div class="rdv" id="rdv">'), html.indexOf('<aside class="rdv-bok">'));
  assert.doesNotMatch(rdv, /<h2|class="etykieta/);
  assert.doesNotMatch(kod('js/ruch.js'), /rdv|tarifs|cennik/);
  for (const k of ['tarifs_note', 'rdv_lead', 'rdv_pret_t', 'rdv_err_tel']) assert.ok(T.fr[k], k);
});
