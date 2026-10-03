"""Wycina osobę ze zdjęcia na przezroczyste tło (BiRefNet na GPU RTX).

Użycie (Monika, 03.10.2026):
  python wytnij_rtx.py ZRODLO.jpg KATALOG_WYNIKU --latka 856,924,955 [--repo KATALOG_REPO]

Kroki:
 1. Obcina czarne pasy (zrzut z WhatsAppa ma je u góry i u dołu).
 2. BiRefNet (licencja MIT, ZhengPeng7/BiRefNet) liczy maskę w 1024x1024
    (+ odbicie lustrzane, średnia = stabilniejsza krawędź włosów).
 3. Maska w pełnej rozdzielczości wygładzona filtrem prowadzonym (guided filter) po obrazie.
 4. Alfa z koloru na krawędzi ciemne włosy / jasna ściana: znane lokalne tło B i lokalny kolor
    włosów F, alfa = rzut (I - B) na (F - B). Usuwa jasną obwódkę, której sieć nie widzi.
    Tylko tam, gdzie tło jest wyraźnie jaśniejsze od pierwszego planu (biała bluzka na białej
    ścianie zostaje z maski sieci).
 5. --latka y0,y1,x0: wiersze y0..y1 od kolumny x0 w prawo dostają alfę interpolowaną między
    wierszem y0 i y1 (usuwa fioletowy przedmiot z tła przyklejony do włosów).
 6. Dekontaminacja koloru krawędzi (pymatting estimate_foreground_ml): czysty kolor włosów
    zamiast mieszanki z białą ścianą.
 7. Zapis: PNG RGBA (pełny), WebP z alfą q90 (pełny i dłuższy bok 900), podglądy JPG na czarnym,
    granatowym #0A1226 i białym tle + zbliżenia krawędzi.
"""
import argparse, os
import numpy as np
import torch
from PIL import Image
import cv2


def obetnij_pasy(img: np.ndarray, prog=14):
    szary = img.mean(axis=2)
    wiersze = szary.mean(axis=1)
    kolumny = szary.mean(axis=0)
    g = 0
    while g < len(wiersze) - 1 and wiersze[g] < prog: g += 1
    d = len(wiersze)
    while d > g + 1 and wiersze[d - 1] < prog: d -= 1
    l = 0
    while l < len(kolumny) - 1 and kolumny[l] < prog: l += 1
    p = len(kolumny)
    while p > l + 1 and kolumny[p - 1] < prog: p -= 1
    # 2 px zapasu (antyaliasing paska)
    g, d = (g + 2 if g else 0), (d - 2 if d < len(wiersze) else d)
    l, p = (l + 2 if l else 0), (p - 2 if p < len(kolumny) else p)
    return img[g:d, l:p], (g, d, l, p)


