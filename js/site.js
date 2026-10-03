(function () {
  'use strict';
  var D = window.EBL, T = window.T, JEZ = window.JEZYKI;

  function jezykZAdresu() {
    var l = new URLSearchParams(location.search).get('lang');
    return JEZ.indexOf(l) >= 0 ? l : 'fr';
  }

  function tekst(lang, k) {
    var t = T[lang] && T[lang][k];
    return t != null ? t : T.fr[k];
  }

  function brakujeTlumaczenia(lang) {
    if (lang === 'fr') return false;
    return Object.keys(T.fr).some(function (k) { return !(T[lang] && T[lang][k] != null); });
  }

  /* Panele zabiegów w torze „3 petardy” (#soins, js/petardy.js). Obrazy Daniela (każdy z plakietką „Image de synthèse”):
     EMS na granatowym marmurze z korą, kriolipoliza na kryształowym klifie (zimno), pierwsza wizyta na marmurze z lustrem.
     RTX: rendery sprzętu z RTX 5080 Daniela przyjdą na gałęzi rtx-rendery jako img/rtx/*.webp. Gdy plik jest w repo,
     wpisz jego ścieżkę tutaj (np. ems: 'img/rtx/ems.webp'); null = obraz zastępczy. Bez zgadywania adresów: brakujący
     plik dawałby błąd 404 w konsoli. */
  var OBRAZY_PANELI = { ems: 'img/materialy/granat-kora-2.webp', cryo: 'img/materialy/klif-lustro.webp', visite: 'img/materialy/granat-kora-lustro.webp' };
  var RTX = { ems: null, cryo: null, visite: null };
  window.EBL_RTX = RTX;

  /* klasa .karta zostaje: „Réserver ce soin” zaznacza zabieg w kreatorze wizyty (js/rezerwacja.js, #karty-zabiegow .karta a) */
  function kartyZabiegow(lang) {
    var box = document.getElementById('karty-zabiegow');
    box.innerHTML = '';
    D.zabiegi.forEach(function (z, i) {
      var a = document.createElement('article');
      a.className = 'karta panel';
      a.setAttribute('data-zabieg', z.id);
      var cena = z.cena == null ? tekst(lang, 'prix_tbc') : z.od ? tekst(lang, 'a_partir') + ' ' + z.cena + ' €' : z.cena + ' €';
      a.innerHTML =
        '<div class="panel-obraz"><img alt="" width="1536" height="1024" loading="lazy" decoding="async"><span class="plakietka"></span></div>' +
        '<div class="panel-tresc"><span class="panel-nr"></span><h3 class="panel-tytul"></h3><p class="panel-opis"></p>' +
        '<p class="panel-cena"><span class="cena"></span> <span class="cena-j"></span></p>' +
        '<div class="panel-cta"><a class="pill solid" href="#contact"></a></div></div>';
      var img = a.querySelector('img');
      img.src = RTX[z.id] || OBRAZY_PANELI[z.id] || OBRAZY_PANELI.ems;
      img.alt = tekst(lang, 'image_synthese');
      a.querySelector('.plakietka').textContent = tekst(lang, 'image_synthese');
      a.querySelector('.panel-nr').textContent = (i < 9 ? '0' : '') + (i + 1);
      a.querySelector('h3').textContent = tekst(lang, 's_' + z.id + '_t');
      a.querySelector('.panel-opis').textContent = tekst(lang, 's_' + z.id + '_d');
      a.querySelector('.cena').textContent = cena;
      var j = a.querySelector('.cena-j');
      if (z.cena != null && !z.od) j.textContent = tekst(lang, 'par_seance');
      else if (z.czas != null) j.textContent = z.czas + ' ' + tekst(lang, 'duree');
      else j.remove();
      if (z.test) { var t = document.createElement('span'); t.className = 'panel-test'; t.textContent = tekst(lang, 'tarif_test'); a.querySelector('.panel-cena').appendChild(t); }
      a.querySelector('a').textContent = tekst(lang, 'reserver_soin');
      box.appendChild(a);
    });
    var wiz = document.querySelector('.panel-wizyta .panel-obraz img');
    if (wiz && RTX.visite) wiz.src = RTX.visite;
  }

  /* tekst z wyróżnieniem: *słowo* = kursywa w różowym złocie (bez innerHTML z tekstów) */
  function zWyroznieniem(el, t) {
    el.textContent = '';
    var cz = t.split('*');
    for (var i = 0; i < cz.length; i++) {
      if (!cz[i]) continue;
      if (i % 2) {
        /* słowo z kropką/przecinkiem po nim w jednym kawałku: znak nie spada do nowej linii */
        var nw = document.createElement('span'), em = document.createElement('em'), m = (cz[i + 1] || '').match(/^[.,;:!?»]+/);
        nw.className = 'nw'; em.textContent = cz[i]; nw.appendChild(em);
        if (m) { nw.appendChild(document.createTextNode(m[0])); cz[i + 1] = cz[i + 1].slice(m[0].length); }
        el.appendChild(nw);
      } else el.appendChild(document.createTextNode(cz[i]));
    }
  }

  /* tła sekcji poza pierwszym ekranem: dopiero ok. 1,5 ekranu przed sekcją (klasa „leniwe” z <head>) */
  function leniweTla() {
    var H = document.documentElement, el = [].slice.call(document.querySelectorAll('[data-tlo]'));
    if (!H.classList.contains('leniwe')) return;
    if (!('IntersectionObserver' in window)) { H.classList.remove('leniwe'); return; }
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { if (w.isIntersecting) { w.target.classList.add('blisko'); io.unobserve(w.target); } });
    }, { rootMargin: '150% 0px 150% 0px' });
    el.forEach(function (x) { io.observe(x); });
  }

  function przelacznik(lang) {
    var box = document.querySelector('.jezyki');
    box.innerHTML = '';
    JEZ.forEach(function (l) {
      var a = document.createElement('a');
      a.href = '?lang=' + l + location.hash;
      a.textContent = window.NAZWY_JEZYKOW[l];
      a.hreflang = l;
      if (l === lang) a.setAttribute('aria-current', 'true');
      box.appendChild(a);
    });
  }

  function render(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(function (el) {
      if (el.classList.contains('t-em')) zWyroznieniem(el, tekst(lang, el.dataset.t));
      else el.textContent = tekst(lang, el.dataset.t);
    });
    document.querySelectorAll('[data-t-attr]').forEach(function (el) {
      var p = el.dataset.tAttr.split(':');
      el.setAttribute(p[0], tekst(lang, p[1]));
    });
    document.querySelectorAll('[data-dane]').forEach(function (el) { el.textContent = D[el.dataset.dane]; });
    document.querySelectorAll('[data-href="tel"]').forEach(function (el) { el.href = 'tel:' + D.telefon; });
    document.querySelectorAll('[data-href="wa"]').forEach(function (el) {
      el.href = 'https://wa.me/' + D.whatsapp.replace(/\D/g, '');
      el.target = '_blank'; el.rel = 'noopener';
    });
    document.querySelector('.pasek-tlum').hidden = !brakujeTlumaczenia(lang);
    kartyZabiegow(lang);
    przelacznik(lang);
  }

  render(jezykZAdresu());
  leniweTla();
})();
