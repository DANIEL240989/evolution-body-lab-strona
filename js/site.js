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

  /* Panele zabiegów w torze „3 petardy” (#soins, js/petardy.js). Od 03.10.2026 (Daniel: „zamiast tego kamienia czysty
     ciemnogranatowy tło”) panele stoją na czystym granacie, bez obrazów kamienia. Miejsce na render sprzętu:
     RTX: rendery z RTX 5080 Daniela przyjdą na gałęzi rtx-rendery jako img/rtx/*.webp. Gdy plik jest w repo, wpisz jego
     ścieżkę tutaj (np. ems: 'img/rtx/ems.webp'); wtedy panel dostaje obraz z plakietką „Image de synthèse”.
     null = element zastępczy (złota obręcz z monogramem zabiegu i linią światła), który nie udaje zdjęcia.
     Bez zgadywania adresów: brakujący plik dawałby błąd 404 w konsoli.
     Wpis może być ścieżką (kadr 16:10 pod ramką) albo obiektem:
     - { wolny: true, src, srcset, sizes, w, h, obok: {…} }: render z przezroczystym tłem, stoi wolno na granacie (bez ramki),
       z cieniem i odbiciem; „obok” = drugi element dalej w głębi (inna paralaksa);
     - { kadr: true, src, srcset, sizes, w, h }: obraz z tłem, wtapiany w granat tak jak wideo niżej;
     - { wideo, plakat, w, h }: pętla wideo (studyjne czarne tło wtapiane w granat: rozjaśnienie czerni do granatu i miękka
       maska brzegów, bez prostokąta), ładowana dopiero przy zbliżeniu, pauza poza ekranem; ograniczony ruch / oszczędzanie
       danych = sam plakat.
     Każdy render i wideo z RTX to grafika AI: z plakietką „Image de synthèse” (opis plików: img/rtx/OPIS.md). */
  var RTX = {
    /* EMS (Daniel 03.10.2026): sama czarno-złota stacja, przezroczyste tło. Kombinezon usunięty (Daniel: „kombinezon wyleci,
       na samą maszynę, to niehigieniczne”); pliki img/rtx/ems-kombinezon-*.webp zostają w repo, nieużywane. */
    ems: { wolny: true, src: 'img/rtx/ems-urzadzenie-900.webp', srcset: 'img/rtx/ems-urzadzenie-900.webp 589w, img/rtx/ems-urzadzenie-1400.webp 917w, img/rtx/ems-urzadzenie-2000.webp 1310w',
           sizes: '(max-width: 900px) 46vh, 53vh', w: 917, h: 1400 },
    /* kriolipoliza (Daniel 03.10.2026): czarno-złote urządzenie z 4 aplikatorami w lodowym błękicie i mgłą, przezroczyste tło;
       poświata za nim chłodna (chlod). Pętla img/rtx/krio-mgla.mp4 zostaje w repo, nieużywana: wolno stojące urządzenie
       na granacie jest czystsze niż kadr studyjny w tle. */
    cryo: { wolny: true, chlod: true, src: 'img/rtx/krio-urzadzenie-900.webp', srcset: 'img/rtx/krio-urzadzenie-900.webp 600w, img/rtx/krio-urzadzenie-1400.webp 933w, img/rtx/krio-urzadzenie-2000.webp 1333w',
            sizes: '(max-width: 900px) 46vh, 54vh', w: 933, h: 1400 },
    /* pierwsza wizyta (Daniel 03.10.2026, ma pierwszeństwo przed kadrami RTX): kabina nocą, czarne ściany, złote
       podświetlenia, lustro, róże; kadr z tłem wtapiany w granat. Pętla img/rtx/kabina-swiatlo.mp4 zostaje w repo. */
    /* przed kabiną: analizator składu ciała (pomiary z pierwszej wizyty), przezroczyste tło; ekran urządzenia ma napisy
       i liczby, więc na stronie jest przyciemniony i rozmyty (kopia obrazu z filtrem, przycięta do ekranu: ekran) */
    visite: { kadr: true, przod: { src: 'img/rtx/analizator-900.webp', srcset: 'img/rtx/analizator-900.webp 592w, img/rtx/analizator-1400.webp 920w',
              sizes: '(max-width: 900px) 30vw, 40vh', w: 920, h: 1400 }, src: 'img/rtx/kabina-daniel-1200.webp', srcset: 'img/rtx/kabina-daniel-1200.webp 1200w, img/rtx/kabina-daniel-1920.webp 1920w, img/rtx/kabina-daniel-2880.webp 2880w',
              sizes: '(max-width: 900px) 100vw, 70vw', w: 1920, h: 1280 }
  };
  window.EBL_RTX = RTX;

  function obrazek(r, cls) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + r.src + '"' + (r.srcset ? ' srcset="' + r.srcset + '" sizes="' + r.sizes + '"' : '') +
      ' alt="" width="' + r.w + '" height="' + r.h + '" loading="lazy" decoding="async">';
  }
  function obrazRtx(r) {
    if (typeof r === 'string') r = { src: r, w: 1536, h: 1024 };
    var h;
    if (r.kadr) h = '<span class="kadr">' + obrazek(r, 'kadr-wideo') + '<span class="kadr-granat" aria-hidden="true"></span></span>' +
      (r.przod ? '<span class="urzadzenie urzadzenie-obok urzadzenie-przod">' + obrazek(r.przod, 'urzadzenie-img') +
        obrazek(r.przod, 'urzadzenie-img urzadzenie-ekran').replace('<img', '<img aria-hidden="true"') + '</span>' : '');
    else if (r.wideo) h = '<span class="kadr"><video class="kadr-wideo" muted loop playsinline preload="none" aria-hidden="true" poster="' + r.plakat + '" data-src="' + r.wideo +
      '" width="' + r.w + '" height="' + r.h + '"></video><span class="kadr-granat" aria-hidden="true"></span></span>';
    else if (r.wolny) h = (r.obok ? '<span class="urzadzenie urzadzenie-obok">' + obrazek(r.obok, 'urzadzenie-img') + '</span>' : '') +
      '<span class="urzadzenie">' + obrazek(r, 'urzadzenie-img') + '</span>';
    else h = obrazek(r);
    return h + '<span class="plakietka"></span>';
  }
  function klasaRtx(r) { return r.wideo || r.kadr ? ' panel-kadr' : r.wolny ? ' panel-wolny' + (r.chlod ? ' panel-chlod' : '') : ''; }

  /* wideo w panelach: źródło dopiero ok. ekranu przed panelem, gra tylko w kadrze (IntersectionObserver liczy też
     przesunięcie toru w poziomie); ograniczony ruch / oszczędzanie danych = sam plakat, bez pobierania wideo */
  function wideoPaneli() {
    var v = [].slice.call(document.querySelectorAll('video.kadr-wideo[data-src]'));
    if (!v.length || !('IntersectionObserver' in window)) return;
    var oszczedzaj = false;
    try { oszczedzaj = matchMedia('(prefers-reduced-motion: reduce)').matches || !!(navigator.connection && navigator.connection.saveData); } catch (e) {}
    if (oszczedzaj) return;
    var blisko = new IntersectionObserver(function (w) {
      w.forEach(function (e) { if (e.isIntersecting && !e.target.src) { e.target.src = e.target.dataset.src; blisko.unobserve(e.target); } });
    }, { rootMargin: '100% 100% 100% 100%' });
    var gra = new IntersectionObserver(function (w) {
      w.forEach(function (e) {
        var x = e.target;
        if (e.isIntersecting) { if (!x.src) x.src = x.dataset.src; var p = x.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!x.paused) x.pause();
      });
    }, { threshold: .15 });
    v.forEach(function (x) { blisko.observe(x); gra.observe(x); });
  }

  /* klasa .karta zostaje: „Réserver ce soin” zaznacza zabieg w kreatorze wizyty (js/rezerwacja.js, #karty-zabiegow .karta a) */
  function kartyZabiegow(lang) {
    var box = document.getElementById('karty-zabiegow');
    box.innerHTML = '';
    D.zabiegi.forEach(function (z, i) {
      var a = document.createElement('article');
      a.className = 'karta panel';
      a.setAttribute('data-zabieg', z.id);
      var cena = z.cena == null ? tekst(lang, 'prix_tbc') : z.od ? tekst(lang, 'a_partir') + ' ' + z.cena + ' €' : z.cena + ' €';
      var tytul = tekst(lang, 's_' + z.id + '_t'), rtx = RTX[z.id];
      a.innerHTML =
        '<div class="panel-obraz' + (rtx ? klasaRtx(rtx) : ' panel-zastep') + '">' + (rtx ? obrazRtx(rtx) : zastepczy()) + '</div>' +
        '<div class="panel-tresc"><span class="panel-nr"></span><h3 class="panel-tytul"></h3><p class="panel-opis"></p>' +
        '<p class="panel-cena"><span class="cena"></span> <span class="cena-j"></span></p>' +
        '<div class="panel-cta"><a class="pill solid" href="#contact"></a></div></div>';
      if (!rtx) a.querySelector('.zastep-litera').textContent = tytul.charAt(0).toUpperCase();   /* monogram: pierwsza litera nazwy */
      else {
        var im = a.querySelector('.panel-obraz img'); if (im) im.alt = tekst(lang, 'image_synthese');
        a.querySelector('.plakietka').textContent = tekst(lang, 'image_synthese');
      }
      a.querySelector('.panel-nr').textContent = (i < 9 ? '0' : '') + (i + 1);
      a.querySelector('h3').textContent = tytul;
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
    var wiz = document.querySelector('.panel-wizyta .panel-obraz');
    if (wiz && RTX.visite && !wiz.dataset.rtx) {
      wiz.dataset.rtx = '1'; wiz.className = 'panel-obraz' + klasaRtx(RTX.visite); wiz.innerHTML = obrazRtx(RTX.visite);
      var wi = wiz.querySelector('img'); if (wi) wi.alt = tekst(lang, 'image_synthese');
      wiz.querySelector('.plakietka').textContent = tekst(lang, 'image_synthese');
    }
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
  wideoPaneli();
})();
