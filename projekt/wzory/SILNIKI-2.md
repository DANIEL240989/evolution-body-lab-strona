# Silniki ruchu, pomiar 2: wideo i czasy (03.10.2026)

Druga analiza wzorów: landonorris.com, jjettas.com, orchid.security, plus nasza strona tym samym scenariuszem.
Pierwsza analiza (kod, shadery, biblioteki) jest w `SILNIKI.md`. Tu są **zmierzone czasy z wideo**.

## Jak mierzyłem
- Komputer Daniela, Edge (Playwright, bez okna) z prawdziwym GPU: WebGL szedł na **RTX 5080 przez ANGLE/D3D11** (sprawdzone
  `UNMASKED_RENDERER_WEBGL`). User-Agent bez słowa „Headless”, bo nasza strona wyłącza ruch dla botów (pierwsze nagranie
  naszej strony wyszło bez ruchu, powtórzone).
- 1440×900. Klatki przez CDP `Page.startScreencast`, **każda klatka ze znacznikiem czasu**: średnio co 10–15 ms
  (70–100 klatek/s), przy ciężkim WebGL przerwy do ok. 100 ms. Czasy poniżej podaję z dokładnością ok. ±15 ms.
- Ten sam scenariusz na każdej stronie: wejście 8 s → mysz po pierwszym ekranie (koła 2,5 s, 4 szybkie pociągnięcia) →
  najechanie na przyciski w nagłówku → menu (otwarcie, najechanie na linki, zamknięcie) → przewijanie kółkiem po 20 px
  (cel 60 kroków/s) z przerwami na najechanie co 2400 px → otwarcie menu i przejście na podstronę → „wstecz”.
- Krzywe: z klatek (położenie/rozmiar w czasie) i z „postępu zmian obrazu” (suma różnic klatek w 25/50/75 % czasu ruchu).
- Wydajność: licznik `requestAnimationFrame` na stronie. Uwaga: przeglądarka bez okna nie jest ograniczona do 60 Hz
  (ok. 250 Hz), więc liczby mówią o **zacięciach** (klatki > 33 ms), nie o FPS ekranu.

## Pliki na komputerze Daniela (`D:\CLAUDE CODE\evolution-body-lab\wzory-2\`)
- **Wideo**: `lando-1440x900.mp4` (100 s), `jjettas-1440x900.mp4` (122 s), `orchid-1440x900.mp4` (75 s),
  `ebl-1440x900.mp4` (nasza strona, 76 s). 30 kl./s, H.264, zrobione z klatek (zachowany prawdziwy czas).
- Klatki: `<strona>\f\f_<ms>.jpg` (5–9 tys. na stronę), dziennik akcji `<strona>\log.json`, ruch obrazu `ruch.csv`,
  odcinki ruchu `segmenty.txt`, wydajność `fps.txt` i `raf.json`.
- Arkusze do oglądania: `<strona>\a-*.jpg` (wejście, menu, podstrona, przewijanie, mysz), wycinki `h-*.jpg` (hover).
- Skrypty: `nagraj.cjs` (scenariusz), `analiza.py`, `arkusz.py`, `kadr.py`, `ogon.py`, `okna.py`, `k2.py`, `wszystko.ps1`.
- Pierwsze, wadliwe nagrania: `ebl-headless-bezruchu`, `lando-v1`, `jjettas-v1`, `orchid-v1` (do usunięcia).

Klatki w repo (`projekt/wzory/`, JPG 800×520, po 4 momenty, MD5 zgodne z PC):
`k2-lando-okno-logo.jpg`, `k2-lando-menu.jpg`, `k2-lando-przejscie-podstrony.jpg`, `k2-lando-bloki-tekstu.jpg`,
`k2-plyn-lando-vs-ebl.jpg`, `k2-jjettas-wejscie.jpg`, `k2-jjettas-menu.jpg`, `k2-jjettas-podstrona-crt.jpg`,
`k2-orchid-kula-linia.jpg`, `k2-ebl-kurtyna.jpg`.

---

## 1. Zmierzone czasy (ms od wejścia na adres)

