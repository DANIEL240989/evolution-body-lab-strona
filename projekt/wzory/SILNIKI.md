# Silniki ruchu: landonorris.com, jjettas.com, orchid.security (pomiar 03.10.2026)

Cel: odtworzyć **mechanikę** ruchu, rytm i układ na stronie Moniki. Nie kopiujemy kodu, shaderów, obrazów, fontów ani tekstów.
Pomiar: komputer Daniela, Edge bez okna (Playwright), komputer 1440×900 i telefon 390×844 (iPhone UA, dotyk).
Pobrane wszystkie skrypty stron (też zbundlowane), szukane sygnatury, przechwycone shadery (`shaderSource`), liczniki
`IntersectionObserver` / `requestAnimationFrame` / `mousemove`, arkusze CSS (krzywe `cubic-bezier`, `transition`, `@keyframes`),
klatki co 200 px przewijania i 24 klatki wejścia (co 250 ms).

Czego nie zmierzyłem, oznaczam **(niezweryfikowane)**. Czasy z klatek są przybliżone: zrzut strony z WebGL trwał ok. 0,5–0,8 s,
więc czasów animacji poniżej 1 s nie da się odczytać z klatek; podaję je tylko z kodu/CSS.

Pliki na komputerze Daniela (ciężkie, poza repo): `D:\CLAUDE CODE\evolution-body-lab\wzory-silniki\`
- `<strona>-pc\k\w00..w23.png` wejście, `s000..sNNN.png` przewijanie co 200 px; `<strona>-tel\k\...` to samo na telefonie
- `<strona>-pc\info.json` pomiar, `shadery.txt` (tylko do nauki, nie przenosić do repo), `js\` pobrane skrypty
- `arkusze\*.jpg` arkusze klatek (najwygodniej oglądać): `lando-w.jpg`, `lando-s1.jpg`, `lando-s2.jpg`, `jjettas-*.jpg`, `orchid-*.jpg`, `*-tel.jpg`
- skrypty: `analiza.cjs`, `sygnatury.cjs`, `kontekst.cjs`, `pokaz.cjs`, `uniformy.cjs`, `arkusz.cjs`

Klatki w repo (`projekt/wzory/`, JPG 560 px, przeniesione przez base64, sumy MD5 zgodne z PC):
`lando-s01-wejscie.jpg` (logo jako okno na zdjęcie), `lando-s02-hero-webgl.jpg` (wstęgi WebGL na portrecie),
`lando-s03-marquee-podpis.jpg` (zdjęcie w ramce między rzędami wielkiego napisu), `jjettas-s01-skos.jpg` (skośna kurtyna sekcji).
Wcześniejsze zrzuty `jjettas-0..4.png`, `orchid-0..4.png`, `lando-k00..k45.png` zostają.

---

## 1. Silniki: tabela

| | landonorris.com | jjettas.com | orchid.security |
|---|---|---|---|
| Platforma | Webflow + jQuery 3.5.1, własny bundle OFF+BRAND (1,3 MB) | Next.js (React), Tailwind | Webflow + Webflow Interactions IX3 |
| GSAP | **3.13.0 zbundlowany** (ScrollTrigger, SplitText, Flip, Observer). Nie jest globalny, stąd wcześniejszy błędny wniosek „brak GSAP” w `lando-analiza.json` | **3.15.0 zbundlowany** (ScrollTrigger, Flip) | 3.15.0 z CDN Webflow (gsap, ScrollTrigger, SplitText) dla IX3 + osobno 3.12.5 z jsDelivr (gsap, ScrollTrigger) dla własnych skryptów |
| Płynne przewijanie | Lenis (zbundlowany): `lerp 0.1`, `wheelMultiplier 1`, **`syncTouch` włączony** (na iPhonie klasa `lenis` też jest) | Lenis (ładowany dynamicznie): `lerp .16`, `wheelMultiplier .72`, `touchMultiplier 1.5`, `smoothWheel`, `syncTouch:false`; ticker GSAP, `lagSmoothing(0)`; **wyłączony** przy `(max-width:767px), (max-width:900px) and (pointer:coarse)` | Lenis 1.1.18 (unpkg): `duration 1.2`, easing `min(1, 1.001 − 2^(−10t))` (expo-out), `smoothWheel`, `syncTouch:false`; własna pętla rAF, `resize()` z ResizeObserver i MutationObserver |
| Przejścia stron | **Taxi.js** (`@unseenco/taxi`): fetch strony, podmiana `[data-taxi-view]`, pełnoekranowa animacja Rive (`transition-rive` 1440×900) | nie zmierzono przejść między podstronami (niezweryfikowane) | brak (zwykłe przeładowanie, `speculationrules prerender moderate`) |
| WebGL | **Three.js** + GLTFLoader + **Draco** (kask 3D), 3 konteksty WebGL2; 34 shadery: symulacja płynu pod kursorem, tło z poziomicami z szumu, tekst MSDF, przejście tekstur kasków, skan siatki | **Three.js** (pełny pakiet), 3 konteksty WebGL2 na komputerze, 1 na telefonie; portret 2,5D z mapy głębi + odbicie wideo w okularach | **brak** WebGL i canvasu |
| Inne biblioteki | **Rive** `@rive-app/canvas-lite 2.26.4` (19 małych canvasów 2D: ikony, strzałki przycisków, logo w nawigacji, napis „Collabs”, przejście stron) | **Lottie 5.13.0** (svg), WebAudio (dźwięki kliknięć i przejść z pogłosem), 5 canvasów 2D „kropkowanego” napisu | Swiper 11, Lottie (ikony svg), Finsweet components, HubSpot formularze |
| Własny kursor | brak elementu z `cursor:none`; kursor steruje efektem w shaderze (`uMouseCoords`, `uMousePace`) | ukryty element 64 px `fixed` (pojawia się w strefach, niezweryfikowane gdzie) + paralaksa portretu za myszą | brak |
| Sticky / pin | CSS `sticky` (hero, tor poziomy `horizontal-pin-sticky`), sekcja toru 3143 px | `jj-pin-pane sticky` (kilka), strona 17 158 px na komputerze, 7 016 px na telefonie | CSS `sticky` (hero 2115 px, „Why Orchid” 2880 px, kula gradientu) |
| Krzywe w CSS/JS | `--animation-default: 0.75s cubic-bezier(0.65,0.05,0,1)`; `cubic-bezier(0.19,1,0.22,1)` (expo-out); w JS `expo.inOut`, `power2.out`, `back.out(1.2)` | tokeny: `editorial (.65,.05,.36,1)`, `ui (.4,0,.2,1)`, `cover (.85,0,.15,1)`, `reveal (.16,1,.3,1)`; domyślny ScrollTrigger `start "top 80%"`, `end "bottom 60%"`, `scrub .6` | IX3 text-scrub: `scrub .8`, `start "top center"`, `end "80% center"`; własne `power1.inOut` 1 s; CSS przejścia 0,15–0,4 s `ease` |
| Telefon | prawie wszystko zostaje: Lenis z `syncTouch`, 3 WebGL, Rive; strona krótsza (10 077 px) | **natywne przewijanie**, piny wyłączone (`home-native-flow`), 1 WebGL, karuzele z kropkami zamiast torów | Lenis bez `syncTouch` (dotyk natywny), Swiper zamiast siatek, sticky zostaje |
| Ograniczony ruch | niezweryfikowane | wiele gałęzi `prefers-reduced-motion` (intro kończy się od razu, brak paralaksy, brak pinów) | niezweryfikowane |

Wydajność (licznik `requestAnimationFrame` po ok. 10 s + przewinięciu): Lando ok. 8 300 wywołań, jjettas ok. 34 000 (dużo pętli
naraz), Orchid ok. 10 500 (orbitujące ikony liczą co klatkę). Wniosek: ciężar robią pętle rAF i WebGL, nie GSAP.

### Shadery (opis działania, kod tylko na D:)
- **Lando, pierwszy ekran**: pełnoekranowa płaszczyzna; tło to **poziomice z szumu** (grubość linii, kolor tła/linii); **kursor
  napędza symulację płynu** (klasyczne „stable fluids”: adwekcja prędkości, dywergencja, ciśnienie Poissona, siła w kole pod
  kursorem); wynik symulacji jest maską: tam, gdzie płyn „płynie”, przez portret prześwituje druga tekstura (kask) i inne kolory.
  Wejście: `uReveal` przesuwa i rozciąga UV od dołu (odsłona pasem). Kask 3D (GLTF/Draco) z materiałem fizycznym i rzutowaną
  teksturą (`uProjectorMatrix`) daje wstęgi „wizjera” lecące przez twarz (klatka `lando-s02-hero-webgl.jpg`).
- **Lando, galeria kasków**: przejście między dwiema teksturami pasem w osi Y modelu (`tCurrent` → `tNext`), ciemne krawędzie.
- **Lando, napisy 3D**: tekst MSDF (ostry tekst w WebGL z obrysem wewn./zewn.). Siatka modelu ze „skanem” (pasek jasności
  przesuwany w czasie wzdłuż Y).
- **jjettas, portret**: płaszczyzna 128×128 przesunięta mapą głębi (kontrast, gamma, bias, skala, którą da się spłaszczyć do 0),
  mapa normalnych, maska soczewek okularów z **odbiciem wideo** jako teksturą, ciepły filtr; `pixelRatio ≤ 1.5`; obiekt
  przesuwa się za myszą (`quickTo x`, 1,4 s, `power3.out`, tylko `pointer: fine`).

---

## 2. Mechanika sekcja po sekcji (co widać na klatkach)

### landonorris.com (komputer)
1. **Wejście**: ekran w kolorze marki z napisem ładowania na dole (w00) → znak firmy jako **okno**, przez które widać zdjęcie
   (w02, `lando-s01-wejscie.jpg`) → okno rośnie do pełnego ekranu, portret (w04). Od razu startuje WebGL: wstęgi wizjera
   przelatują przez twarz co kilka sekund (w04, w10, w12, w22).
2. **Hero → manifest**: portret maleje do ramki na środku, **po bokach dwa rzędy wielkiego napisu** jadą w przeciwne strony,
   na to **odręczny podpis rysuje się kreską** (Rive), tło ciemnieje (s002–s006, `lando-s03-marquee-podpis.jpg`).
3. **Manifest**: duży tekst wersalikami, wybrane słowa w kolorze akcentu i innym kroju; **bloki-schodki** w kolorze marki
   wjeżdżają i zasłaniają tekst (s006–s008). (U nas już są schodki.)
4. **Tor poziomy (kolaż)**: przypięta sekcja 3143 px, zdjęcia w różnych rozmiarach i głębokościach przesuwają się z różną
   prędkością, **tło przechodzi z ciemnego w jasne** w trakcie toru (s012–s026).
5. **On track / Off track**: dwa słowa obok siebie, zdjęcia wjeżdżają z obu boków i spotykają się na środku (s028–s034).
6. **Galeria kasków**: ciemna siatka, kafle z kaskami, przejście tekstur pasem (s036–s044).
7. **Sklep / partnerzy**: krzywa linia góry sekcji (wybrzuszenie), kolaż; **bazgroł „Collabs” rysuje się** (Rive) (s048–s054).
8. **Social**: karty w **wachlarzu** po łuku (s058–s060).
9. **Stopka**: ciemny panel z wycięciem u góry wjeżdża na jasne tło w kolorze marki, napis główny z akcentem (s062–s072).
10. **Menu**: `clip-path: ellipse(120% 0% at 50% 0%)` → otwarte (zasłona spada od góry jak kropla); linki menu
    `ellipse(30% 0% at 50% 0%)`; czas i krzywa z `--animation-default` = **0,75 s `cubic-bezier(0.65,0.05,0,1)`**
    (stan otwarty nie zmierzony, niezweryfikowane). Obrazy menu z `mix-blend-mode: saturation` / `plus-lighter`.
11. **Drobne**: etykiety i linki odsłaniane `clip-path: inset(0 100% 0 0)` → `inset(0)` (0,75 s, ta sama krzywa); linie tekstu
    w masce `polygon(...)`; wskaźnik przewijania z `mix-blend-mode: difference`; strzałki w przyciskach to animacje Rive.
    Hover przycisku „Store”: kolor/tło bez zmiany transformacji (zmierzone), animuje się ikonka Rive.

### jjettas.com (komputer)
1. **Wejście**: ciemny ekran, logo + **licznik postępu** pod spodem (w00–w02) → **skośna kurtyna** odsłania wideo świetlnego
   tunelu (w04) → postać z wideo → przejście w jasny hero z portretem (w08). Kod: wejście liczy `r = 1 − (1 − t)²`,
   obraz jedzie `translateY 55%·(1 − r)` i `scale 1,25 − 0,25·r`.
2. **Hero**: portret 2,5D (WebGL, mapa głębi), **odbicia w okularach zmieniają się** (wideo w masce soczewek), w tle
   **gigantyczne litery** jadą bardzo wolno (`bg-marquee` 90 s, `mix-blend-mode: soft-light`), karta z boku i podpis.
3. **Skos**: ciemna sekcja wjeżdża **po przekątnej** na hero (`clip-path: polygon`), na niej numery jak linie boiska
   (s002–s008, `jjettas-s01-skos.jpg`).
4. **Tor kart**: przypięty, karty unoszą się (`jj-card-float` 6,4 / 7,5 / 8,6 s, liniowo, w pętli), lekko obrócone w 3D, wielki
   napis sekcji w tle (s008–s030).
5. **Kropkowany napis**: napis rozpada się w **matrycę kropek** i składa z powrotem (2D canvas `jj-dr-canvas` + „duch” napisu
   + właściwy napis w skośnej masce `polygon(0 -15%, 0 -15%, -18% 115%, 0 115%)`, czyli wycieranie pod kątem) (s030–s040).
6. **Cytat**: litery cytatu zapalają się kolejno (s038), potem **stos zdjęć jak polaroidy** przekłada się nad cytatem w pinie
   (s046–s060).
7. **Partnerstwa**: przypięta scena, produkty i zdjęcia **podmieniają się** (skala + przenikanie), pasek logotypów jedzie w pętli
   (`jj-partner-marquee` 80 s) (s064–s090).
8. **Menu**: linki z wypełnieniem w skośnej masce (`menu-link-fill`), ziarno (`mix-blend-mode: overlay`). Otwarcia menu nie udało
   się wyzwolić (niezweryfikowane).
9. **Dźwięk**: WebAudio, krótki „klik” i „przejście” (głośność .55/.45, pogłos z convolvera), przełącznik z paskami equalizera.
10. Stopka: panel unosi się w pętli (`footer-float` 4,4 s), przejścia kolorów `.8s var(--ease-editorial)`.

### orchid.security (komputer)
1. **Wejście**: bez preloadera; oś `power1.inOut` 1 s: bloki hero `opacity 0, y 50` → 0, `stagger .2`, potem treść `opacity`
   z nakładką −0,4 s.
2. **Hero przypięty** (2115 px): obraz panelu produktu **rośnie i wjeżdża w kadr** przy przewijaniu (s000–s006).
3. **„Why Orchid”** (2880 px, sticky): tytuł stoi na środku, **szklane karty** przelatują wokół niego w różnych głębokościach
   (s010–s022).
4. **Opinia**: słowa rozjaśniają się przy przewijaniu (IX3: `SplitText words` z maską, `opacity 40% → 100%`, `stagger .1`,
   `scrub .8`, `top center` → `80% center`).
5. **Liczby**: licznik od 0, `easeOutQuart = 1 − (1 − t)⁴`, 2000 ms, start z IntersectionObserver (s028–s030).
6. **How it works**: **rozmyta kula gradientu** (sticky) płynie przez sekcję, **linia łączy kroki** i świeci (s034–s046).
   Ikony orbitują po półokręgu (ping-pong 0–180°, prędkości 0,02–0,069°/klatkę).
7. **Pas światła** przed CTA: poziomy, rozmyty, `mix-blend-mode: plus-lighter` (s058).
8. Siatka logotypów: szkic konturem → kolor po najechaniu. FAQ: zwykły akordeon. Wejścia elementów `[data-ani]`: `y 24 → 0`
   1 s, `start "top 90%"`; listy `y 50`, `stagger .15`, `delay .3`.

### Telefon (390×844)
- **Lando**: zostaje prawie wszystko (WebGL hero z wstęgami, podpis, kolaż w pionie, kaski w 2 kolumnach); Lenis z `syncTouch`.
- **jjettas**: piny i tory wyłączone, przewijanie natywne; tor kart → karuzela z kropkami; stos zdjęć zostaje (lżejszy);
  hero statyczny (1 WebGL zamiast 3); długość strony 7016 zamiast 17 158 px.
- **Orchid**: karty i siatki → Swiper; kula i linie zostają; Lenis tylko na kółko (dotyk natywnie).

---

## 3. Co już mamy (js/ruch.js, CLAUDE.md), żeby nie dublować
Kurtyna (litery spod maski, linia rośnie od środka, ekran się rozchyla), krzywe `ebl (0.16,1,0.3,1)` = „reveal” z jjettas i
`ebl-io (0.65,0,0.35,1)`, Lenis tylko z myszą (`lerp .09`), nagłówki linia po linii spod maski, etykiety wycierane, zdjęcia spod
maski, pas napisu w dwóch rzędach z prędkością przewijania, słowa manifestu rozjaśniane przy przewijaniu (jak Orchid),
schodki z bloków (jak Lando), `#soins`: 2 karty w siatce + wielkie słowo w tle, tor poziomy od 3 kart, `#visite`: połówki
rozjeżdżają się + kula + kreska, ilustracje marki odsłaniane kołem, stopka unosi się.
**Nie wolno**: podpisu Moniki kreską (usunięty 03.10, „nie jest super”), dźwięku bez zgody (nie ma w wzorach dla gabinetu),
obrazów przed/po, ludzi na wizualizacjach.

