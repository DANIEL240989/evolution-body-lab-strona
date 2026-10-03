# Strona Evolution Body Lab (gabinet Moniki, Nicea 06)

Z Danielem po polsku, prosto. Pełny scenariusz strony: dokument „Evolution Body Lab: scenariusz strony”
(https://claude.ai/code/artifact/a418d150-ba1e-449d-8900-7b87936019df).

## Etap (02.10.2026)
Projekt do akceptacji Moniki. Lokal w Nicei szukany, firma na etapie biznesplanu, kredyt na lokal i sprzęt złożony.
Strona kompletna, ale TYLKO lokalnie: noindex + robots Disallow, rezerwacje wyłączone (`rezerwacjeOnline: false`).
Brakujące dane = dane TEST w jednym miejscu: `js/dane.js`. `npm run sprawdz-publikacje` blokuje wydanie, dopóki zostało TEST.

## Decyzje Daniela (nie zmieniać bez polecenia)
- Styl bazowy (pierwotnie **Noir Rosé**, zmienne na początku `css/style.css`): noc `#141113`, tekst `#F6ECE8`, pudrowy róż `#E8C9C1`, różowe złoto `#D4A49A` (przycisk z napisem noir),
  jasne `#F8EFEC`, karta `#EFDCD6`, tekst `#1E1A1C`, róż tekstowy `#8C4F58`. Cormorant Garamond + Manrope.
  Od 02.10.2026 wieczór (wybór Daniela z porównania D|E|F|G i jego zaznaczeń na zrzucie): **Cap Bleu + różowe złoto**.
  Tło nocy błękit Riwiery `#0E2C3A` (karty `#163A4B`), jasne sekcje len `#F7F3EA` (`img/materialy/len.webp`) i `#E2E9E8`.
  Napisy główne białe (kość słoniowa `#F6F0E4`), H1 biały. Różowe złoto `#D4A49A` tylko jako akcent: „Body Lab” w logo,
  etykiety sekcji, podkreślenie języka i menu, ramki, obwódki przycisków (też Appeler/WhatsApp na telefonie), główny
  przycisk (napis w błękicie). Na jasnym tle różowe złoto jako tekst `#8C4F58`. Wcześniejsze: czarny mat (D), welur,
  Carrara, oliwka odrzucone; porównania w `projekt/`. Blok na końcu `css/style.css`.
- **Od 03.10.2026: obrazy Daniela (jego generacje, „arcydzieło”)** zamiast renderów z kodu/Blendera:
  pierwszy ekran „fala”: czarny marmur z niebieskim kryształem i krawędziami w różowym złocie (`img/materialy/fala-pc.webp`
  komputer, `fala-tel.webp` telefon); `#soins` na granatowym marmurze z korą i kintsugi (`granat-kora-3.webp`),
  `#contact` na klifie z kryształem (`klif-lustro.webp`, przyciemnienie min. .76 pod danymi). Ciemne sekcje: czerń
  z granatem `#05070D` / `#0C1322` zamiast turkusu Cap Bleu; różowe złoto, białe napisy, len w jasnych sekcjach zostają.
  Każdy obraz z plakietką „Image de synthèse”. Sceny Blendera (`narzedzia/blender/`) i Desktop Commander zostają jako
  narzędzia; render na RTX 5080 Daniela przez `render_rtx.ps1`.
- Języki w kolejności: FR (domyślny), EN, ES, PL, RU, DE (`?lang=`). Monika mówi po francusku i polsku: tylko to piszemy
  jako języki obsługi, reszta to tłumaczenie oferty. Nigdy „6 langues”.
  Etap 1: FR kompletny do akceptacji; pozostałe języki tłumaczymy z francuskiego po akceptacji Moniki.
- Godziny: pon-pt 9:00-19:00, ostatnia wizyta 18:00, weekend zamknięte (porównanie gabinetów w Nicei w dokumencie).
- Zdjęcie Moniki (od Daniela 03.10.2026): `img/monika.webp`, prawdziwe, bez plakietki AI. Zgoda Moniki na wizerunek: potwierdzona przez Daniela 03.10.2026.
- Zdjęcia: wizualizacje z RTX robione lokalnie u Daniela (ComfyUI), bez ludzi, każda z plakietką „Image de synthèse”.
  Nigdy jako „przed i po” ani jako realny gabinet. Po otwarciu: prawdziwe zdjęcia.
- 03.10.2026 (Daniel: „jeżeli kolory nie są odpowiednie dla animacji, dawaj inne, ma być ultra”): kolory i przyciemnienia
  wolno zmieniać tam, gdzie wymaga tego ruch lub czytelność (min. 4,5:1 na najjaśniejszym miejscu obrazu pod tekstem),
  przy zachowaniu obecnej palety (czerń, złoto jako akcent, kość słoniowa); pierwsza zmiana: noc pod
  tekstem pierwszego ekranu na telefonie i wygaszenie marmuru `#soins` w `#05070D` przed „Première | visite”.

## Słowa Daniela z początku projektu (03.10.2026: „czemu olewasz moje słowa”) — obowiązują zawsze
- „landonorris.com robimy 1 do 1 bez pierdolenia”, „strona bilioner, zero lipy”: ten sam poziom co wzory (Lando, jjettas,
  Orchid), czyli WebGL (2,5D z głębi, płyn pod kursorem, dystorsje), nie same lekkie animacje CSS. 1 do 1 = układ, rytm,
  efekty; treść, obrazy, fonty i kod własne (prawa autorskie).
- „Zdjęcia lecą z RTX”, „czeka nas renderowanie sprzętu, ultra jakość na każdym polu”: obrazy sprzętu (EMS, kriolipoliza)
  i gabinetu renderowane lokalnie na RTX 5080 Daniela (ComfyUI, modele na D:), bez ludzi, z plakietką „Image de synthèse”.
- „Efekty typu wideo i 3D ultra premium”: pętle wideo i 3D są częścią strony, nie opcją na później.
- 03.10.2026: „nie pracuj na telefonie, tylko Windows teraz; jak potwierdzę, robimy mobila”. Najpierw desktop (1440, 1366);
  na ≤ 900 px nowe efekty wyłączone, strona ma się tylko nie psuć. Wersja telefonu dopiero po akceptacji Daniela.

## Czego nie wolno
- Wymyślać opinii, certyfikatów, cen, wyników, liczby klientek. Przed/po i opinie tylko prawdziwe (puste = sekcja ukryta).
- Obietnic medycznych i gwarancji efektu („guérit”, „définitivement”, „résultats garantis”).
- Ankiety przeciwwskazań w formularzu online (dane o zdrowiu, art. 9 RODO): wypełniana w gabinecie.
- Publikować z danymi TEST.

## Sprawdzanie
`node --test`, potem przeglądarka: 375 px i desktop, wszystkie języki, zero błędów w konsoli.

## Zabiegi a prawo (skarbnik 03.10.2026)
Oferta jak w biznesplanie Moniki (Daniel 03.10.2026: „trzymamy się tego, co w biznesplanie”): tylko EMS i kriolipoliza.
Kriolipoliza we Francji to w praktyce akt lekarski (Cass. crim. 31.01.2023): na stronie oznaczona TEST w `js/dane.js`,
więc `sprawdz-publikacje` blokuje wydanie do potwierdzenia przez prawnika i ubezpieczyciela.
Bez słów „massage” i „drainage lymphatique manuel”: „soin drainant”, „palper-rouler mécanique”. Radiofrekwencja tylko jako
raffermissement/remodelage. Ceny na stronie z biznesplanu Moniki (EMS 100 €, kriolipoliza 180/350/500 €). Ceny konkurencji w Nicei: `projekt/CENY_NICEA.md`.
Biznesplanu (PDF, dane finansowe) nie wrzucamy do repo.

## Logo i kolory (Daniel 03.10.2026)
Od 03.10.2026 (Daniel: „mamy zgodę, zamiana logo na to”): LOGO = narysowana Monika w złotej obręczy z czerwoną różą,
wariant z czarnym kołem (Daniel: „środkowy”; źródło `projekt/ilustracje/monika-medalion-2.webp`, przezroczyste) + napis z fasady, pod tymi samymi nazwami plików
(`img/logo-dama-zlota*.webp`, `img/ikona-64.png`). ZGODA MONIKI NA WIZERUNEK: potwierdzona przez Daniela 03.10.2026
(zdjęcie `img/monika.webp`, rysunek `img/monika-rys.webp`, medalion-logo). Poprzednio (03.10 noc, „tą chcę”): dama w czarno-złotym kapeluszu z czerwoną różą w obręczy, jasne tło koła jak
w oryginale (tylko mgiełka poza obręczą usunięta; źródło `projekt/ilustracje/dama-roza-kapelusz-logo.webp`) + napis EVOLUTION / BODY LAB z fasady
(pliki pod tymi samymi nazwami co wersja ze złotym kapeluszem):
`img/logo-dama-zlota-poziom.webp` (pasek), `img/logo-dama-zlota.webp` (stopka, kurtyna), `img/ikona-64.png`.
Poprzednio (03.10 wieczór, „spoko pod 4”): złota postać z koroną, `img/logo-krolowa*`. Damy z różą/kapeluszem to ilustracje marki, nie logo
(`projekt/ilustracje/`). Wcześniejsze: dama w kapeluszu (`img/logo-dama*`), E z fasady (`img/logo-e*`), królowa (`img/logo.webp`). Nie przerysowywać. Kolory: czerń, biel, złoto 24K tylko na pełnych przyciskach i numerach, różowe złoto na obrysach
i kreskach (`css/paleta.css`, ostatni arkusz). Zero „musztardowego” (złoto szampańskie odrzucone).

Podpis „Monika” (SVG kreską) usunięty ze strony 03.10.2026 (Daniel: „nie jest super”). Nie przywracać.
