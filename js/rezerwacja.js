/* Cennik (#tarifs) i kreator prośby o wizytę (#contact), projektant 03.10.2026 (Daniel: „kozacki kalendarz, cennik,
   umówienie się na spotkanie”).
   - Ceny WYŁĄCZNIE z js/dane.js (zabiegi[].ceny, biznesplan Moniki); kriolipoliza z test:true pokazuje dopisek TEST.
   - Kreator w 3 krokach: zabieg → dzień i godzina (pon–pt, 9:00–18:00 co 30 min, ostatni start = godziny.ostatnia) → dane.
   - Rezerwacje online wyłączone (rezerwacjeOnline: false): nic nie idzie na serwer, kreator składa gotową wiadomość
     i otwiera WhatsApp albo pocztę klientki. To PROŚBA, nie potwierdzona wizyta (nigdy „confirmé”).
   - Żadnych pól o zdrowiu (RODO art. 9): ankieta przeciwwskazań wypełniana w gabinecie.
   - Formularz bez animacji wejścia, zawsze widoczny (js/ruch.js go nie dotyka: brak h2 i .etykieta w środku).
   Czyste funkcje (sloty, dni, walidacja, wiadomość) są w window.EBL_REZ, żeby testy działały bez przeglądarki. */
(function (root) {
  'use strict';
  var D = root.EBL, T = root.T;
  var KROK_MIN = 30;                 // co ile minut start wizyty
  var ZAPAS_MIN = 120;               // dziś: najbliższy slot najwcześniej za 2 h
  var HORYZONT_MIES = 6;             // kalendarz: bieżący miesiąc + 5 kolejnych

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function minuty(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function dzienStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function dodajDni(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function tenSamDzien(a, b) { return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function kluczDnia(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function tekst(lang, k) {
    var t = T && T[lang] && T[lang][k];
    return t != null ? t : (T && T.fr && T.fr[k] != null ? T.fr[k] : '');
  }
  function euro(n, lang) { return new Intl.NumberFormat(lang || 'fr').format(n) + ' €'; }

  /* godziny startu: od godziny otwarcia do ostatniej wizyty włącznie, co KROK_MIN */
  function sloty(g) {
    g = g || D.godziny;
    var out = [];
    for (var m = minuty(g.od); m <= minuty(g.ostatnia); m += KROK_MIN) out.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));
    return out;
  }
  function dzienOtwarty(d) { return D.godziny.dni.indexOf(d.getDay()) >= 0; }   // getDay: 0 = niedziela, 6 = sobota
  function granice(teraz) {
    var od = dzienStart(teraz);
    return { od: od, mOd: new Date(od.getFullYear(), od.getMonth(), 1), mDo: new Date(od.getFullYear(), od.getMonth() + HORYZONT_MIES, 0) };
  }
  function slotWolny(dzien, hhmm, teraz) {
    var t = new Date(dzien.getFullYear(), dzien.getMonth(), dzien.getDate(), 0, minuty(hhmm));
    return t.getTime() - teraz.getTime() >= ZAPAS_MIN * 60000;
  }
  /* dzień do wyboru: pon–pt, nie w przeszłości, w horyzoncie i (dziś) z co najmniej jednym wolnym slotem */
  function dzienAktywny(d, teraz) {
    var g = granice(teraz), dz = dzienStart(d);
    if (!dzienOtwarty(dz) || dz < g.od || dz > g.mDo) return false;
    return sloty().some(function (s) { return slotWolny(dz, s, teraz); });
  }
  function pierwszyAktywny(teraz) {
    var g = granice(teraz);
    for (var d = g.od; d <= g.mDo; d = dodajDni(d, 1)) if (dzienAktywny(d, teraz)) return d;
    return null;
  }

  /* opcje kroku 1 z danych: EMS (cena za séance), kriolipoliza po strefach, pierwsza wizyta-konsultacja (bez ceny) */
  function opcje() {
    var out = [];
    D.zabiegi.forEach(function (z) {
      (z.ceny || [{ cena: z.cena }]).forEach(function (c) {
        out.push({ id: c.strefy ? z.id + '-' + c.strefy : z.id, zabieg: z.id, strefy: c.strefy || 0, cena: c.cena, test: !!z.test });
      });
    });
    out.push({ id: 'conseil', zabieg: 'conseil', strefy: 0, cena: null, test: false });
    return out;
  }
  function nazwaOpcji(o, lang) {
    if (o.zabieg === 'conseil') return tekst(lang, 'rdv_conseil_t');
    var n = tekst(lang, 's_' + o.zabieg + '_t');
    return o.strefy ? n + ' · ' + o.strefy + ' ' + tekst(lang, o.strefy > 1 ? 'tarif_zones' : 'tarif_zone') : n;
  }
  function cenaOpcji(o, lang) {
    if (o.cena == null) return '';
    return euro(o.cena, lang) + (o.strefy ? '' : ' · ' + tekst(lang, 'tarif_seance').toLowerCase());
  }

  /* telefon francuski: 0X XX XX XX XX albo +33 / 0033 X XX XX XX XX (spacje, kropki, myślniki dozwolone) */
  function telefonOk(s) { return /^(?:\+33|0033|0)[1-9]\d{8}$/.test(String(s || '').replace(/[\s.\-()]/g, '')); }
  function mailOk(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim()); }

  function dataTekst(d, lang) {
    var t = new Intl.DateTimeFormat(lang || 'fr', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  /* gotowa wiadomość: zabieg, data, godzina, dane klientki; prośba, nie potwierdzenie */
  function wiadomosc(w, lang) {
    var o = w.opcja, l = [tekst(lang, 'rdv_msg_bonjour'), ''];
    l.push(tekst(lang, 'rdv_msg_soin') + ' : ' + nazwaOpcji(o, lang) + (o.cena != null ? ' (' + euro(o.cena, lang) + ')' : ''));
    l.push(tekst(lang, 'rdv_msg_date') + ' : ' + dataTekst(w.dzien, lang));
    l.push(tekst(lang, 'rdv_msg_heure') + ' : ' + w.godzina);
    l.push(tekst(lang, 'rdv_msg_nom') + ' : ' + w.nom);
    l.push(tekst(lang, 'rdv_msg_tel') + ' : ' + w.tel);
    if (w.mail) l.push(tekst(lang, 'rdv_msg_mail') + ' : ' + w.mail);
    if (w.message) l.push(tekst(lang, 'rdv_msg_message') + ' : ' + w.message);
    l.push('', tekst(lang, 'rdv_msg_fin'));
    return l.join('\n');
  }
  function linkWhatsApp(w, lang) { return 'https://wa.me/' + D.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(wiadomosc(w, lang)); }
  function linkMail(w, lang) {
    return 'mailto:' + D.email + '?subject=' + encodeURIComponent(tekst(lang, 'rdv_mail_sujet') + ' – ' + nazwaOpcji(w.opcja, lang)) +
      '&body=' + encodeURIComponent(wiadomosc(w, lang));
  }

  /* MIEJSCE NA API (gdy kiedyś rezerwacjeOnline: true). Szkielet: adres i format ustali backend gabinetu.
     Ma zwrócić Promise; do czasu backendu zawsze odrzuca, a kreator zostaje przy WhatsApp / e-mailu.
     Uwaga na przyszłość: klientka nadal widzi „demande envoyée”, nigdy „confirmé”, dopóki gabinet nie potwierdzi. */
  var API_REZERWACJI = null;   // np. '/api/…' — celowo puste, żadnego zmyślonego adresu
  function wyslijDoApi(w) {
    if (!D.rezerwacjeOnline || !API_REZERWACJI) return Promise.reject(new Error('rezerwacje online wyłączone'));
    return fetch(API_REZERWACJI, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zabieg: w.opcja.id, dzien: kluczDnia(w.dzien), godzina: w.godzina, nom: w.nom, tel: w.tel, mail: w.mail, message: w.message }) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  root.EBL_REZ = { sloty: sloty, dzienOtwarty: dzienOtwarty, dzienAktywny: dzienAktywny, slotWolny: slotWolny, pierwszyAktywny: pierwszyAktywny,
    opcje: opcje, nazwaOpcji: nazwaOpcji, telefonOk: telefonOk, mailOk: mailOk, wiadomosc: wiadomosc, linkWhatsApp: linkWhatsApp,
    linkMail: linkMail, wyslijDoApi: wyslijDoApi, ZAPAS_MIN: ZAPAS_MIN };

  if (typeof document === 'undefined') return;

  /* ========================================= PRZEGLĄDARKA ========================================= */
  var lang = document.documentElement.lang || 'fr';
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* ---------- cennik ---------- */
  function cennik() {
    var box = document.getElementById('cennik'); if (!box) return;
    box.innerHTML = '';
    D.zabiegi.forEach(function (z, i) {
      var art = el('article', 'cennik-poz');
      var glowa = el('div', 'cennik-glowa');
      glowa.appendChild(el('span', 'cennik-nr', (i < 9 ? '0' : '') + (i + 1)));
      var tyt = el('div', 'cennik-tyt');
      tyt.appendChild(el('h3', null, tekst(lang, 's_' + z.id + '_t')));
      tyt.appendChild(el('p', 'cennik-pod', tekst(lang, 'tarifs_' + z.id + '_sous')));
      glowa.appendChild(tyt);
      if (z.test) glowa.appendChild(el('span', 'cennik-test', tekst(lang, 'tarif_test')));
      art.appendChild(glowa);
      var lista = el('ul', 'cennik-lista');
      (z.ceny || [{ cena: z.cena }]).forEach(function (c) {
        var li = el('li', 'cennik-wiersz');
        li.appendChild(el('span', 'cennik-co', c.strefy ? c.strefy + ' ' + tekst(lang, c.strefy > 1 ? 'tarif_zones' : 'tarif_zone') : tekst(lang, 'tarif_seance')));
        li.appendChild(el('span', 'cennik-kropki'));
        li.lastChild.setAttribute('aria-hidden', 'true');
        li.appendChild(el('span', 'cennik-cena', euro(c.cena, lang)));
        lista.appendChild(li);
      });
      art.appendChild(lista);
      box.appendChild(art);
    });
  }
  cennik();

  /* ---------- kreator ---------- */
  var R = document.getElementById('rdv'); if (!R) return;
  var form = R.querySelector('.rdv-form'), pret = document.getElementById('rdv-pret');
  var tbody = R.querySelector('.rdv-siatka tbody'), slotyBox = R.querySelector('.rdv-sloty');
  var mredukcja = matchMedia('(prefers-reduced-motion: reduce)');
  var S = { krok: 1, opcja: null, dzien: null, godzina: null, mies: null, fokus: null, doKroku: 1 };
  var OPCJE = opcje();

  function teraz() { return new Date(); }
  function status(t) { var s = document.getElementById('rdv-status'); s.textContent = ''; setTimeout(function () { s.textContent = t; }, 30); }
  function blad(id, t, pole) {
    var b = document.getElementById(id); if (b) b.textContent = t || '';
    if (pole) { if (t) pole.setAttribute('aria-invalid', 'true'); else pole.removeAttribute('aria-invalid'); }
  }

  /* krok 1: opcje jako prawdziwe radio (strzałki i spacja z przeglądarki) */
  (function () {
    var fs = R.querySelector('.rdv-opcje');
    OPCJE.forEach(function (o) {
      var lab = el('label', 'rdv-opcja' + (o.zabieg === 'conseil' ? ' rdv-opcja-conseil' : ''));
      var inp = el('input'); inp.type = 'radio'; inp.name = 'soin'; inp.value = o.id;
      var tr = el('span', 'rdv-opcja-tresc');
      tr.appendChild(el('span', 'rdv-opcja-nazwa', nazwaOpcji(o, lang)));
      tr.appendChild(el('span', 'rdv-opcja-cena', o.zabieg === 'conseil' ? tekst(lang, 'rdv_conseil_d') : cenaOpcji(o, lang)));
      if (o.test) tr.appendChild(el('span', 'rdv-opcja-test', tekst(lang, 'tarif_test')));
      lab.appendChild(inp); lab.appendChild(el('span', 'rdv-znak')); lab.appendChild(tr);
      fs.appendChild(lab);
    });
    fs.addEventListener('change', function (e) {
      if (e.target.name !== 'soin') return;
      S.opcja = OPCJE.filter(function (o) { return o.id === e.target.value; })[0] || null;
      blad('rdv-err-soin', '');
      recap();
    });
  })();

  /* krok 2: kalendarz miesiąca (role="grid", ruchoma tabulacja, strzałki / Home / End / PageUp / PageDown) */
  (function naglowkiDni() {
    var tr = R.querySelector('.rdv-siatka thead tr'), f = new Intl.DateTimeFormat(lang, { weekday: 'short' }), fl = new Intl.DateTimeFormat(lang, { weekday: 'long' });
    for (var i = 0; i < 7; i++) {
      var d = new Date(2026, 0, 5 + i);   // 5.01.2026 to poniedziałek
      var th = el('th', null, f.format(d).replace('.', '')); th.scope = 'col'; th.setAttribute('abbr', fl.format(d));
      if (!dzienOtwarty(d)) th.className = 'rdv-wolne';
      tr.appendChild(th);
    }
  })();

  function kalendarz(ustawFokus) {
    var tn = teraz(), g = granice(tn), m = S.mies, rok = m.getFullYear(), mc = m.getMonth();
    var nazwa = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(m);
    document.getElementById('rdv-mies-nazwa').textContent = nazwa.charAt(0).toUpperCase() + nazwa.slice(1);
    R.querySelector('[data-mies="-1"]').disabled = m <= g.mOd;
    R.querySelector('[data-mies="1"]').disabled = new Date(rok, mc + 1, 1) > g.mDo;
    tbody.innerHTML = '';
    var przes = (new Date(rok, mc, 1).getDay() + 6) % 7, dni = new Date(rok, mc + 1, 0).getDate(), tr = null;
    if (!S.fokus || S.fokus.getMonth() !== mc || S.fokus.getFullYear() !== rok) {
      S.fokus = S.dzien && S.dzien.getMonth() === mc && S.dzien.getFullYear() === rok ? S.dzien : null;
      for (var k = 1; !S.fokus && k <= dni; k++) if (dzienAktywny(new Date(rok, mc, k), tn)) S.fokus = new Date(rok, mc, k);
      if (!S.fokus) S.fokus = new Date(rok, mc, 1);
    }
    var fmt = new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    for (var i = 0; i < przes + dni; i++) {
      if (i % 7 === 0) { tr = el('tr'); tbody.appendChild(tr); }
      var td = el('td'); td.setAttribute('role', 'gridcell'); tr.appendChild(td);
      if (i < przes) continue;
      var d = new Date(rok, mc, i - przes + 1), akt = dzienAktywny(d, tn), dzis = tenSamDzien(d, tn), wyb = tenSamDzien(d, S.dzien);
      var b = el('button', 'rdv-dzien', String(d.getDate()));
      b.type = 'button'; b.dataset.dzien = kluczDnia(d);
      b.tabIndex = tenSamDzien(d, S.fokus) ? 0 : -1;
      var opis = fmt.format(d);
      if (dzis) { b.classList.add('dzis'); b.setAttribute('aria-current', 'date'); opis += ', ' + tekst(lang, 'rdv_aujourdhui'); }
      if (!akt) { b.setAttribute('aria-disabled', 'true'); opis += ', ' + tekst(lang, dzienOtwarty(d) ? 'rdv_indispo' : 'rdv_ferme'); }
      b.setAttribute('aria-label', opis);
      td.setAttribute('aria-selected', wyb ? 'true' : 'false');
      if (wyb) b.classList.add('wybrany');
      td.appendChild(b);
    }
    while (tr && tr.children.length < 7) { var pusty = el('td'); pusty.setAttribute('role', 'gridcell'); tr.appendChild(pusty); }
    if (ustawFokus) { var f = tbody.querySelector('[tabindex="0"]'); if (f) f.focus(); }
  }

  function ustawMies(d) { S.mies = new Date(d.getFullYear(), d.getMonth(), 1); }
  function przesunFokus(d) {
    var g = granice(teraz());
    if (d < g.mOd) d = g.mOd; if (d > g.mDo) d = g.mDo;
    S.fokus = d;
    if (d.getMonth() !== S.mies.getMonth() || d.getFullYear() !== S.mies.getFullYear()) ustawMies(d);
    kalendarz(true);
  }

  tbody.addEventListener('keydown', function (e) {
    var b = e.target.closest('.rdv-dzien'); if (!b) return;
    var f = S.fokus, n = null, dt = (f.getDay() + 6) % 7;
    switch (e.key) {
      case 'ArrowLeft': n = dodajDni(f, -1); break;
      case 'ArrowRight': n = dodajDni(f, 1); break;
      case 'ArrowUp': n = dodajDni(f, -7); break;
      case 'ArrowDown': n = dodajDni(f, 7); break;
      case 'Home': n = dodajDni(f, -dt); break;
      case 'End': n = dodajDni(f, 6 - dt); break;
      case 'PageUp': n = new Date(f.getFullYear(), f.getMonth() - 1, Math.min(f.getDate(), new Date(f.getFullYear(), f.getMonth(), 0).getDate())); break;
      case 'PageDown': n = new Date(f.getFullYear(), f.getMonth() + 1, Math.min(f.getDate(), new Date(f.getFullYear(), f.getMonth() + 2, 0).getDate())); break;
      default: return;   // Enter i Spacja: natywne kliknięcie przycisku
    }
    e.preventDefault(); przesunFokus(n);
  });
  tbody.addEventListener('click', function (e) {
    var b = e.target.closest('.rdv-dzien'); if (!b) return;
    var p = b.dataset.dzien.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    S.fokus = d;
    if (b.getAttribute('aria-disabled') === 'true') { kalendarz(true); return; }
    S.dzien = d;
    if (S.godzina && !slotWolny(d, S.godzina, teraz())) S.godzina = null;
    kalendarz(true); godziny(); recap(); blad('rdv-err-date', '');
    /* telefon: kalendarz i godziny są jedno pod drugim, więc godziny wjeżdżają w kadr (dotyk/mysz, nie klawiatura) */
    if (e.detail > 0 && matchMedia('(max-width: 900px)').matches) {
      var fs = R.querySelector('.rdv-godziny'), r = fs.getBoundingClientRect();
      if (r.bottom > innerHeight) window.scrollBy({ top: r.bottom - innerHeight + 24, behavior: mredukcja.matches ? 'auto' : 'smooth' });
    }
  });
  R.querySelectorAll('.rdv-mies').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = +b.dataset.mies; ustawMies(new Date(S.mies.getFullYear(), S.mies.getMonth() + k, 1)); S.fokus = null; kalendarz(false);
    });
  });

  /* godziny: radio w siatce 9:00–18:00; dziś bez slotów bliżej niż ZAPAS_MIN */
  function godziny() {
    slotyBox.innerHTML = '';
    var pod = R.querySelector('.rdv-podpowiedz'); pod.hidden = !!S.dzien;
    if (!S.dzien) return;
    var tn = teraz();
    sloty().forEach(function (s) {
      var lab = el('label', 'rdv-slot'), inp = el('input');
      inp.type = 'radio'; inp.name = 'heure'; inp.value = s;
      if (!slotWolny(S.dzien, s, tn)) { inp.disabled = true; lab.classList.add('zajety'); }
      if (s === S.godzina) inp.checked = true;
      lab.appendChild(inp); lab.appendChild(el('span', null, s));
      slotyBox.appendChild(lab);
    });
  }
  slotyBox.addEventListener('change', function (e) { if (e.target.name === 'heure') { S.godzina = e.target.value; recap(); blad('rdv-err-date', ''); } });

  function recap() {
    var v = tekst(lang, 'rdv_vide');
    R.querySelector('[data-rdv="soin"]').textContent = S.opcja ? nazwaOpcji(S.opcja, lang) : v;
    R.querySelector('[data-rdv="date"]').textContent = S.dzien ? dataTekst(S.dzien, lang) : v;
    R.querySelector('[data-rdv="heure"]').textContent = S.godzina || v;
  }

  /* ---------- kroki ---------- */
  function sprawdzKrok(k) {
    if (k === 1 && !S.opcja) { blad('rdv-err-soin', tekst(lang, 'rdv_err_soin')); return R.querySelector('input[name="soin"]'); }
    if (k === 2 && (!S.dzien || !S.godzina)) { blad('rdv-err-date', tekst(lang, 'rdv_err_date')); return S.dzien ? slotyBox.querySelector('input:not(:disabled)') : tbody.querySelector('[tabindex="0"]'); }
    if (k === 3) {
      var nom = form.elements.nom, tel = form.elements.tel, mail = form.elements.mail, acc = form.elements.accord, pierwszy = null;
      function pole(ok, id, k2, inp) { blad(id, ok ? '' : tekst(lang, k2), inp); if (!ok && !pierwszy) pierwszy = inp; }
      pole(nom.value.trim().length >= 2, 'rdv-err-nom', 'rdv_err_nom', nom);
      pole(telefonOk(tel.value), 'rdv-err-tel', 'rdv_err_tel', tel);
      pole(!mail.value.trim() || mailOk(mail.value), 'rdv-err-mail', 'rdv_err_mail', mail);
      pole(acc.checked, 'rdv-err-accord', 'rdv_err_accord', acc);
      return pierwszy;
    }
    return null;
  }

  function pokazKrok(k, fokus) {
    S.krok = k; if (k <= 3) S.doKroku = Math.max(S.doKroku, k);
    R.querySelectorAll('.rdv-krok').forEach(function (x) { x.hidden = +x.dataset.krok !== k; });
    form.hidden = k > 3; pret.hidden = k <= 3;
    R.classList.toggle('rdv-gotowe', k > 3);
    R.querySelectorAll('.rdv-etap').forEach(function (b) {
      var n = +b.dataset.krok;
      if (n === k) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.classList.toggle('zrobiony', n < k);
      b.disabled = n > S.doKroku;
    });
    if (k === 2) { if (!S.mies) { var p = S.dzien || pierwszyAktywny(teraz()) || teraz(); ustawMies(p); } kalendarz(false); godziny(); }
    if (fokus && k <= 3) status(tekst(lang, 'rdv_etape_sur').replace('{n}', k));
    if (fokus) {
      var t = k > 3 ? document.getElementById('rdv-pret-t') : R.querySelector('.rdv-krok[data-krok="' + k + '"] .rdv-tytul');
      t.focus({ preventScroll: true });
      var r = R.getBoundingClientRect();
      if (r.top < 0 || r.top > innerHeight * .6) window.scrollTo({ top: scrollY + r.top - 96, behavior: mredukcja.matches ? 'auto' : 'smooth' });
    }
  }
  function idzDo(k) {
    if (k > S.krok) for (var i = S.krok; i < k; i++) { var zle = sprawdzKrok(i); if (zle) { if (i !== S.krok) pokazKrok(i, false); zle.focus(); return; } }
    pokazKrok(k, true);
  }
  R.addEventListener('click', function (e) {
    var b = e.target.closest('[data-dalej]'); if (b) { idzDo(+b.dataset.dalej); return; }
    var et = e.target.closest('.rdv-etap'); if (et && !et.disabled) idzDo(+et.dataset.krok);
  });

  /* dolny pasek na telefonie nie zasłania pól przy pisaniu (klasa na <html>, CSS w css/rezerwacja.css) */
  form.addEventListener('focusin', function (e) { if (e.target.closest('.rdv-krok[data-krok="3"]')) document.documentElement.classList.add('rdv-pisze'); });
  form.addEventListener('focusout', function (e) { if (!(e.relatedTarget && form.contains(e.relatedTarget))) document.documentElement.classList.remove('rdv-pisze'); });

  /* czyszczenie błędu przy poprawianiu pola */
  form.addEventListener('input', function (e) {
    var t = e.target, m = { nom: 'rdv-err-nom', tel: 'rdv-err-tel', mail: 'rdv-err-mail', accord: 'rdv-err-accord' }[t.name];
    if (m && t.getAttribute('aria-invalid')) blad(m, '', t);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    for (var i = 1; i <= 3; i++) { var zle = sprawdzKrok(i); if (zle) { if (i !== S.krok) pokazKrok(i, false); zle.focus(); return; } }
    var w = { opcja: S.opcja, dzien: S.dzien, godzina: S.godzina, nom: form.elements.nom.value.trim(), tel: form.elements.tel.value.trim(),
      mail: form.elements.mail.value.trim(), message: form.elements.message.value.trim() };
    var dane = pret.querySelector('.rdv-pret-dane'); dane.innerHTML = '';
    [['rdv_recap_soin', nazwaOpcji(w.opcja, lang) + (w.opcja.cena != null ? ' · ' + euro(w.opcja.cena, lang) : '')],
     ['rdv_recap_date', dataTekst(w.dzien, lang)], ['rdv_recap_heure', w.godzina],
     ['rdv_nom', w.nom], ['rdv_tel', w.tel]].concat(w.mail ? [['rdv_mail', w.mail]] : []).forEach(function (p) {
      var d = el('div'); d.appendChild(el('dt', null, tekst(lang, p[0]))); d.appendChild(el('dd', null, p[1])); dane.appendChild(d);
    });
    document.getElementById('rdv-wa').href = linkWhatsApp(w, lang);
    document.getElementById('rdv-mail-link').href = linkMail(w, lang);
    pokazKrok(4, true);
    /* przyszłość: przy rezerwacjeOnline: true najpierw API; przy błędzie zostają WhatsApp i e-mail */
    if (D.rezerwacjeOnline) wyslijDoApi(w).catch(function () {});
  });

  /* „Réserver ce soin” w kartach zabiegów: EMS od razu zaznaczone; kriolipoliza czeka na wybór liczby stref */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('#karty-zabiegow .karta a'); if (!a) return;
    var karty = [].slice.call(document.querySelectorAll('#karty-zabiegow .karta')), z = D.zabiegi[karty.indexOf(a.closest('.karta'))];
    if (!z) return;
    var inp = R.querySelector('input[name="soin"][value="' + z.id + '"]');
    if (inp) { inp.checked = true; inp.dispatchEvent(new Event('change', { bubbles: true })); }
    if (S.krok !== 1) pokazKrok(1, false);
  });

  recap();
  pokazKrok(1, false);
})(typeof window !== 'undefined' ? window : this);
