# Łupek z żywicą (próbka, 02.10.2026)

## Co zrobione
- `narzedzia/lupek.py`: materiał liczony kodem (numpy + Pillow, bez AI). Pola szumu rozmywane przez FFT jak w `welur.py`.
  Płyty łupka (komórki Voronoja wydłużone po skosie, poszarpane brzegi, każda płyta lekko inaczej nachylona i ciemna),
  chmury marmuru, delikatny kierunkowy rysunek kory, szczeliny z głęboko niebieską żywicą, różowe złoto na krawędziach
  i we włoskowatych rysach. Głębia: mapa wysokości, normalne, światło z lewej góry, połysk żywicy i menisk przy ściankach.
- `img/materialy/lupek-pc.webp` 2400×1350, 111 KB (komputer) i `lupek-tel.webp` 1080×2200, 32 KB (telefon).
  Złoto po prawej i przy krawędziach; lewa strona (nagłówek, tekst) ciemna i spokojna. Na telefonie złoto tylko
  w górnej części, wokół karty z obrazem.
- Podgląd: `projekt/probka-lupek.css` (tylko do zrzutu), zrzuty `probka-lupek-pc.png`, `probka-lupek-tel.png`,
  wycinek 1:1 `lupek-zblizenie.png`. Strony (`index.html`, `css/style.css`, `js/`) bez zmian.

## Kolory
Łupek #05080E / #0A0F18, granat #132746, szaroniebieski marmur #2C4A72 i #7189A8, żywica #010616 / #082660 / #174CA6,
różowe złoto #D4A49A z cieniem #94594C i blikiem #FFE6DA. Ciemne sekcje w próbce: #0B1018, karty #121A26.

## Kontrast (policzony skryptem, obszar tekstu)
- Komputer, lewa połowa: najjaśniejsze miejsce tła #0E1829. Biel #F6F0E4 15,6:1, różowe złoto #D4A49A 8,1:1.
  Na pojedynczym najjaśniejszym pikselu: 14,9:1 i 7,7:1.
- Telefon, pod kartą: najjaśniejsze miejsce #0E192B. Biel 15,5:1, różowe złoto 8,0:1.

## Co dałby prawdziwy render 3D (Blender Cycles na RTX Daniela)
- Prawdziwe załamanie i rozproszenie światła w żywicy (głębia, pęcherzyki, smugi barwnika), czego kod tylko udaje.
- Złoto z fizycznym materiałem metalu: odbicia otoczenia i miękkie bliki zależne od kształtu krawędzi.
- Ułamany kamień z przemieszczeniem (displacement): realne odpryski i cienie zamiast nachylenia płyt policzonego w 2D.
- Oświetlenie studyjne (HDRI, softboxy), które spina całość w jeden obiekt, i łatwe warianty kadru pod komputer i telefon.
- Możliwość krótkiej pętli wideo (przesuwające się światło po połysku), jeśli Daniel zechce ruch.