| Moment | Lando | jjettas | Orchid | **Evolution Body Lab** |
|---|---|---|---|---|
| Pierwszy obraz | 1042 (ekran limonki z małym logo) | 800 biały, 2107 ciemny ekran z logo | 1141 biały, 1476 treść | 1490 (kurtyna, logo całe) |
| Ekran ładowania stoi | 1042→3801 (**2,8 s**, logo stoi) | 2107→3929 (**1,8 s**: logo wypełnia się od dołu jak pasek postępu + licznik) | brak | 1490→3305 (**1,8 s**, logo stoi, nic się nie dzieje) |
| Odsłona | **okno w kształcie logo „4”**: 3801→4044 = **243 ms**, przyspiesza (expo.in); paski limonki góra/dół chowają się 4044→4205 (160 ms) | **skośna kurtyna** ok. 15°: 3929→4481 = **550 ms**, odsłania wideo na pełnym ekranie | brak (przyciski dochodzą opacity 6116→6335) | dziura w medalionie 3305→3436, obręcz gaśnie do 4211, **puste kółko stoi 4211→4626 (415 ms martwe)**, okno rośnie 4626→4870 (**244 ms**), **przez okno widać pusty granat** |
| Pierwszy ekran gotowy | **4044** | 8400 (po filmie: tunel → mecz → zbliżenie okularów → odjazd kamery 7007→7525 → interfejs 7800–8400) | 1476 | **5300** (linie H1 spod maski 4870→5300) |
| Animacja „po wejściu” | wstęgi wizjera kasku przelatują przez twarz 4859→6956 (**2,1 s**), potem co kilka s | podpis rysuje się 8045→9600 (1,6 s); odbicia w okularach to wideo w pętli | brak | brak (Monika stoi do pierwszego ruchu myszy) |

### Menu
| | Lando | jjettas | Orchid | My |
|---|---|---|---|---|
| Przycisk | burger 60×60 prawy górny róg | burger 64×46 prawy górny róg | brak (na komputerze same linki + rozwijane listy) | **brak na komputerze** (linki w pasku) |
| Otwarcie | klik 29163 → panel w ruchu 29218 (**55 ms**); ciemny panel spada z góry **z wypukłą dolną krawędzią**, zakrywa ekran do ok. 29404 (**ok. 250 ms**); 4 zdjęcia (szare) odsłaniają się maską 29522→29770; linki wjeżdżają linia po linii spod maski 29669→29980 (co ok. 70 ms); **razem ok. 850 ms** | klik 28855 → start 29025 (**170 ms opóźnienia**); ekran ciemnieje (opacity) 29025→29400 (**375 ms**), linki (wąski krój, wersaliki, ok. 70 px) pojawiają się z dołu z kolejnością co ok. 35 ms, ikony social 29424→29560; **razem ok. 550 ms** | lista rozwija się **bez animacji** (w 1 klatce, ok. 20 ms) | – |
| Najechanie w menu | tekst linku przewija się w górę, wraca w kolorze akcentu (ok. 300 ms); zdjęcie z szarego w kolor | wypełnienie liter od lewej, skośna maska (ok. 160–300 ms) | – | – |
| Zamknięcie | linki wyjeżdżają (ok. 150 ms), zdjęcia zwijają się maską, panel podnosi się z wypukłą krawędzią 37255→37600 (**ok. 350 ms**) | niezweryfikowane (Esc zamyka, klatek nie mierzyłem) | – | – |

