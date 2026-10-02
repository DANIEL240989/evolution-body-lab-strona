# Evolution Body Lab: trzy nowe kierunki kolorów (E, F, G) obok obecnego D

Podgląd: `index.html?w=e`, `?w=f`, `?w=g`. Bez parametru strona bez zmian (D · Noir Rosé). Przełącznik języka zachowuje `w`.
Porównanie na tych samych ekranach: `porownanie2-desktop.png` (1440×900: pierwszy ekran, Soins, Objectifs, FAQ) i `porownanie2-telefon.png` (375×812: pierwszy ekran, Soins, Première visite).
Faktury z kodu, bez AI: `narzedzia/materialy2.py` → `img/materialy/` (marmur 22 KB, trawertyn 14 KB, len 4 KB).
Kontrasty liczy `narzedzia/kontrast_palet.py` (WCAG 2.x, wymóg 4,5:1). Przy fakturach liczone też do ciemnego końca kafla (0,5 percentyla jasności): marmur `#D1CFCB`, trawertyn `#E8DDCC`, len `#EDEAE0`. Wszystkie pary przechodzą.

## E · Carrara & Champagne (`css/warianty/e.css`)
Jasny kierunek, jak lobby hotelu na Riwierze w dzień. Czerni nie ma wcale.
- Marmur Carrara (biel `#F5F3EF` z szarymi żyłkami) zamiast nocy: pierwszy ekran, Soins, Contact, stopka.
- Porcelana `#FBFAF8` (Objectifs, Visite, FAQ), kamień `#ECE7DF` (Monika, kafle celów), karty zabiegów białe `#FFFFFF` z miękkim cieniem.
- Tekst grafitowym atramentem `#1D2023`, drugi plan `#55585C`.
- Przycisk: satynowy szampan `#E8D8B2` › `#D6BF8F` z napisem `#1D2023` i cienką krawędzią. Szampan tekstowy `#6A5428`: etykiety, numery kroków, „Body Lab”.
- Nagłówki: Bodoni Moda (kontrastowy krój jak w magazynach mody, pasuje do marmuru i bieli; Cormorant na bieli wyglądał zbyt delikatnie).
- Kontrasty: tekst 14,8 (marmur), 10,5 (najciemniejsza żyłka), 16,4 (karta), 13,3 (kamień); drugi plan 6,5 / 4,6 / 7,2 / 5,8; szampan tekstowy 6,5 / 4,6 / 6,9 / 5,9; napis przycisku 9,1.

## F · Olivier & Travertin (`css/warianty/f.css`)
Śródziemnomorskie spa: oliwka, kamień, mosiądz.
- Noc: głęboka oliwka `#2B2F22`, karty `#353A2A`; tekst kremowy `#F2EBDD`, drugi plan `#BDB6A1`.
- Przycisk: szczotkowany mosiądz `#C6A96D` › `#B08F50` z napisem `#20231A`; mosiądz tekstowy `#C2A468` („Body Lab”, etykiety w kontakcie).
- Jasne sekcje: trawertyn rzymski `#EEE6D8` z poziomymi warstwami i porami, Monika na gładkim `#E2D7C3`; tekst `#272920`, drugi plan `#57564A`, brąz tekstowy `#66562A`.
- Nagłówki: Marcellus (litery jak kute w kamieniu, rzymskie, pasuje do trawertynu; jedna grubość, bez sztucznego pogrubienia).
- Kontrasty: tekst na oliwce 11,6, na karcie 9,9; drugi plan 6,8 / 5,8; mosiądz tekstowy 5,8; napis przycisku 5,2; tekst na trawertynie 11,9 (najciemniejsza warstwa 11,0); drugi plan 6,0 / 5,5; brąz 5,8 / 5,3; na karcie 10,4 / 5,2 / 5,0.

## G · Cap Bleu (`css/warianty/g.css`)
Riwiera wieczorem, jak stary hotel nad morzem: błękit, kość słoniowa, len. Bez złota.
- Noc: błękit morza `#0E2C3A` (zielonkawy, nie fioletowy granat), karty `#163A4B`; tekst kość słoniowa `#F6F0E4`, drugi plan `#A9BDC5`; lazur `#9CC6D8` tylko w „Body Lab”, kreskach i podkreśleniach.
- Przycisk na nocy: kość słoniowa `#F2EADA` z napisem `#0E2C3A`; w jasnych sekcjach odwrotnie (błękit z napisem w kości słoniowej).
- Jasne sekcje: len `#F7F3EA` (drobny splot), Monika na morskiej piance `#E2E9E8`; tekst `#13222B`, drugi plan `#48585F`, błękit tekstowy `#1B5470`.
- Nagłówki: zostaje Cormorant Garamond (klasyczny, dobrze leży na błękicie; tu porównujemy samą paletę).
- Kontrasty: tekst na nocy 12,9, na karcie 10,6; drugi plan 7,5 / 6,2; lazur 8,0; napis przycisku 12,2 (kość słoniowa) i 12,9 (błękit); tekst na lnie 14,7 (najciemniejsza nitka 13,5); drugi plan 6,7 / 6,2; błękit tekstowy 7,4 / 6,9; na piance 13,2 / 6,0 / 6,7.
- Od DASTAN odróżnia: inny odcień błękitu, brak złota i aksamitu, kość słoniowa zamiast czerni i złota.

## Rekomendacja
**E · Carrara & Champagne** jako najlepsza z trzech: jako jedyna naprawdę zmienia charakter strony (jasno, czysto, marmur i szampan, jak hotel 5* w Nicei w dzień) i najlepiej mówi „gabinet zabiegów”, a nie „bar wieczorem”.
Uczciwie: czy jest lepsza od D, zależy od tego, co Monika chce sprzedawać. D jest bardziej rozpoznawalny i kobiecy (noc, róż, folia), E bardziej „czysto i drogo”, mniej nastroju. G jest bardzo elegancki, ale to wciąż ciemna strona w innym kolorze, a ciemny błękit zbliża się do rodziny DASTAN. F wygląda spokojnie i naturalnie, ale ciemna oliwka na ekranie jest najcięższa i najbliżej „wojskowej” zieleni; nie polecam jej jako pierwszego wyboru.
Moja ocena: E dorównuje D i wygrywa na jasność i świeżość; żaden wariant nie jest wyraźnie lepszy od D pod każdym względem. Warto pokazać Monice D i E obok siebie.
