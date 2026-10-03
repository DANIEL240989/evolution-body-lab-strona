"""Tymczasowa mapa głębi do 2,5D pierwszego ekranu (js/gl.js), liczona w chmurze bez sieci neuronowej.

Docelowe mapy przyjdą z RTX Daniela (Depth Anything w ComfyUI) na gałąź `rtx-glebia` pod TYMI SAMYMI ścieżkami:
img/glebia/fala-pc-glebia.webp i img/glebia/fala-tel-glebia.webp. Ten skrypt tylko daje kodowi coś sensownego do czasu
podmiany. Konwencja: jasne = blisko kamery, ciemne = daleko (jak Depth Anything „relative depth”), skala szarości,
połowa szerokości oryginału, mocno wygładzona (bez schodów na krawędziach, bo shader przesuwa piksele wg głębi).

Heurystyka (obrazy „fala”: rzeźba z marmuru i kryształu na czarnym tle, lustrzana posadzka u dołu):
- tło (prawie czarne) daleko, z łagodnym spadkiem ku górze, żeby izolinie w śladzie płynu nie były płaskie;
- bryła = gęstość jasnych pikseli po dużym rozmyciu (gruba forma), plus drobna luminancja (grzbiety, krawędzie bliżej);
- posadzka: od linii horyzontu w dół coraz bliżej.
Uruchomienie: python3 narzedzia/glebia_tymczasowa.py
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

KORZEN = Path(__file__).resolve().parent.parent
PARY = [('img/materialy/fala-pc.webp', 'img/glebia/fala-pc-glebia.webp', .80),
        ('img/materialy/fala-tel.webp', 'img/glebia/fala-tel-glebia.webp', .62)]


def rozmyj(a, r):
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


def glebia(zrodlo, horyzont):
    im = Image.open(KORZEN / zrodlo).convert('RGB')
    w, h = im.size
    im = im.resize((w // 2, h // 2), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255
    lum = a @ np.array([.299, .587, .114], dtype=np.float32)
    s = max(im.size) / 768                       # promienie w skali obrazu
    bryla = rozmyj((lum > .07).astype(np.float32), 34 * s)
    bryla = np.clip((bryla - .08) / .6, 0, 1) ** .8
    grzbiet = rozmyj(np.clip(lum * 2.2, 0, 1), 7 * s)
    yy = np.linspace(0, 1, lum.shape[0], dtype=np.float32)[:, None] * np.ones_like(lum)
    tlo = .08 + .10 * yy                         # tło: daleko, dół ciut bliżej
    posadzka = np.clip((yy - horyzont) / (1 - horyzont), 0, 1) ** 1.2
    d = tlo + .55 * bryla + .22 * grzbiet * bryla
    d = np.maximum(d, .18 + .62 * posadzka)      # lustrzana posadzka rośnie ku kamerze
    d = rozmyj(np.clip(d, 0, 1), 5 * s)
    d = (d - d.min()) / max(1e-6, d.max() - d.min())
    return Image.fromarray((d * 255).astype(np.uint8), 'L')


if __name__ == '__main__':
    for z, cel, hor in PARY:
        g = glebia(z, hor)
        (KORZEN / cel).parent.mkdir(parents=True, exist_ok=True)
        g.save(KORZEN / cel, 'WEBP', quality=88, method=6)
        print(cel, g.size, (KORZEN / cel).stat().st_size, 'B')
