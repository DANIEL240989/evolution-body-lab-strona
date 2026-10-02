# Strona Evolution Body Lab (gabinet Moniki, Nicea 06)

Z Danielem po polsku, prosto. Pełny scenariusz strony: dokument „Evolution Body Lab: scenariusz strony”
(https://claude.ai/code/artifact/a418d150-ba1e-449d-8900-7b87936019df).

## Etap (02.10.2026)
Projekt do akceptacji Moniki. Lokal w Nicei szukany, firma na etapie biznesplanu, kredyt na lokal i sprzęt złożony.
Strona kompletna, ale TYLKO lokalnie: noindex + robots Disallow, rezerwacje wyłączone (`rezerwacjeOnline: false`).
Brakujące dane = dane TEST w jednym miejscu: `js/dane.js`. `npm run sprawdz-publikacje` blokuje wydanie, dopóki zostało TEST.

## Decyzje Daniela (nie zmieniać bez polecenia)
- Styl **Noir Rosé**: noc `#141113`, tekst `#F6ECE8`, pudrowy róż `#E8C9C1`, różowe złoto `#D4A49A` (przycisk z napisem noir),
  jasne `#F8EFEC`, karta `#EFDCD6`, tekst `#1E1A1C`, róż tekstowy `#8C4F58`. Cormorant Garamond + Manrope.
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