### Przejście na podstronę i „wstecz”
| | Lando (Taxi.js) | jjettas (Next.js) | Orchid | My |
|---|---|---|---|---|
| Wyjście | klik 86752; **znak „4” w limonce rośnie od środka** 87297→87697 (**400 ms**) i zakrywa ekran | linki menu zjeżdżają, **skośna kurtyna** 110351→110650 (**300 ms**) | zwykłe przeładowanie, szary błysk ok. 200 ms | strona jednostronicowa; przy kliknięciu w link z menu jest „zasłona” (z kodu: elipsa od miejsca kliknięcia 0,75 s `cubic-bezier(.65,.05,0,1)` + zwinięcie 0,45 s = 1,2 s). **Niezweryfikowane na wideo**: serwer `localhost:8813` wyłączył się w trakcie pomiaru |
| Czekanie | limonka z małym logo 87697→89206 (1,5 s, w tym pobranie strony; adres zmienia się w 88229) | ekran z logo **ok. 3,9 s** (ciężka podstrona) | pusty ekran ok. 400 ms | – |
| Wejście | **okno w kształcie „4” otwiera się** na nową stronę 89360→89688 (**330 ms**); potem odręczne „ON” rysuje się 89688→90300 (600 ms), słowa podświetlone paskami | skośna kurtyna odsłania 114536→114803 (270 ms), potem **efekt włączenia starego telewizora**: kreska → pas → pełne wideo 114800→115500 (**700 ms**), tytuł „ON-FIELD” wchodzi literami 115500→116100 (600 ms) | H1 rozjaśnia się (opacity) 64026→64560 (530 ms) | – |
| Razem | **ok. 3,5 s** (z czego 1,5 s to sieć) | **ok. 5,7 s** | ok. 1,3 s | – |
| „Wstecz” | bez przeładowania (Taxi), adres wraca w 38 ms | **pełne przeładowanie z ekranem ładowania od nowa** (słabe) | przeładowanie | – |

### Hover (najechanie)
| | Lando | jjettas | Orchid | My |
|---|---|---|---|---|
| Przycisk | „STORE”: **rolka tekstu** (napis ucieka w górę, kopia wjeżdża od dołu) 20914→21182 = **ok. 270 ms**; ikonki to animacje Rive | karta: **powiększenie ok. 1,08 + przechył 3D w stronę kursora + holograficzny połysk**, wejście 22675→22838 (**ok. 160–250 ms**), połysk płynie dalej | proste zmiany koloru (CSS 0,15–0,4 s) | złoty przycisk: przelot połysku 54516→54870 (**ok. 350 ms**), bez ruchu tekstu |
| Link w pasku | rolka tekstu jak wyżej | skośne wypełnienie | rozwijana lista bez animacji | **kreska pod spodem + rozjaśnienie, ok. 100 ms** (najsłabsze z czterech) |

### Kursor na pierwszym ekranie (średnia zmiana obrazu na klatkę, skala 0–255, cały ekran)
| | Lando | jjettas | Orchid | My |
|---|---|---|---|---|
| Bez myszy | 0,18 | 0,40 (wideo w okularach) | – | 0,32 |
| Z myszą | **0,98** | 0,60 (lekka paralaksa portretu) | ok. 0 | **3,49 (3,6× więcej niż Lando)** |
| Co widać | płyn jest **maską**: na twarzy odsłania barwy kasku (druga tekstura), w tle tylko **jasnoszare, niskokontrastowe smugi**; napisy nietknięte | portret 2,5D lekko obraca się za myszą | – | złoto-srebrny marmur **na całym ekranie, także na H1 i przyciskach**, wysoki kontrast, gaśnie ok. 2 s po zatrzymaniu myszy (`k2-plyn-lando-vs-ebl.jpg`) |

### Przewijanie (Lenis): ile jedzie po zatrzymaniu kółka
| | Lando (`lerp .1`) | jjettas (`lerp .16`, `wheelMultiplier .72`) | Orchid (`duration 1.2`, expo-out) | My (`lerp .14`, `wheelMultiplier .8`) |
|---|---|---|---|---|
| 90–96 % drogi | ok. 565 ms | ok. 260 ms | ok. 410 ms | ok. 350 ms |
| Całkiem stoi | ok. 830 ms | ok. 500 ms | ok. 580 ms | ok. 500 ms |
| Przepustowość kółka (ta sama symulacja) | 12 677 px / 43 s | **12 837 px / 67 s** (główny wątek zajęty, zdarzenia kółka czekają) | 14 295 px / 25 s | 13 684 px / 42 s |

