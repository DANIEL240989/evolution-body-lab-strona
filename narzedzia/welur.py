# -*- coding: utf-8 -*-
# Welur na nocy Noir Rosé (Daniel 02.10.2026: „czarny mat z różowym złotem, welurowe efekty”). Proceduralnie, bez AI.
# Wzór techniki: aksamit DASTAN (narzedzia/aksamit.py w repo dastan-btp): kafle bezszwowe przez FFT, nakładki RGBA
# na kolor tła. Welur różni się od tamtego aksamitu:
#   - runo krótsze i gęstsze: ziarno ok. 1 px, bez płóciennego podkładu, bez pojedynczych długich włosków;
#   - połysk z „przeczesania”: obszary, w których runo leży w różnych kierunkach (pole kierunków, smugi pod 4 kątami),
#     miękkie przejścia, mniejszy kontrast niż aksamit (welur jest bardziej matowy);
#   - ciepły podton: światło różowo-śliwkowe zamiast kości słoniowej, cień w ciepłą czerń.
# Nakładki (baza nominalna #141113):
#   welur-polysk.webp 768×768 → 1536 px CSS (szerzej niż ekran 1440, powtórzeń nie widać) (plamy są gładkie, powiększenie nie szkodzi, plik mały)
#   welur-runo.webp   256×256 → 128 px CSS (gęstość 2×, ostre na ekranach retina)
# Uruchomienie z katalogu repo: python3 narzedzia/welur.py
import os
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "img", "welur")
SWIATLO = np.array([210, 152, 166]) / 255.   # róż ze śliwką (połysk runa)
CIEN = np.array([8, 4, 7]) / 255.            # ciepła czerń
B0 = np.array([20, 17, 19]) / 255.           # #141113


def norm(a):
    a = a - a.mean()
    return a / (a.std() + 1e-9)


def czestosci(M):
    return np.fft.fftfreq(M)[:, None], np.fft.fftfreq(M)[None, :]


def blur_kat(a, s_wzdluz, s_poprzek, kat):
    """Gauss anizotropowy pod kątem (stopnie), okresowy (FFT), więc kafel bez szwów."""
    fy, fx = czestosci(a.shape[0])
    t = np.deg2rad(kat)
    u = fx * np.cos(t) + fy * np.sin(t)
    v = -fx * np.sin(t) + fy * np.cos(t)
    H = np.exp(-2 * np.pi ** 2 * ((s_wzdluz * u) ** 2 + (s_poprzek * v) ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * H))


def nakladka(m, A):
    """m: mapa (średnia 0). Jaśniej = światło różowo-śliwkowe, ciemniej = ciepła czerń; alfa dobrana tak,
    żeby na tle #141113 jasność zmieniała się o czynnik f = 1 + A*m."""
    f = 1 + A * np.clip(m, -2.6, 2.6)
    b = B0.mean()
    a_j = np.clip(b * (f - 1) / (SWIATLO.mean() - b), 0, 1)
    a_c = np.clip(b * (1 - f) / (b - CIEN.mean()), 0, 1)
    jas = f >= 1
    rgba = np.zeros(m.shape + (4,))
    rgba[..., :3] = np.where(jas[..., None], SWIATLO[None, None, :], CIEN[None, None, :])
    rgba[..., 3] = np.where(jas, a_j, a_c)
    return (rgba * 255 + .5).clip(0, 255).astype(np.uint8)


def polysk(N=768, ziarno=60602):
    """Plamy połysku przeczesanego weluru (skala: 1 px = 2 px CSS)."""
    rng = np.random.default_rng(ziarno)
    g = lambda: rng.standard_normal((N, N))
    # pole kierunków runa: 4 kierunki, wagi z wolnego szumu (miękkie „łaty” przeczesania)
    katy = (18, 63, 108, 153)
    wagi = np.stack([np.exp(2.2 * norm(blur_kat(g(), 70, 70, 0))) for _ in katy])
    wagi /= wagi.sum(0)
    smugi = sum(w * norm(blur_kat(g(), 14, 3.2, k)) for w, k in zip(wagi, katy))
    # łagodne fale światła (jak tkanina leżąca nierówno) + średnie plamy
    duze = norm(blur_kat(g(), 85, 85, 0))
    srednie = norm(blur_kat(g(), 18, 24, 40))
    m = 1.0 * duze + .5 * srednie + .07 * norm(smugi)
    m = np.tanh(.9 * norm(m))           # miękkie nasycenie: połysk w łatach, bez ostrych krawędzi
    m = norm(m)
    return np.where(m > 0, 1.35 * m, .6 * m)   # połysk wyraźniejszy niż cień (welur: ciemny z jasnymi łatami)


def runo(N=256, ziarno=60603):
    """Krótkie, gęste runo: ziarno ~1 px CSS + delikatne mikrosmugi; bez splotu."""
    rng = np.random.default_rng(ziarno)
    g = lambda: rng.standard_normal((N, N))
    m = (1.0 * norm(blur_kat(g(), .9, .9, 0))
         + .35 * norm(blur_kat(g(), 3.5, .8, 70))
         + .25 * norm(blur_kat(g(), 6, 6, 0)))
    return norm(m)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    razem = 0
    for nazwa, m, A in (("welur-polysk.webp", polysk(), .42), ("welur-runo.webp", runo(), .07)):
        p = os.path.join(OUT, nazwa)
        Image.fromarray(nakladka(m, A), "RGBA").save(p, "WEBP", lossless=True, method=6)
        kb = os.path.getsize(p) / 1024
        razem += kb
        print(f"{nazwa} {kb:.0f} KB")
    print(f"razem {razem:.0f} KB")