def maska_birefnet(img: np.ndarray, model_id: str, rozm=1024):
    from transformers import AutoModelForImageSegmentation
    model = AutoModelForImageSegmentation.from_pretrained(model_id, trust_remote_code=True)
    dev = 'cuda' if torch.cuda.is_available() else 'cpu'
    model.to(dev).eval()
    if dev == 'cuda':
        model.half()
    x = cv2.resize(img, (rozm, rozm), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
    t = torch.from_numpy(x.transpose(2, 0, 1))[None]
    t = torch.cat([t, torch.flip(t, dims=[3])], 0).to(dev)
    if dev == 'cuda':
        t = t.half()
    with torch.no_grad():
        wy = model(t)[-1].sigmoid().float().cpu()
    m = (wy[0, 0] + torch.flip(wy[1, 0], dims=[1])) / 2
    del model
    torch.cuda.empty_cache()
    h, w = img.shape[:2]
    return cv2.resize(m.numpy(), (w, h), interpolation=cv2.INTER_CUBIC).clip(0, 1)


def box(a, r):
    return cv2.boxFilter(a, -1, (2 * r + 1, 2 * r + 1), normalize=True, borderType=cv2.BORDER_REFLECT)


def guided_filter(I: np.ndarray, p: np.ndarray, r: int, eps: float):
    """Filtr prowadzony (He i in.) z obrazem kolorowym jako przewodnikiem. I w [0,1]."""
    mI = box(I, r)
    mp = box(p, r)
    cov_Ip = box(I * p[..., None], r) - mI * mp[..., None]
    var = np.empty(I.shape[:2] + (3, 3), np.float32)
    for i in range(3):
        for j in range(3):
            var[..., i, j] = box(np.ascontiguousarray(I[..., i] * I[..., j]), r) - mI[..., i] * mI[..., j]
    var += eps * np.eye(3, dtype=np.float32)
    a = np.linalg.solve(var, cov_Ip[..., None])[..., 0]
    b = mp - (a * mI).sum(axis=2)
    return ((box(a, r) * I).sum(axis=2) + box(b, r)).clip(0, 1)


def wypelnij(I, maska, sigma):
    """Kolor z pikseli maski rozlany na sąsiedztwo (splot znormalizowany, dwie skale)."""
    m = maska.astype(np.float32)
    wynik = None
    for s in (sigma, sigma * 4):
        num = cv2.GaussianBlur(I * m[..., None], (0, 0), s)
        den = cv2.GaussianBlur(m, (0, 0), s)[..., None]
        est = num / np.maximum(den, 1e-6)
        if wynik is None:
            wynik, waga = est, np.clip(den / 0.05, 0, 1)
        else:
            wynik = wynik * waga + est * (1 - waga)
    return wynik


def alfa_z_koloru(I, m, pas):
    pewne_tlo = cv2.erode((m < 0.02).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    pewna_os = cv2.erode((m > 0.98).astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    B = wypelnij(I, pewne_tlo, 12)
    F = wypelnij(I, pewna_os, 5)
    d = B - F
    dd = (d * d).sum(axis=2)
    a = ((B - I) * d).sum(axis=2) / np.maximum(dd, 1e-6)
    a = np.clip(a, 0, 1)
    # Tylko tam, gdzie tło wyraźnie jaśniejsze od pierwszego planu (ciemne włosy na jasnej ścianie)
    Y = np.array([0.299, 0.587, 0.114], np.float32)
    kontrast = ((B - F) @ Y)
    ufnosc = np.clip((kontrast - 0.20) / 0.15, 0, 1) * pas
    ufnosc = cv2.GaussianBlur(ufnosc.astype(np.float32), (0, 0), 2)
    return a, ufnosc


def dopracuj_maske(img, m, r, eps, kolor=False, gamma=1.0):
    I = img.astype(np.float32) / 255.0
    g = guided_filter(I, m.astype(np.float32), r, eps)
    niepewne = ((m > 0.02) & (m < 0.98)).astype(np.uint8)
    pas = cv2.dilate(niepewne, np.ones((9, 9), np.uint8)).astype(np.float32)
    pas = cv2.GaussianBlur(pas, (0, 0), 1.5)
    alfa = m * (1 - pas) + g * pas
    if kolor:
        a_kol, ufn = alfa_z_koloru(I, m, cv2.dilate(niepewne, np.ones((13, 13), np.uint8)).astype(np.float32))
        alfa = alfa * (1 - ufn) + a_kol * ufn
    if gamma != 1.0:
        # Ściśnięcie półprzezroczystej krawędzi (mniej jasnej mgiełki ze ściany na włosach)
        alfa = alfa * (1 - pas) + (alfa ** gamma) * pas
    # Ściągnięcie szumu przy 0 i 1
    return np.clip((alfa - 0.03) / 0.94, 0, 1)


def latka(alfa, y0, y1, x0):
    for y in range(y0 + 1, y1):
        t = (y - y0) / (y1 - y0)
        alfa[y, x0:] = alfa[y0, x0:] * (1 - t) + alfa[y1, x0:] * t
    return alfa


def dekontaminuj(img, alfa):
    from pymatting import estimate_foreground_ml
    F = estimate_foreground_ml(img.astype(np.float64) / 255.0, alfa.astype(np.float64))
    return (F.clip(0, 1) * 255).round().astype(np.uint8)


def kompozyt(rgba, kolor):
    rgb = rgba[..., :3].astype(np.float32)
    a = rgba[..., 3:4].astype(np.float32) / 255.0
    tlo = np.array(kolor, np.float32)[None, None]
    return (rgb * a + tlo * (1 - a)).round().astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('zrodlo')
    ap.add_argument('wyjscie')
    ap.add_argument('--model', default='ZhengPeng7/BiRefNet')
    ap.add_argument('--maska', default=None, help='gotowa maska .npy (pomija sieć)')
    ap.add_argument('--r', type=int, default=3)
    ap.add_argument('--eps', type=float, default=1e-4)
    ap.add_argument('--latka', default=None, help='y0,y1,x0')
    ap.add_argument('--kolor', action='store_true', help='alfa z koloru na krawędzi (eksperyment)')
    ap.add_argument('--gamma', type=float, default=1.0, help='ściśnięcie krawędzi alfy (>1 = ciaśniej)')
    ap.add_argument('--repo', default=None, help='katalog repo strony: zapisze img/NAZWA*.webp')
    ap.add_argument('--nazwa', default='monika-wycieta')
    a = ap.parse_args()
    os.makedirs(a.wyjscie, exist_ok=True)

    img = np.array(Image.open(a.zrodlo).convert('RGB'))
    img, ramka = obetnij_pasy(img)
    print('źródło po obcięciu pasów', img.shape[1], 'x', img.shape[0], 'ramka', ramka)

    m = np.load(a.maska) if a.maska else maska_birefnet(img, a.model)
    np.save(os.path.join(a.wyjscie, 'maska_surowa.npy'), m)
    alfa = dopracuj_maske(img, m, a.r, a.eps, a.kolor, a.gamma)
    if a.latka:
        y0, y1, x0 = map(int, a.latka.split(','))
        alfa = latka(alfa, y0, y1, x0)
    F = dekontaminuj(img, alfa)
    rgba = np.dstack([F, (alfa * 255).round().astype(np.uint8)])
    rgba[rgba[..., 3] == 0, :3] = 0

    obraz = Image.fromarray(rgba, 'RGBA')
    obraz.save(os.path.join(a.wyjscie, a.nazwa + '.png'), optimize=True)
    Image.fromarray((alfa * 255).round().astype(np.uint8)).save(os.path.join(a.wyjscie, 'alfa.png'))

    w, h = obraz.size
    sk = 900 / max(w, h)
    maly = obraz.resize((round(w * sk), round(h * sk)), Image.LANCZOS)
    for cel in [a.wyjscie] + ([os.path.join(a.repo, 'img')] if a.repo else []):
        obraz.save(os.path.join(cel, a.nazwa + '.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
        maly.save(os.path.join(cel, a.nazwa + '-900.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)

    for nazwa, kolor in [('czarne', (0, 0, 0)), ('granat', (0x0A, 0x12, 0x26)), ('biale', (255, 255, 255))]:
        Image.fromarray(kompozyt(rgba, kolor)).save(os.path.join(a.wyjscie, f'podglad_{nazwa}.jpg'), quality=92)
    # Zbliżenia krawędzi (2x): granat po lewej, czarne po prawej
    gr = kompozyt(rgba, (0x0A, 0x12, 0x26))
    cz = kompozyt(rgba, (0, 0, 0))
    H, W = gr.shape[:2]
    for i, (y0, x0) in enumerate([(0, 380), (150, 300), (380, 260), (250, 860), (700, 830), (780, 840), (1100, 840), (1250, 840)]):
        y0, x0 = min(y0, H - 200), min(x0, W - 200)
        para = np.hstack([gr[y0:y0 + 200, x0:x0 + 200], cz[y0:y0 + 200, x0:x0 + 200]])
        para = cv2.resize(para, (para.shape[1] * 2, para.shape[0] * 2), interpolation=cv2.INTER_NEAREST)
        Image.fromarray(para).save(os.path.join(a.wyjscie, f'zblizenie_{i}.jpg'), quality=92)
    print('gotowe', w, 'x', h)


if __name__ == '__main__':
    main()
