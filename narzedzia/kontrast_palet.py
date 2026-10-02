# -*- coding: utf-8 -*-
# Kontrast WCAG 2.x każdej pary tekst/tło w wariantach E, F, G (projekt/PALETY-2.md). Wymóg: 4,5:1.
# Dla teł z fakturą (marmur, trawertyn, len) liczone też do najciemniejszego piksela kafla (gorszy przypadek dla ciemnego tekstu).
# Uruchomienie z katalogu repo: python3 narzedzia/kontrast_palet.py
import os
import sys
import numpy as np
from PIL import Image

KAT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "img", "materialy")


def lum(h):
    c = np.array([int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]) / 255.
    c = np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)
    return float(c @ [.2126, .7152, .0722])


def kontrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + .05) / (lb + .05)


def najciemniej(plik):
    """Ciemny koniec faktury: 0,5 percentyl jasności (pojedyncze piksele żyłek pomijamy)."""
    a = np.asarray(Image.open(os.path.join(KAT, plik)).convert("RGB")).reshape(-1, 3)
    j = a @ [.2126, .7152, .0722]
    px = a[np.argsort(j)[int(len(j) * .005)]]
    return '#%02X%02X%02X' % tuple(px)


MARMUR_CIEMNO = najciemniej("carrara.webp")
TRAW_CIEMNO = najciemniej("trawertyn.webp")
LEN_CIEMNO = najciemniej("len.webp")

PALETY = {
    "E · Carrara & Champagne": [
        ("tekst #1D2023 na marmurze", "#1D2023", "#F5F3EF"),
        ("tekst na najciemniejszej żyłce", "#1D2023", MARMUR_CIEMNO),
        ("tekst drugi #55585C na marmurze", "#55585C", "#F5F3EF"),
        ("tekst drugi na najciemniejszej żyłce", "#55585C", MARMUR_CIEMNO),
        ("szampan tekstowy #6A5428 na marmurze", "#6A5428", "#F5F3EF"),
        ("szampan tekstowy na najciemniejszej żyłce", "#6A5428", MARMUR_CIEMNO),
        ("tekst na karcie #FFFFFF", "#1D2023", "#FFFFFF"),
        ("tekst drugi na karcie", "#55585C", "#FFFFFF"),
        ("tekst na porcelanie #FBFAF8", "#1D2023", "#FBFAF8"),
        ("tekst drugi na porcelanie", "#55585C", "#FBFAF8"),
        ("szampan tekstowy na porcelanie", "#6A5428", "#FBFAF8"),
        ("tekst na kamieniu #ECE7DF", "#1D2023", "#ECE7DF"),
        ("tekst drugi na kamieniu", "#55585C", "#ECE7DF"),
        ("szampan tekstowy na kamieniu", "#6A5428", "#ECE7DF"),
        ("napis przycisku #1D2023 na szampanie (ciemniejszy koniec gradientu #D6BF8F)", "#1D2023", "#D6BF8F"),
        ("pasek demo: tekst na #E9DFC9", "#1D2023", "#E9DFC9"),
    ],
    "F · Olivier & Travertin": [
        ("tekst #F2EBDD na oliwce #2B2F22", "#F2EBDD", "#2B2F22"),
        ("tekst drugi #BDB6A1 na oliwce", "#BDB6A1", "#2B2F22"),
        ("tekst na karcie #353A2A", "#F2EBDD", "#353A2A"),
        ("tekst drugi na karcie", "#BDB6A1", "#353A2A"),
        ("mosiądz #C2A468 jako tekst na oliwce (logo, liczby)", "#C2A468", "#2B2F22"),
        ("napis przycisku #20231A na mosiądzu (ciemniejszy koniec gradientu #B08F50)", "#20231A", "#B08F50"),
        ("tekst #272920 na trawertynie #EEE6D8", "#272920", "#EEE6D8"),
        ("tekst na najciemniejszej warstwie trawertynu", "#272920", TRAW_CIEMNO),
        ("tekst drugi #57564A na trawertynie", "#57564A", "#EEE6D8"),
        ("tekst drugi na najciemniejszej warstwie", "#57564A", TRAW_CIEMNO),
        ("brąz tekstowy #66562A na trawertynie", "#66562A", "#EEE6D8"),
        ("brąz tekstowy na najciemniejszej warstwie", "#66562A", TRAW_CIEMNO),
        ("tekst na karcie #E2D7C3", "#272920", "#E2D7C3"),
        ("tekst drugi na karcie", "#57564A", "#E2D7C3"),
        ("brąz tekstowy na karcie", "#66562A", "#E2D7C3"),
        ("pasek demo: tekst na #D9CDB4", "#272920", "#D9CDB4"),
    ],
    "G · Cap Bleu": [
        ("tekst #F6F0E4 na błękicie nocy #0E2C3A", "#F6F0E4", "#0E2C3A"),
        ("tekst drugi #A9BDC5 na błękicie nocy", "#A9BDC5", "#0E2C3A"),
        ("tekst na karcie #163A4B", "#F6F0E4", "#163A4B"),
        ("tekst drugi na karcie", "#A9BDC5", "#163A4B"),
        ("lazur #9CC6D8 („Body Lab”, kreski) na nocy", "#9CC6D8", "#0E2C3A"),
        ("napis przycisku #0E2C3A na kości słoniowej #F2EADA", "#0E2C3A", "#F2EADA"),
        ("tekst #13222B na lnie #F7F3EA", "#13222B", "#F7F3EA"),
        ("tekst na najciemniejszej nitce lnu", "#13222B", LEN_CIEMNO),
        ("tekst drugi #48585F na lnie", "#48585F", "#F7F3EA"),
        ("tekst drugi na najciemniejszej nitce", "#48585F", LEN_CIEMNO),
        ("błękit tekstowy #1B5470 na lnie", "#1B5470", "#F7F3EA"),
        ("błękit tekstowy na najciemniejszej nitce", "#1B5470", LEN_CIEMNO),
        ("tekst na piance morskiej #E2E9E8", "#13222B", "#E2E9E8"),
        ("tekst drugi na piance", "#48585F", "#E2E9E8"),
        ("błękit tekstowy na piance", "#1B5470", "#E2E9E8"),
        ("napis przycisku #F6F0E4 na błękicie #0E2C3A (jasne sekcje)", "#F6F0E4", "#0E2C3A"),
        ("pasek demo: tekst na #DCE7EA", "#13222B", "#DCE7EA"),
    ],
}

if __name__ == "__main__":
    zle = 0
    print(f"faktury, ciemny koniec: marmur {MARMUR_CIEMNO}, trawertyn {TRAW_CIEMNO}, len {LEN_CIEMNO}")
    for nazwa, pary in PALETY.items():
        print(f"\n{nazwa}")
        for opis, t, b in pary:
            k = kontrast(t, b)
            zle += k < 4.5
            print(f"  {k:5.2f}:1 {'OK ' if k >= 4.5 else 'ZA MAŁO'}  {opis}  ({t} / {b})")
    sys.exit(1 if zle else 0)