### Wydajność (rAF przez cały scenariusz)
| | Lando | jjettas | Orchid | My |
|---|---|---|---|---|
| Mediana / p95 / p99 klatki | 8,1 / 28 / 36 ms | 4,1 / 28 / **60** ms | 4,0 / 8 / 9,4 ms | 4,0 / 12 / **16** ms |
| Klatki > 33 ms | 1,3 % | **4,6 %** (426 klatek > 50 ms) | 0,3 % | 0,2 % |

Wniosek: **nasza strona jest płynna** (lepiej niż Lando i jjettas). Przegrywamy na reżyserii (czasy, martwe chwile,
zbyt głośny płyn), nie na wydajności.

---

## 2. TOP 8 efektów „wow” na każdej stronie

Warstwy: **GL** = WebGL (Three.js), **CSS** = clip-path/transform, **R** = Rive, **V** = wideo.

### landonorris.com
| # | Efekt (co widać) | Czas, krzywa (zmierzone) | Warstwy | Jak odtworzyć | Mamy? |
|---|---|---|---|---|---|
| 1 | **Okno w kształcie logo** na limonkowej kurtynie: przez znak „4” widać twarz, znak rośnie aż zniknie | 243 ms, przyspiesza do końca (≈ `expo.in`); przed tym 2,8 s stoi ekran ładowania | CSS (maska SVG) | `mask: url(#znak)`; `gsap.fromTo(maska,{scale:1},{scale:40,duration:.25,ease:'expo.in'})`, środek okna = środek twarzy; potem 2 paski kurtyny `yPercent ±100` .16 s `power2.in` | częściowo: mamy okno-koło, ale **przez okno widać pusty granat** i 415 ms martwej pauzy |
| 2 | **Płyn pod kursorem jako maska** (druga tekstura na twarzy, szare smugi w tle) | smugi gasną ok. 0,4–0,6 s; zmiana obrazu 0,98/klatkę | GL (stable fluids, FBO) | rozdzielczość symulacji 128, `dissipation` gęstości ok. 0,90/klatkę, wynik = `mix(tex1, tex2, smoothstep(.1,.5,dye))`; w tle `mix(bg, bg*0.93, dye)` | mamy płyn, ale jako farbę na całym ekranie, 3,6× za mocny |
| 3 | **Wstęgi wizjera przez twarz** (kask 3D rzutuje barwy na twarz) | 2,1 s po wejściu, potem samo co kilka s | GL (GLTF + Draco + rzut tekstury) | u nas odpowiednik: jednorazowy przelot światła/jedwabiu przez rysunek Moniki 1,8–2,2 s `power2.inOut` po kurtynie | brak |
| 4 | **Bloki zasłaniają i odsłaniają nagłówek** (prostokąt rośnie od lewej, potem chowa się w prawo, linia po linii) | rośnie 450 ms (co 80 ms na linię), chowa się 600 ms (co 100 ms); razem ok. 1,15 s; uruchamiane raz przy wejściu w kadr | CSS | na każdą linię `span.blok`: `scaleX 0→1` (origin left, .45 s `power3.inOut`, stagger .08), potem `scaleX 1→0` (origin right, .6 s `expo.inOut`, stagger .1), tekst `opacity 0→1` w chwili pełnego bloku | mamy schodki w manifeście, **nie mamy na nagłówkach** |
| 5 | **Menu: panel spada z wypukłą krawędzią**, zdjęcia i linki kolejno | 55 ms reakcji, 250 ms zakrycie, razem 850 ms | CSS | `clip-path: ellipse(150% 0% at 50% 0%) → ellipse(150% 160% at 50% 0%)` .55 s `cubic-bezier(.65,.05,0,1)`; zdjęcia `clip-path inset(100% 0 0 0)→inset(0)` .6 s od .25 s co .06; linki `yPercent 110→0` .6 s od .35 s co .07 | **brak menu na komputerze** |
| 6 | **Przejście podstron znakiem „4”** (zakrycie znakiem, czekanie, odkrycie znakiem) | 400 ms + sieć + 330 ms | CSS + Taxi.js | Taxi/Barba: `leave` = maska logo `scale .2→40` .4 s `expo.in`; `enter` = odwrotnie .33 s `expo.out` | u nas zasłona-elipsa 1,2 s (niezweryfikowane wideo) |
| 7 | **Rolka tekstu na przyciskach i linkach** | ok. 270 ms | CSS | dwie kopie tekstu w masce `overflow:hidden`; hover: `yPercent 0→-100` i `100→0`, .27 s `cubic-bezier(.65,.05,0,1)` | brak |
| 8 | **Tło zmienia kolor w trakcie toru poziomego** (ciemny → szary → kremowy), zdjęcia w różnych prędkościach | ze scrubem, ok. 2 ekrany | CSS + GSAP ScrollTrigger | `gsap.to(sekcja,{backgroundColor:'#F7F3EA',scrollTrigger:{scrub:.6}})`, zdjęcia `x` z mnożnikami 0,6 / 1 / 1,4 | tor poziomy mamy, tła nie zmieniamy |