---

## 4. Efekty do odtworzenia na stronie Moniki (21)

Skróty: **Koszt**: lekki (CSS/GSAP), średni (pin + kilka warstw albo 2D canvas), ciężki (WebGL). **Priorytet** 1 = najpierw.
Wszystkie: przy `prefers-reduced-motion` stan końcowy od razu, bez pinów; formularze i dane kontaktu bez animacji.

| # | Efekt | Wzór | Jak działa (technika i parametry) | Gdzie u nas | Telefon | Ograniczony ruch | Koszt | P |
|---|---|---|---|---|---|---|---|---|
| 1 | **Tokeny ruchu** | jjettas | 4 krzywe jako `CustomEase`: `ebl` (= reveal .16,1,.3,1, już jest), `cover` (.85,0,.15,1) do kurtyn i skosów, `editorial` (.65,.05,.36,1) do zmian koloru tła i menu, `ui` (.4,0,.2,1) 0,3 s do hoverów. Domyślnie dla scrub: `start "top 80%"`, `end "bottom 60%"`, `scrub .6` | cały `ruch.js` + `css/paleta.css` (zmienne `--e-ui`, `--e-editorial`) | to samo | czasy → 0 | lekki | 1 |
| 2 | **Strojenie Lenisa** | jjettas / Orchid | test `lerp .12–.16` + `wheelMultiplier .72–.8` (krótszy „ogon”, mniej przejechania niż nasze `.09`); alternatywa Orchid `duration 1.2` + expo-out. Zostaje: tylko mysz, `lagSmoothing(0)`, `resize()` po wczytaniu obrazów | globalnie | natywnie (jak jjettas i Orchid) | brak Lenisa | lekki | 1 |
| 3 | **Okno logo w kurtynie** | Lando | po napisie w kurtynie znak (koło z damą) staje się **oknem**: `clip-path: circle()` albo maska SVG z kształtem logo pokazuje pierwszy kadr „fali”; okno rośnie do pełnego ekranu (1,1–1,3 s, `cover`), potem kurtyna znika | kurtyna → `#top` | krótsza wersja (0,8 s) albo tylko obecna kurtyna | bez kurtyny | lekki | 1 |
| 4 | **Hero kurczy się do ramki między rzędami napisu** | Lando | pin `#top` na ok. 100–120 vh; obraz fali `clip-path: inset(0)` → `inset(18% 30% round 6px)` + `scale 1 → .92`, scrub `.6`; nasz pas napisu (2 rzędy) jedzie dalej po bokach; tło do `#05070D` | `#top` → `#approche` | bez pinu: obraz zwęża się zwykłym scrubem bez przypięcia | brak pinu, ramka od razu | średni | 1 |
| 5 | **Kursor-latarka** | Lando (lekka wersja) | zamiast symulacji płynu: warstwa z drugim kadrem (np. kryształ rozjaśniony / różowe złoto) nad falą, odsłaniana `mask-image: radial-gradient(circle 18vmax at var(--x) var(--y), #000 40%, transparent 70%)`; `--x/--y` przez `gsap.quickTo` 0,6–0,8 s `power3.out`; promień rośnie z prędkością myszy | `#top` | wyłączone (statyczny obraz) | wyłączone | lekki/średni | 2 |
| 6 | **Kursor-płyn WebGL** | Lando (pełna wersja) | Three.js lub OGL: symulacja płynu 64–128 px FBO (adwekcja, dywergencja, ciśnienie 10–20 iteracji), wynik jako maska między dwiema teksturami fali; `dpr ≤ 1.5`; start po kurtynie; pauza poza ekranem (IntersectionObserver) | `#top` | wyłączone | wyłączone | ciężki | 3 |
| 7 | **Poziomice z szumu w tle** | Lando | prerenderowana tekstura (lub SVG) cienkich linii poziomic w różowym złocie, 4–8 % krycia, bardzo wolny dryf `backgroundPosition` (60–90 s) albo scrub; bez WebGL | ciemne sekcje: `#approche`, `#visite` | statyczne | statyczne | lekki | 2 |
| 8 | **Skośna kurtyna sekcji** | jjettas | następna sekcja wjeżdża po przekątnej: `clip-path: polygon(0 100%, 100% 72%, 100% 100%, 0 100%)` → `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, scrub `.6`, krzywa `cover`; na krawędzi cienka różowozłota linia | `#visite` → `#monika` (noc → len), ewentualnie `#faq` → `#contact` | prostszy kąt (polygon 0 100% → 0 0), bez pinu | od razu pełna | lekki | 1 |
| 9 | **Tło zmienia kolor w trakcie przewijania** | Lando (tor kolażu) | `background-color` sekcji interpolowany scrubem z `#05070D` do lnu `#F7F3EA`, tekst z kości słoniowej do `#1E1A1C` w tym samym odcinku (ok. 60 vh), krzywa `editorial` | przejście `#visite` → `#monika` (alternatywa dla #8) | to samo, krótszy odcinek | twarde przejście | lekki | 2 |
| 10 | **Portret 2,5D z mapy głębi** | jjettas | mapa głębi z obrazu fali (lokalnie: Depth Anything w ComfyUI na RTX), siatka 128×128 przesuwana w shaderze wierzchołków, paralaksa za myszą `quickTo` 1,4 s `power3.out`, max ±8 px / ±2°; `dpr ≤ 1.5` | `#top` (kryształ na fali) | wyłączone; ewentualnie wolny dryf bez myszy | wyłączone | ciężki | 2 |
| 11 | **Błysk w krysztale** | jjettas (odbicie w soczewkach) | w masce kształtu kryształu (`mask-image` z PNG alfa) przesuwa się smuga światła `linear-gradient` 20–30° co 6–9 s (`background-position`, `sine.inOut`) albo krótka pętla wideo; `mix-blend-mode: screen` | `#top`, `#contact` (klif z kryształem) | zostaje (CSS, tanie) | wyłączone | lekki | 2 |
| 12 | **Kropkowany nagłówek** | jjettas | nagłówek rysowany w 2D canvas jako siatka kropek (próbkowanie liter co 4–6 px), przy wejściu kropki zbiegają się i płynnie przechodzą w prawdziwy tekst; prawdziwy tekst w skośnej masce `polygon(0 -15%, 0 -15%, -18% 115%, 0 115%)` → pełny, 1,1 s `ebl` | jeden nagłówek: „Première visite” (`#visite`) albo cytat w `#monika` | zamiast kropek: tylko skośne wycieranie | tekst od razu | średni | 2 |
| 13 | **Skośne wycieranie tekstu** | jjettas | etykiety i krótkie napisy: maska `polygon` z kątem −18 % zamiast prostego `inset`; 0,38 s `reveal` na hover, 0,9–1,1 s przy wejściu | etykiety sekcji, linki menu (hover), przyciski | to samo | od razu | lekki | 2 |
| 14 | **Unoszenie się kart** | jjettas | `@keyframes` translateY ±6 px i rotate ±0,6°, 6,4 / 7,5 s, liniowo w pętli, różne fazy; tylko gdy karta w kadrze (`animation-play-state`) | `#soins` (2 karty zabiegów) | zostaje (tanie) | wyłączone | lekki | 2 |
| 15 | **Cele krążące wokół tytułu** | Orchid („Why Orchid”) | pin ok. 200 vh, tytuł manifestu na środku, 4 cele (`.cel`) jako szklane karty startują z różnych głębokości (`z`/`scale .7→1`, `y ±30vh`, `blur 6→0`) i mijają tytuł; scrub `.8` | `#approche` (`#objectifs`) | lista pionowa, zwykłe wejścia | lista bez ruchu | średni | 2 |
| 16 | **Linia przez kroki ze świecącą głowicą** | Orchid (How it works) | pionowa linia (SVG `stroke-dashoffset` albo `scaleY`) rysowana scrubem przez kroki wizyty; na końcu linii punkt z poświatą (różowe złoto, `filter: blur`), krok zapala się, gdy głowica go mija; kula w tle płynie z linią | `#visite` (`.kroki`), rozwija obecną `.duo-kreska` | zostaje (lekka) | linia pełna od razu | lekki | 1 |
| 17 | **Pas światła przed kontaktem** | Orchid | poziomy pas: rozmyty gradient różowe złoto → biel → przezroczystość, `mix-blend-mode: plus-lighter`, `scaleX .2 → 1` i `opacity` scrubem przy wejściu sekcji | granica `#faq` → `#contact` | zostaje | statyczny | lekki | 2 |
| 18 | **Zasłona menu jak kropla** | Lando | panel menu `clip-path: ellipse(120% 0% at 50% 0%)` → `ellipse(150% 150% at 50% 0%)`, 0,75 s `cubic-bezier(.65,.05,0,1)`; linki kolejno `ellipse(30% 0%)` → pełne, `stagger .05` | menu na telefonie / pasek | główne zastosowanie | bez animacji | lekki | 2 |
| 19 | **Podmiana obrazu pasem** | Lando (galeria kasków) | na hover karty zabiegu drugi kadr wjeżdża pasem od dołu: `clip-path: inset(100% 0 0 0)` → `inset(0)`, 0,75 s `editorial`; wymaga 2. wizualizacji na zabieg (z plakietką) | `#soins` karty | na dotyk nic (lub karuzela) | bez | lekki | 3 |
| 20 | **Stos zdjęć w pinie** | jjettas | 3–4 obrazy jak odbitki, każdy kolejny wjeżdża z obrotem ±4–8° na poprzedni, scrub; tekst pod spodem przygasa | `#monika` (zdjęcie Moniki + ilustracje marki), tylko gdy będą prawdziwe zdjęcia gabinetu | bez pinu, 1 obraz | 1 obraz | średni | 3 |
| 21 | **Liczby od zera** | Orchid | `easeOutQuart`, 1,6–2 s, IntersectionObserver raz; **nie dla cen** (cena jak „wygrana”), tylko dla numerów kroków/czasu zabiegu, jeśli w ogóle | `#visite` (01–04), ewentualnie czas zabiegu | zostaje | liczba od razu | lekki | 3 |

**Nie przenosimy**: podpis/bazgroł rysowany kreską (Lando, Rive) – Daniel usunął podpis Moniki; dźwięk WebAudio (jjettas);
przejścia stron Taxi.js (u nas jedna strona; rolę pełni kurtyna i płynny przejazd do kotwic); wachlarz kart social (brak treści);
kask 3D i tekst MSDF (brak sensu dla gabinetu, ciężkie).

### Top 10 na start (kolejność wdrożenia)
1. Tokeny ruchu (#1) i strojenie Lenisa (#2), lekkie, ustawiają rytm całej strony.
2. Okno logo w kurtynie (#3).
3. Hero kurczy się do ramki między rzędami napisu (#4).
4. Skośna kurtyna `#visite` → `#monika` (#8).
5. Linia przez kroki ze świecącą głowicą (#16).
6. Kursor-latarka (#5), wersja CSS-maska.
7. Unoszenie kart zabiegów (#14) i błysk w krysztale (#11).
8. Cele krążące wokół tytułu (#15).
9. Kropkowany nagłówek „Première visite” (#12).
10. Zasłona menu (#18) i pas światła przed kontaktem (#17).

Ciężkie WebGL (#6 płyn, #10 mapa głębi) dopiero po zatwierdzeniu lekkich: wymagają osobnej biblioteki (Three.js ok. 600 KB albo
OGL ok. 30 KB z CDN dozwolonego w CSP) i drugiej tekstury od Daniela.

---

## 5. Co się nie udało / ograniczenia pomiaru
- Wideo przewijania: Playwright potrzebuje ffmpeg (nie instalowałem), więc są tylko klatki PNG.
- Czasy animacji WebGL i krótszych niż 1 s nie dały się zmierzyć z klatek (zrzut z WebGL trwał 0,5–0,8 s); podane czasy są
  z kodu/CSS albo oznaczone jako niezweryfikowane.
- Menu jjettas nie otworzyło się (zły selektor przycisku); przejścia między podstronami nie testowane.
- Klatki do repo przenosiłem przez tekst base64 (`read_file` zwraca obraz tylko do podglądu); przy 5. pliku wkradły się błędy
  w przepisywaniu, więc zostały 4 sprawdzone klatki (MD5 zgodne z PC). Reszta klatek tylko na D: (ścieżki wyżej).
- Baner cookies Orchid zasłania lewy dół klatek (nie klikałem zgody).
