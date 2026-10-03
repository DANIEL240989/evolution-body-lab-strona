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
- **Pierwszy ekran = render 3D z RTX Daniela** (03.10.2026): jak wzór Daniela: po lewej mozaika ciemnej turkusowo-niebieskiej żywicy w gęstych czarnych spękaniach (pod tekstem, przyciemnienie .72), po prawej kora czarna jak węgiel z kintsugi z różowego złota (`lupek_kora.py`, `img/materialy/kora-3d-*.webp`); wcześniej: łupek, niebieska żywica jak lawa, krawędzie
  w różowym złocie. Scena: `narzedzia/blender/lupek_scena.py` (Blender Cycles, bez AI), render na RTX 5080 przez
  `narzedzia/blender/render_rtx.ps1`; na stronie webp w `img/materialy/lupek-3d-*.webp`, z plakietką „Image de synthèse”.
  Desktop Commander na komputerze Daniela: `npx @wonderwhy-er/desktop-commander@latest remote` (w cmd, okno otwarte).
- Języki w kolejności: FR (domyślny), EN, ES, PL, RU, DE (`?lang=`). Monika mówi po francusku i polsku: tylko to piszemy
  jako języki obsługi, reszta to tłumaczenie oferty. Nigdy „6 langues”.
  Etap 1: FR kompletny do akceptacji; pozostałe języki tłumaczymy z francuskiego po akceptacji Moniki.
- Godziny: pon-pt 9:00-19:00, ostatnia wizyta 18:00, weekend zamknięte (porównanie gabinetów w Nicei w dokumencie).
- Zdjęcia: wizualizacje z RTX robione lokalnie u Daniela (ComfyUI), bez ludzi, każda z plakietką „Image de synthèse”.
  Nigdy jako „przed i po” ani jako realny gabinet. Po otwarciu: prawdziwe zdjęcia.

## Czego nie wolno
- Wymyślać opinii, certyfikatów, cen, wyników, liczby klientek. Przed/po i opinie tylko prawdziwe (puste = sekcja ukryta).
- Obietnic medycznych i gwarancji efektu („guérit”, „définitivement”, „résultats garantis”).
- Ankiety przeciwwskazań w formularzu online (dane o zdrowiu, art. 9 RODO): wypełniana w gabinecie.
- Publikować z danymi TEST.

## Sprawdzanie
`node --test`, potem przeglądarka: 375 px i desktop, wszystkie języki, zero błędów w konsoli.