### jjettas.com
| # | Efekt | Czas, krzywa | Warstwy | Jak odtworzyć | Mamy? |
|---|---|---|---|---|---|
| 1 | **Logo jako pasek postępu** (wypełnia się od dołu) + licznik | 1,4 s (2107→3515) | CSS | `clip-path: inset(100% 0 0 0) → inset(0)` sterowane realnym postępem ładowania obrazów | brak (nasze logo stoi 1,8 s) |
| 2 | **Skośna kurtyna** odsłania wideo | 550 ms, kąt ok. 15° | CSS | `clip-path: polygon(100% 0,100% 0,85% 100%,85% 100%) → polygon(-15% 0,100% 0,100% 100%,0 100%)` .55 s `cubic-bezier(.85,0,.15,1)` | mamy skos między sekcjami, nie na wejściu |
| 3 | **Film wejściowy kończy się zbliżeniem okularów, kamera odjeżdża do portretu** | odjazd 7007→7525 (ok. 520 ms) | V + GL | ostatnia klatka filmu = pierwsza klatka hero; `scale 3.2→1` .5 s `expo.out` | brak (dla nas: zbliżenie na kryształ/różę → odjazd do Moniki, jeśli powstanie film z RTX) |
| 4 | **Odbicie wideo w okularach** (2,5D portret z mapy głębi) | pętla | GL (mapa głębi + maska soczewek) | u nas: wideo światła w masce kształtu (np. różowe złoto w broszce/medalionie) `mix-blend-mode:screen` | mamy głębię w WebGL, bez wideo |
| 5 | **Karta: powiększenie + przechył 3D + holograficzny połysk** | 160–250 ms wejście | CSS | `quickTo(rotationX/Y, .4, 'power3.out')` ±6°, `scale 1.04`, warstwa `linear-gradient(115deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%)` z `background-position` za kursorem, `mix-blend-mode:overlay` | brak |
| 6 | **Menu pełnoekranowe**: ciemnienie + linki z dołu | 170 ms opóźnienia, 375 ms ciemnienie, razem 550 ms | CSS | `opacity 0→.96` .38 s `power2.out`; linki `y 24→0, opacity` stagger .035 | brak na komputerze |
| 7 | **Włączenie starego telewizora** przy wejściu na podstronę (kreska → pas → wideo) | 700 ms + litery tytułu 600 ms | CSS + V | wideo: `scaleY .004→.08` (.25 s `expo.out`), `scaleY .08→1` (.3 s `expo.inOut`), błysk `filter: brightness(2.2)→1` .4 s | brak |
| 8 | **Stos zdjęć jak odbitki na cytacie** + podmiana produktów w pinie (but → zdjęcia → płatki → słuchawki) | ze scrubem | CSS (pin) | pin 300 vh, każda odbitka `y 110vh→0, rotate ±6°` po kolei; produkty `scale .8→1 + opacity` na zmianę | brak |

