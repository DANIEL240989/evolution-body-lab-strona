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

  /* obrazy kart: kadry z obrazów Daniela (granatowy marmur z korą), każdy z plakietką „Image de synthèse” */
  var OBRAZY_KART = ['karta-1', 'karta-2', 'karta-3', 'karta-4'];

  function kartyZabiegow(lang) {
    var box = document.getElementById('karty-zabiegow');
    box.innerHTML = '';
    D.zabiegi.forEach(function (z, i) {
      var a = document.createElement('article');
      a.className = 'karta';
      var cena = z.cena != null ? 'à partir de ' + z.cena + ' €' : tekst(lang, 'prix_tbc');
      a.innerHTML =
        '<div class="karta-obraz"><img alt="" width="720" height="540" loading="lazy" decoding="async"><span class="plakietka"></span></div>' +
        '<div class="karta-tresc"><span class="karta-nr"></span><h3></h3><p></p>' +
        '<p class="karta-meta"><span class="czas"></span><span class="cena"></span></p>' +
        '<a class="pill ramka maly" href="#contact"></a></div>';
      var img = a.querySelector('img');
      img.src = 'img/materialy/' + OBRAZY_KART[i % OBRAZY_KART.length] + '.webp';
      img.alt = tekst(lang, 'image_synthese');
      a.querySelector('.plakietka').textContent = tekst(lang, 'image_synthese');
      a.querySelector('.karta-nr').textContent = (i < 9 ? '0' : '') + (i + 1);
      a.querySelector('h3').textContent = tekst(lang, 's_' + z.id + '_t');
      a.querySelector('.karta-tresc > p').textContent = tekst(lang, 's_' + z.id + '_d');
      a.querySelector('.czas').textContent = z.czas + ' ' + tekst(lang, 'duree');
      a.querySelector('.cena').textContent = cena;
      a.querySelector('a').textContent = tekst(lang, 'reserver_soin');
      box.appendChild(a);
    });
  }

  /* tekst z wyróżnieniem: *słowo* = kursywa w różowym złocie (bez innerHTML z tekstów) */
  function zWyroznieniem(el, t) {
    el.textContent = '';
    t.split('*').forEach(function (cz, i) {
      if (!cz) return;
      if (i % 2) { var em = document.createElement('em'); em.textContent = cz; el.appendChild(em); }
      else el.appendChild(document.createTextNode(cz));
    });
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
