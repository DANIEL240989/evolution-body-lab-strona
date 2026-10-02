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

  function kartyZabiegow(lang) {
    var box = document.getElementById('karty-zabiegow');
    box.innerHTML = '';
    D.zabiegi.forEach(function (z) {
      var a = document.createElement('article');
      a.className = 'karta';
      var cena = z.cena != null ? 'à partir de ' + z.cena + ' €' : tekst(lang, 'prix_tbc');
      a.innerHTML =
        '<div class="karta-obraz" role="img" aria-label="' + tekst(lang, 'image_synthese') + '"><span class="plakietka"></span></div>' +
        '<div class="karta-tresc"><h3></h3><p></p>' +
        '<p class="karta-meta"><span class="czas"></span><span class="cena"></span></p>' +
        '<a class="pill ramka maly" href="#contact"></a></div>';
      a.querySelector('.plakietka').textContent = tekst(lang, 'image_synthese');
      a.querySelector('h3').textContent = tekst(lang, 's_' + z.id + '_t');
      a.querySelector('.karta-tresc > p').textContent = tekst(lang, 's_' + z.id + '_d');
      a.querySelector('.czas').textContent = z.czas + ' ' + tekst(lang, 'duree');
      a.querySelector('.cena').textContent = cena;
      a.querySelector('a').textContent = tekst(lang, 'reserver_soin');
      box.appendChild(a);
    });
  }

  function przelacznik(lang) {
    var box = document.querySelector('.jezyki');
    box.innerHTML = '';
    JEZ.forEach(function (l) {
      var a = document.createElement('a');
      var w = new URLSearchParams(location.search).get('w');
      a.href = '?lang=' + l + (/^[efg]$/.test(w || '') ? '&w=' + w : '') + location.hash;
      a.textContent = window.NAZWY_JEZYKOW[l];
      a.hreflang = l;
      if (l === lang) a.setAttribute('aria-current', 'true');
      box.appendChild(a);
    });
  }

  function render(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = tekst(lang, el.dataset.t); });
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
})();

// Warianty kolorów do porównania (projekt/PALETY-2.md): ?w=e|f|g dokłada css/warianty/<w>.css po style.css.
// Bez parametru strona wygląda jak dotąd. Do usunięcia po wyborze.
(function () {
  var w = new URLSearchParams(location.search).get('w');
  if (!/^[efg]$/.test(w || '')) return;
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'css/warianty/' + w + '.css';
  document.head.appendChild(l);
  document.documentElement.setAttribute('data-wariant', w);
})();