### orchid.security
| # | Efekt | Czas, krzywa | Warstwy | Jak odtworzyć | Mamy? |
|---|---|---|---|---|---|
| 1 | **Panel produktu rośnie w kadr** przy przewijaniu (hero przypięty) | scrub | CSS | `scale .86→1, y 120→0` scrub .8 | mamy odwrotność (hero maleje do ramki) |
| 2 | **Szklane karty krążą wokół tytułu** w różnych głębokościach | scrub | CSS | pin 200 vh; karty `z`/`scale .7→1`, `blur 6→0`, `y ±30vh` | brak (sekcja celów jest pusta i ciemna) |
| 3 | **Rozmyta kula światła** płynie za treścią | scrub | CSS | `radial-gradient` 520 px, `filter: blur(60px)`, `opacity .55`, `mix-blend-mode: screen`, pozycja scrubem | mamy małą kulę w krokach |
| 4 | **Linia łączy kroki**, punkt świeci na końcu | scrub | CSS/SVG | `stroke-dashoffset` scrub .8 + punkt z poświatą | mamy (wdrożone po SILNIKI.md) |
| 5 | **Pas światła** przed formularzem (fiolet → róż → turkus) | scrub | CSS | gradient 3 kolorów, `blur(40px)`, `plus-lighter`, `scaleX .2→1` | do sprawdzenia u nas |
| 6 | **Liczby od zera** (72 %, 93 %) | 2 s `easeOutQuart` | JS | jak w SILNIKI.md #21, nie dla cen | brak (i dobrze dla cen) |
| 7 | **Słowa opinii rozjaśniają się** przy przewijaniu | scrub .8 | CSS (IX3) | SplitText words, `opacity .4→1` stagger .1 | mamy w manifeście |
| 8 | **Najkrótsze przewijanie z Lenisa** (duration 1.2, expo-out) i najmniej zacięć (p99 9,4 ms) | – | – | wzór wydajności: brak WebGL, mało pętli | wydajność mamy podobną |

---

## 3. Wzór vs Evolution Body Lab (ocena 1–10)

| Obszar | Lando | jjettas | Orchid | **My** | Co gorsze u nas, o ile, dlaczego |
|---|---|---|---|---|---|
| Pierwszy ekran | 10 | 9 | 6 | **6** | Płyn 3,6× za mocny i na całym ekranie, przykrywa H1 i przyciski; po wejściu nic się samo nie dzieje (Lando: wstęgi 2,1 s, jjettas: odbicie wideo). |
| Ekran ładowania / kurtyna | 9 | 8 | 4 | **5** | Do treści 5,3 s (Lando 4,0 s); 1,8 s stoi gotowe logo, 415 ms puste kółko, okno pokazuje pusty granat zamiast twarzy. Lando: okno pokazuje twarz od pierwszej klatki. |
| Przewijanie | 9 | 7 | 9 | **8** | Odczucie dobre (stoi po ok. 500 ms, jak jjettas). Brak zmian koloru tła sekcji w trakcie przewijania (Lando). |
| Typografia | 10 | 9 | 7 | **6** | Mieszanka krojów ok., ale brak „sygnatury”: Lando ma bloki, kolor słów, odręczne dopiski; jjettas wąski krój 70 px w menu. U nas nagłówki tylko spod maski. |
| Przejścia sekcji | 10 | 9 | 8 | **7** | Dobre: ramka między rzędami napisu, teleport w różę, tor poziomy. Słabe: ciemne, prawie puste ekrany (sekcja celów, przejście do toru). |
| Hover / kursor | 9 | 9 | 5 | **4** | Link: kreska 100 ms (wzory: rolka 270 ms, skośne wypełnienie); brak przechyłu kart; kursor maluje zamiast odsłaniać. |
| Menu | 10 | 8 | 4 | **2** | Na komputerze nie ma menu pełnoekranowego wcale (oba główne wzory je mają, nawet na 1440 px). |
| Przejścia podstron | 10 | 7 | 3 | **5 (niezweryfikowane)** | Jedna strona; zasłona przy kliknięciu w link 1,2 s z kodu, nienagrana. Kształt elipsy zamiast znaku marki. |
| Obrazy / 3D / wideo | 10 | 10 | 6 | **6** | Rendery sprzętu dobre, ale wszystko statyczne: zero pętli wideo, brak 3D obiektu (Lando: kask 3D, jjettas: 2,5D + wideo). |
| Wydajność | 7 | 5 | 9 | **9** | Lepiej niż Lando i jjettas: p99 16 ms, 0,2 % klatek > 33 ms. Trzymać przy zmianach. |
| **Średnio** | **9,4** | **8,1** | **6,1** | **5,8** | |

