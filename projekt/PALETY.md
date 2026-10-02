# Evolution Body Lab: trzy warianty „czarny mat z różowym złotem, welurowe efekty”

Podgląd: `index.html?w=a`, `?w=b`, `?w=c` (bez parametru strona wygląda jak dotąd).
Porównanie na tych samych ekranach: `porownanie-desktop.png` (1440×900 i zbliżenie karty) i `porownanie-telefon.png` (375×812).
Wspólne dla wszystkich: tekst nocy `#F6ECE8`, szary nocy `#A79A9C`, różowe złoto `#D4A49A`, jasne sekcje `#F8EFEC` i `#EFDCD6` gładkie, bez zmian.

## A. Czarny mat (`css/warianty/a.css`)
- Noc gładka `#141113`, karty zabiegów `#1A1618` z neutralnym obrysem (biel 9%), złoto na obrysie dopiero po najechaniu.
- Różowe złoto tylko: główny przycisk, cienkie linie (kreska etykiet, nić pod nagłówkiem, obrys przycisku „ramka”), „Body Lab” w logo.
- Zdjęte ze złota: tło aktywnego języka (teraz cienkie podkreślenie), etykiety w kontakcie, napis uwagi (szary nocy).
- Nagłówek pełny mat zamiast szkła.

## B. Czarny welur (`css/warianty/b.css`, zawiera A)
- Welur na: nagłówku, pierwszym ekranie, #soins, #contact, stopce i dolnym pasku na telefonie.
- Tkanina z kodu (`narzedzia/welur.py`, bez AI): krótkie gęste runo i miękkie wydłużone fałdy połysku w ciepłym, lekko śliwkowym tonie (światło `#D298A6`, cień ciepła czerń). Na tle `#141113` jasność waha się od `#0A0608` do `#2C2326`.
- Dwa kafle: `img/welur/welur-runo.webp` (128 px) i `welur-polysk.webp` (1536 px, na telefonie 960 px), razem 141 KB.
- Karty zabiegów zostają gładkim matem, leżą na welurze jak przedmiot na tkaninie.
- Różni się od aksamitu DASTAN: tam granat, chłodna kość słoniowa, długi włos i splot; tu ciepła śliwka, krótkie runo, bez splotu, bardziej matowo.

## C. Welur i folia (`css/warianty/c.css`, zawiera B)
- H1 i „Body Lab” w logo w delikatnej folii z różowego złota (gradient tekstu `#EAC4B8` › `#F4DAD0` › `#DDB0A4` › `#C99384` › `#E9C3B7` › `#F1D3C9`).
- Najciemniejszy ton folii `#C99384`: 5,8:1 do najjaśniejszego miejsca weluru, 7,1:1 do `#141113` (wymagane 4,5:1).
- W trybie wysokiego kontrastu i w druku folia wraca do zwykłego koloru.

## Rekomendacja
**B (czarny welur).** Daje to, o co prosił Daniel (czuć tkaninę i ciepło), a złoto zostaje tylko na przycisku i liniach, więc przycisk „Prendre rendez-vous” jest jedynym błyszczącym punktem ekranu. Folię z C warto trzymać w odwodzie dla samego logo, jeśli Monika zechce więcej blasku.
