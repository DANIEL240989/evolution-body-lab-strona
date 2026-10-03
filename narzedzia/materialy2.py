# -*- coding: utf-8 -*-
# Materiały do wariantów E, F, G (projekt/PALETY-2.md). Proceduralnie z kodu (numpy + Pillow), bez AI.
# Technika jak w narzedzia/welur.py: szum filtrowany przez FFT, więc każdy kafel łączy się bez szwów.
#   carrara.webp   1200 px  marmur Carrara: białe tło, szare żyłki (wariant E, ciemne sekcje zamienione na marmur)
#   trawertyn.webp  900 px  trawertyn rzymski: poziome warstwy i drobne pory (wariant F, jasne sekcje)
#   len.webp        256 px  lniane płótno hotelowe, pokazywane w 128 px CSS (wariant G, jasne sekcje)
# Uruchomienie z katalogu repo: python3 narzedzia/materialy2.py
import os
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "img", "materialy")


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)]) / 255.


def norm(a):
    a = a - a.mean()
    return a / (a.std() + 1e-9)


def blur(a, sx, sy):
    """Gauss okresowy (FFT), sx wzdłuż osi x, sy wzdłuż y."""
    fy = np.fft.fftfreq(a.shape[0])[:, None]
    fx = np.fft.fftfreq(a.shape[1])[None, :]
    H = np.exp(-2 * np.pi ** 2 * ((sx * fx) ** 2 + (sy * fy) ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * H))


def mieszaj(baza, kolor, a):
    return baza[None, None, :] * (1 - a[..., None]) + kolor[None, None, :] * a[..., None]


def zapisz(rgb, nazwa, q=82):
    p = os.path.join(OUT, nazwa)
    Image.fromarray((rgb.clip(0, 1) * 255 + .5).astype(np.uint8), "RGB").save(p, "WEBP", quality=q, method=6)
    return p


def blur_kat(a, s1, s2, kat):
    """Gauss anizotropowy pod kątem (stopnie), okresowy."""
    fy = np.fft.fftfreq(a.shape[0])[:, None]
    fx = np.fft.fftfreq(a.shape[1])[None, :]
    t = np.deg2rad(kat)
    u = fx * np.cos(t) + fy * np.sin(t)
    v = -fx * np.sin(t) + fy * np.cos(t)
    return np.real(np.fft.ifft2(np.fft.fft2(a) * np.exp(-2 * np.pi ** 2 * ((s1 * u) ** 2 + (s2 * v) ** 2))))


def carrara(N=1200, ziarno=31):
    """Żyłki = miejsca zerowe szumu fraktalnego wydłużonego po skosie (jak warstwy w kamieniu),
    rdzeń ostry + miękka poświata, część żyłek gaśnie. Tło białe z delikatnymi szarymi chmurami."""
    rng = np.random.default_rng(ziarno)
    g = lambda: rng.standard_normal((N, N))
    K = -38
    n = norm(norm(blur_kat(g(), 220, 60, K)) + .45 * norm(blur_kat(g(), 70, 22, K))
             + .12 * norm(blur_kat(g(), 18, 8, K)) + .04 * norm(blur(g(), 3, 3)))
    w = .05 * (1 + .6 * np.clip(norm(blur(g(), 150, 150)), -1, 1.5))
    rdzen = np.exp(-(n / w) ** 2)
    halo = blur(rdzen, 14, 14)
    halo /= halo.max()
    m2 = norm(norm(blur_kat(g(), 160, 40, K + 25)) + .5 * norm(blur_kat(g(), 40, 10, K + 25)) + .1 * norm(blur(g(), 5, 5)))
    cienkie = np.exp(-(m2 / .018) ** 2)
    zanik = np.clip(.5 + .5 * norm(blur(g(), 180, 180)), 0, 1)
    zanik2 = np.clip(.2 + .5 * norm(blur(g(), 140, 140)), 0, 1)
    zyly = np.clip(.40 * rdzen * zanik + .30 * halo * zanik + .22 * cienkie * zanik2, 0, .62)
    chmury = norm(blur(g(), 180, 180)) * .6 + norm(blur_kat(g(), 90, 30, K)) * .4
    baza = mieszaj(hexrgb('#F6F4F0'), hexrgb('#E3DFD8'), np.clip(.3 + .22 * chmury, 0, 1) * .6)
    rgb = baza * (1 - zyly[..., None]) + hexrgb('#85878A')[None, None, :] * zyly[..., None]
    return rgb * (1 + .006 * norm(blur(g(), .8, .8)))[..., None]


def trawertyn(N=900, ziarno=47):
    rng = np.random.default_rng(ziarno)
    g = lambda: rng.standard_normal((N, N))
    warstwy = norm(blur(g(), 260, 7)) + .5 * norm(blur(g(), 90, 2.5))
    pory = norm(blur(g(), 7, 1.4))
    pory = np.clip((pory - 2.3) / .8, 0, 1) * np.clip(.5 + .5 * norm(blur(g(), 60, 20)), 0, 1)
    pory = blur(pory, .7, .5)
    rgb = mieszaj(hexrgb('#EEE6D8'), hexrgb('#F4EEE3'), np.clip(warstwy * .13, 0, 1))
    rgb = rgb * (1 - np.clip(-warstwy * .13, 0, 1)[..., None]) + hexrgb('#DDD0B9')[None, None, :] * np.clip(-warstwy * .13, 0, 1)[..., None]
    rgb = rgb * (1 - .55 * pory[..., None]) + hexrgb('#B9A685')[None, None, :] * (.55 * pory[..., None])
    return rgb * (1 + .008 * norm(blur(g(), .7, .7)))[..., None]


def len_(N=256, ziarno=5):
    rng = np.random.default_rng(ziarno)
    y, x = np.mgrid[0:N, 0:N]
    okres = 4  # 4 px pliku = 2 px CSS na nitkę
    slub_x = norm(blur(rng.standard_normal((N, N)), 30, .6))  # zgrubienia wzdłuż nitek poziomych
    slub_y = norm(blur(rng.standard_normal((N, N)), .6, 30))
    watek = np.cos(2 * np.pi * y / okres) * (1 + .35 * slub_x)
    osnowa = np.cos(2 * np.pi * x / okres) * (1 + .35 * slub_y)
    splot = np.where(((x // okres + y // okres) % 2) == 0, watek, osnowa)
    m = norm(.7 * splot + .3 * norm(blur(rng.standard_normal((N, N)), 1, 1)))
    baza = hexrgb('#F7F3EA')
    return baza[None, None, :] * (1 + .018 * m)[..., None]


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for f, n in ((carrara, "carrara.webp"), (trawertyn, "trawertyn.webp"), (len_, "len.webp")):
        p = zapisz(f(), n)
        a = np.asarray(Image.open(p).convert("RGB")) / 255.
        print(f"{n} {os.path.getsize(p) / 1024:.0f} KB, najciemniej {a.min(axis=(0, 1)).round(3)}, średnio {a.mean(axis=(0, 1)).round(3)}")