---

## 4. 15 poprawek dla naszej strony (kolejność = wpływ)

Zakres: komputer (1440 i 1366). Na ≤ 900 px nowe efekty wyłączone (decyzja Daniela). Ograniczony ruch: stan końcowy od razu.

1. **Płyn w hero: maska, nie farba.** Gęstość `dissipation` 0,90/klatkę (smugi gasną ≤ 600 ms), jasność barwnika ×0,3;
   w tle smugi tylko `#101C3A → #1A2747` (kontrast ok. 1,2:1); **wyłączenie nad H1 i przyciskami** (uniform z prostokątem
   bloku tekstu, `smoothstep` 40 px); na postaci płyn odsłania drugą teksturę (np. Monika w różowym złocie / świetle).
   Cel: zmiana obrazu z myszą ≤ 1,0/klatkę (dziś 3,49).
2. **Kurtyna krótsza i z treścią w oknie.** Razem ≤ 2,6 s do treści (dziś 5,3 s): logo buduje się 0–0,9 s (np. wypełnienie
   od dołu jak pasek postępu jjettas), postój ≤ 0,3 s, okno otwiera się w 1,2 s; **środek okna na twarzy Moniki**,
   okno rośnie 0,45 s `expo.in` do skali ≥ 30; usunąć 415 ms pustego kółka; H1 startuje 0,1 s przed końcem okna.
3. **Menu pełnoekranowe na komputerze** (burger 56×56 w prawym rogu obok „Prendre rendez-vous”): panel granat
   `clip-path: ellipse(150% 0% at 50% 0%) → ellipse(150% 160% at 50% 0%)` 0,55 s `cubic-bezier(.65,.05,0,1)`, wypukła
   krawędź z różowozłotą nitką 1 px; 3–4 kadry (sprzęt, medalion) `inset(100% 0 0 0)→inset(0)` 0,6 s od 0,25 s co 0,06;
   linki (Cormorant 64–72 px) `yPercent 110→0` 0,6 s od 0,35 s co 0,07; zamknięcie odwrotnie 0,6 s. Kadry w szarości,
   kolor po najechaniu na link (0,3 s).
4. **Rolka tekstu na linkach i przyciskach** (Lando): dwie kopie w masce, `yPercent 0→-100 / 100→0`, 0,27 s
   `cubic-bezier(.65,.05,0,1)`; zostawić złoty połysk przycisku (350 ms), rolka dochodzi do niego.
5. **Bloki odsłaniające wielkie nagłówki** („Première visite”, „EMS”, „Cryolipolyse”, „Prendre rendez-vous”): na linię
   blok `scaleX 0→1` (origin left) 0,45 s `power3.inOut` co 0,08, potem `scaleX 1→0` (origin right) 0,6 s `expo.inOut`
   co 0,1; blok `#D4A49A` na granacie, `#0A142C` na lnie; raz, `start: 'top 80%'`.
6. **Bez martwych ciemnych ekranów**: sekcja celów (`#objectifs`) jako szklane karty krążące wokół tytułu (Orchid,
   pin 200 vh, `scale .7→1`, `blur 6→0`, scrub .8) albo wyraźniejszy kontrast; przejście granat → len zmianą koloru
   tła scrubem na 60 vh (`editorial`), tekst `#F6F0E4 → #1E1A1C` w tym samym odcinku.
7. **Pętle wideo z RTX w torze 3 petard** (jjettas: wideo jest wszędzie): 6–8 s obrót urządzenia EMS / krio / kabiny,
   1280 px, H.264 ok. 1,5 MB, `muted playsinline loop`, `poster` = obecny render, start gdy karta w kadrze
   (IntersectionObserver), pauza poza kadrem; plakietka „Image de synthèse”.
8. **Wejście wideo jak włączenie telewizora** (jjettas) dla tych pętli: `scaleY .004→.08` 0,25 s `expo.out`, potem
   `→1` 0,3 s `expo.inOut`, błysk `brightness(2.2→1)` 0,4 s. Tylko raz na kartę.
9. **Przechył kart + połysk** (karty zabiegów, ceny, kroki): `rotationX/Y` ±6° za kursorem przez `gsap.quickTo`
   0,4 s `power3.out`, `scale 1.04` 0,25 s, warstwa połysku `linear-gradient(115deg, transparent 30%,
   rgba(246,240,228,.28) 50%, transparent 70%)` przesuwana za kursorem, `mix-blend-mode: overlay`; `perspective 900px`.
10. **Życie pierwszego ekranu po kurtynie**: jednorazowy przelot światła (jedwab / ciekłe złoto) przez rysunek Moniki
    1,8–2,2 s `power2.inOut` (odpowiednik wstęg Lando), potem co 8–10 s słabszy; paralaksa głębi ±8 px,
    `quickTo` 1,4 s `power3.out`. Twarz bez dystorsji (jak dziś).
11. **Zasłona przy kliknięciu w link: kształt medalionu zamiast elipsy** (Lando: znak „4”): maska z obrysu medalionu
    `scale .2→40` 0,4 s `expo.in`, pod nią skok Lenisa, odkrycie odwrotnie 0,33 s `expo.out`; razem ≤ 0,9 s
    (dziś 1,2 s). Najpierw nagrać obecną wersję (niezweryfikowana).
12. **Tło sekcji z kolorem w torze poziomym** (Lando): podczas toru 3 petard tło przechodzi `#0A142C → #101C3A → #0E1A36`
    lub do lnu, a karty jadą z różnymi mnożnikami prędkości 0,6 / 1 / 1,4.
13. **Kula światła większa i prowadzona linią kroków** (Orchid): 520 px, `blur(60px)`, `opacity .55`, `screen`, kolor
    różowe złoto → kość słoniowa, pozycja scrubem .8 razem z głowicą linii.
14. **Pas światła przed kontaktem** (Orchid): gradient różowe złoto → kość słoniowa → granat, `blur(40px)`,
    `plus-lighter`, `scaleX .2→1` scrubem na wejściu `#contact` (sprawdzić, czy obecny `pas` w `js/efekty.js` jest widoczny).
15. **Budżet wydajności przy każdej zmianie**: p99 ≤ 20 ms, klatki > 33 ms ≤ 0,5 % (dziś 16 ms i 0,2 %); WebGL `dpr ≤ 1.5`,
    pauza poza ekranem, wideo tylko w kadrze. Pomiar: `wzory-2\nagraj.cjs ebl http://localhost:8813/` + `analiza.py ebl`.

**Nie przenosimy**: odręcznych podpisów i bazgrołów (podpis Moniki usunięty, Daniel: „nie jest super”), dźwięku (jjettas),
długiego filmu wejściowego 8,4 s (jjettas, za długo dla gabinetu), „wstecz” z przeładowaniem (jjettas).

---

## 5. Czego nie zmierzyłem / ograniczenia
- **Zasłona naszej strony przy kliknięciu w link** (przejście „podstron” u nas): serwer `localhost:8813` przestał odpowiadać
  w trakcie dodatkowego nagrania; czasy tylko z kodu (`js/efekty.js`).
- Zamknięcie menu jjettas i wizualny powrót „wstecz” na Lando: niezweryfikowane (adres wraca w 38 ms, klatek nie oglądałem).
- Przewijanie: Playwright nie nadążał z 60 krokami/s (realnie 300–600 px/s zamiast 1200), więc to „spokojne” przewijanie.
  jjettas przewinięte do 12 837 z 17 158 px (limit 90 s), koniec strony (partnerstwa → stopka) bez nagrania.
- FPS: przeglądarka bez okna nie ma limitu 60 Hz; liczby porównują zacięcia, nie FPS monitora. Telefon nie mierzony
  (zgodnie z decyzją: teraz tylko komputer).
- Orchid: baner ciasteczek odrzucony („Reject”), nic nie akceptowałem; nic nie logowałem.
- Czasy zależą od sieci (Lando 1,5 s i jjettas 3,9 s czekania na podstronę to w dużej części pobieranie).
