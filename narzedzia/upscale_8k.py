"""Mastery 8K (dłuższy bok 7680 px) grafik marki + ostrzejsze wersje webowe (03.10.2026).

Upscaler: Real-ESRGAN (RealESRGAN_x4plus / RealESRGAN_x4plus_anime_6B, licencja BSD-3), sieć RRDBNet przepisana
tu w czystym PyTorch (bez basicsr), GPU fp16, kafle 512 z zakładką 32. Jeden przebieg x4 + Lanczos do 7680 px.
Alfa: skalowana osobno Lanczosem; przed upscalem kolor krawędzi rozlewany pod pełną przezroczystość (bez czarnych obwódek).

Wymaga: torch (CUDA), numpy, pillow. Wagi z https://github.com/xinntao/Real-ESRGAN/releases do --wagi.
  python narzedzia/upscale_8k.py master  [nazwa ...] [--model x4plus|anime] [--wy KATALOG_8K]
  python narzedzia/upscale_8k.py porownaj nazwa                 (wycinki 100% obu modeli do KATALOG_8K/podglad)
  python narzedzia/upscale_8k.py web     [--wy KATALOG_8K]      (pliki web z masterów, w katalogu repo)
Mastery są duże (PNG 7680 px) i NIE trafiają do repo.
"""
import os, sys, time, argparse
import numpy as np
from PIL import Image, ImageFilter

DL = r"C:\Users\danie\Downloads"
# nazwa: (źródło: oryginał Designer z 03.10.2026 lub plik z repo, domyślny model, ma alfę)
ZRODLA = {
    'medalion':   (DL + r"\Designer (50).png", 'x4plus', True),   # = projekt/ilustracje/monika-medalion-2.webp
    'herb':       (DL + r"\Designer (57).png", 'x4plus', True),   # = projekt/ilustracje/monika-herb-z-napisem.webp
    'monika-rys': (DL + r"\Designer (47).png", 'x4plus', True),   # = img/monika-rys.webp
    'ems':        (DL + r"\Designer (66).png", 'x4plus', True),   # stacja EMS (img/rtx/ems-urzadzenie-*)
    'krio':       (DL + r"\Designer (61).png", 'x4plus', True),   # = img/rtx/krio-urzadzenie-*
    'kabina':     (DL + r"\Designer (62).png", 'x4plus', False),  # = img/rtx/kabina-daniel-*
    'witryna':    (DL + r"\Designer (64).png", 'x4plus', True),   # = img/rtx/witryna-* (web: RGB bez alfy)
}
BEZ_ROZLEWU = {'witryna'}   # RGB pod alfą jest pełny (web używa go bez alfy) - nie ruszać
CEL = 7680


# ---------------- RRDBNet (Real-ESRGAN) ----------------
def siec(num_block):
    import torch, torch.nn as nn, torch.nn.functional as F

    class RDB(nn.Module):
        def __init__(s, nf=64, gc=32):
            super().__init__()
            s.conv1 = nn.Conv2d(nf, gc, 3, 1, 1); s.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
            s.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1); s.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
            s.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1); s.l = nn.LeakyReLU(0.2, True)

        def forward(s, x):
            x1 = s.l(s.conv1(x)); x2 = s.l(s.conv2(torch.cat((x, x1), 1)))
            x3 = s.l(s.conv3(torch.cat((x, x1, x2), 1))); x4 = s.l(s.conv4(torch.cat((x, x1, x2, x3), 1)))
            return s.conv5(torch.cat((x, x1, x2, x3, x4), 1)) * 0.2 + x

    class RRDB(nn.Module):
        def __init__(s):
            super().__init__(); s.rdb1, s.rdb2, s.rdb3 = RDB(), RDB(), RDB()

        def forward(s, x):
            return s.rdb3(s.rdb2(s.rdb1(x))) * 0.2 + x

    class Net(nn.Module):
        def __init__(s):
            super().__init__()
            s.conv_first = nn.Conv2d(3, 64, 3, 1, 1); s.body = nn.Sequential(*[RRDB() for _ in range(num_block)])
            s.conv_body = nn.Conv2d(64, 64, 3, 1, 1); s.conv_up1 = nn.Conv2d(64, 64, 3, 1, 1)
            s.conv_up2 = nn.Conv2d(64, 64, 3, 1, 1); s.conv_hr = nn.Conv2d(64, 64, 3, 1, 1)
            s.conv_last = nn.Conv2d(64, 3, 3, 1, 1); s.l = nn.LeakyReLU(0.2, True)

        def forward(s, x):
            f = s.conv_first(x); f = f + s.conv_body(s.body(f))
            f = s.l(s.conv_up1(F.interpolate(f, scale_factor=2, mode='nearest')))
            f = s.l(s.conv_up2(F.interpolate(f, scale_factor=2, mode='nearest')))
            return s.conv_last(s.l(s.conv_hr(f)))
    return Net()


def model(nazwa, wagi):
    import torch
    plik, nb = {'x4plus': ('RealESRGAN_x4plus.pth', 23), 'anime': ('RealESRGAN_x4plus_anime_6B.pth', 6)}[nazwa]
    sd = torch.load(os.path.join(wagi, plik), map_location='cpu', weights_only=True)
    sd = sd.get('params_ema', sd.get('params', sd))
    m = siec(nb); m.load_state_dict(sd, strict=True)
    return m.eval().half().cuda()


def x4(m, rgb, tile=512, pad=32):
    """rgb: float32 HxWx3 0..1 -> float32 (4H)x(4W)x3, kafelkami."""
    import torch
    H, W, _ = rgb.shape
    out = np.zeros((H * 4, W * 4, 3), np.float32)
    t = torch.from_numpy(np.ascontiguousarray(rgb.transpose(2, 0, 1)))[None].half().cuda()
    with torch.inference_mode():
        for y0 in range(0, H, tile):
            for x0 in range(0, W, tile):
                y1, x1 = min(y0 + tile, H), min(x0 + tile, W)
                ya, xa, yb, xb = max(y0 - pad, 0), max(x0 - pad, 0), min(y1 + pad, H), min(x1 + pad, W)
                o = m(t[:, :, ya:yb, xa:xb]).clamp_(0, 1)
                o = o[:, :, (y0 - ya) * 4:(y0 - ya + y1 - y0) * 4, (x0 - xa) * 4:(x0 - xa + x1 - x0) * 4]
                out[y0 * 4:y1 * 4, x0 * 4:x1 * 4] = o[0].float().cpu().numpy().transpose(1, 2, 0)
    return out


def rozlej(rgb, al):
    """Kolor z kryjących pikseli rozlany pod pełną przezroczystość (alfa < 2/255), półprzezroczyste bez zmian."""
    w = (al > .9).astype(np.float32)
    wyn = rgb.copy(); pusty = al < 2 / 255.
    zrob = pusty.copy()
    for r in (2, 6, 18, 54, 160):
        def bl(a):
            import cv2
            return cv2.GaussianBlur(np.ascontiguousarray(a, np.float32), (0, 0), r, borderType=cv2.BORDER_REPLICATE)
        ww = bl(w)
        if not zrob.any():
            break
        c = np.dstack([bl((rgb[..., i] * w).astype(np.float32)) for i in range(3)]) / np.maximum(ww, 1e-6)[..., None]
        ok = zrob & (ww > 1e-3)
        wyn[ok] = c[ok]; zrob &= ~ok
    return np.clip(wyn, 0, 1)


def lanczos(a, size):
    """float HxW(xC) 0..1 -> Lanczos (kanałami w trybie F, bez kwantyzacji)."""
    if a.ndim == 2:
        return np.asarray(Image.fromarray(a.astype(np.float32), 'F').resize(size, Image.LANCZOS))
    return np.dstack([lanczos(a[..., i], size) for i in range(a.shape[2])])


def master(nazwa, mdl, m, wy):
    src, _, alfa = ZRODLA[nazwa]
    im = Image.open(src)
    alfa = alfa and im.mode == 'RGBA'
    A = np.asarray(im.convert('RGBA' if alfa else 'RGB')).astype(np.float32) / 255.
    rgb = A[..., :3]
    if alfa and nazwa not in BEZ_ROZLEWU:
        rgb = rozlej(rgb, A[..., 3])
    H, W = rgb.shape[:2]; k = CEL / max(H, W); size = (round(W * k), round(H * k))
    t = time.time(); up = x4(m, rgb); tg = time.time() - t
    out = lanczos(up, size) if up.shape[:2][::-1] != size else up
    if alfa:
        a = np.clip(lanczos(A[..., 3], size), 0, 1)
        out = np.dstack([np.clip(out, 0, 1), a])
    o = Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA' if alfa else 'RGB')
    p = os.path.join(wy, '%s-8k-%s.png' % (nazwa, mdl))
    o.save(p, compress_level=6)
    print('%s %s: %s -> %s, GPU %.1f s, razem %.1f s, %.1f MB' % (nazwa, mdl, im.size, o.size, tg, time.time() - t, os.path.getsize(p) / 1e6), flush=True)
    return p


# ---------------- web ----------------
def zapisz_webp(im, p, q=86):
    if os.path.exists(p):
        print('JUŻ JEST, pomijam:', p); return
    while True:
        im.save(p, 'WEBP', quality=q, method=6, alpha_quality=100)
        kb = os.path.getsize(p) / 1024
        if kb < 600 or q <= 60:
            break
        q = 80 if q > 80 else q - 5
    print('%s %s q%d %.0f KB' % (p, im.size, q, kb), flush=True)


def wysokosc(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)


def szerokosc(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def hero(src_rys, cel):
    """narzedzia/monika_hero.py na źródle 2048 (ten sam kod, ścieżki podmienione, rozmycie skalowane, bez głębi)."""
    kod = open(os.path.join('narzedzia', 'monika_hero.py'), encoding='utf-8').read()
    kod = kod.replace("Image.open('img/monika-rys.webp')", 'Image.open(SRC)')
    kod = kod.replace("'img/monika-rys-hero.webp'", 'CEL')
    kod = kod.replace('GaussianBlur(3)', 'GaussianBlur(3 * W / 1024)')
    assert 'SRC' in kod and 'CEL' in kod and '3 * W / 1024' in kod
    if os.path.exists(cel):
        print('JUŻ JEST, pomijam:', cel); return
    sys.argv = [sys.argv[0], '--bez-glebi']
    exec(compile(kod, 'monika_hero.py', 'exec'), {'__name__': 'hero', 'SRC': src_rys, 'CEL': cel})
    print('%s %.0f KB' % (cel, os.path.getsize(cel) / 1024))


def web(wy, mdl):
    M = lambda n: Image.open(os.path.join(wy, '%s-8k-%s.png' % (n, mdl.get(n, 'x4plus'))))
    r = M('monika-rys'); zapisz_webp(wysokosc(r, 2048), 'img/monika-rys-2048.webp')
    if os.path.exists('img/monika-rys-hero.webp'):
        hero('img/monika-rys-2048.webp', 'img/monika-rys-hero-2048.webp')
    e = M('ems'); k = e.width / 1536   # kadr jak img/rtx/ems-urzadzenie-1400.webp (dopasowany do Designer (66))
    e = e.crop((round(37.4 * k), round(26.7 * k), round(1529 * k), e.height))
    zapisz_webp(wysokosc(e, 2000), 'img/rtx/ems-urzadzenie-2000.webp')
    zapisz_webp(wysokosc(M('krio'), 2000), 'img/rtx/krio-urzadzenie-2000.webp')
    zapisz_webp(szerokosc(M('kabina').convert('RGB'), 2880), 'img/rtx/kabina-daniel-2880.webp')
    zapisz_webp(szerokosc(M('witryna').convert('RGB'), 2880), 'img/rtx/witryna-2880.webp')
    zapisz_webp(szerokosc(M('medalion'), 2048), 'projekt/ilustracje/monika-medalion-2-2048.webp')
    zapisz_webp(szerokosc(M('herb'), 2048), 'projekt/ilustracje/monika-herb-z-napisem-2048.webp')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('co', choices=['master', 'porownaj', 'web'])
    ap.add_argument('nazwy', nargs='*')
    ap.add_argument('--model', default=None)
    ap.add_argument('--wy', default=r"D:\CLAUDE CODE\evolution-body-lab\8k")
    ap.add_argument('--wagi', default=r"D:\AI\modele\realesrgan")
    ap.add_argument('--wybor', default='', help='np. medalion=anime,herb=anime (który master idzie do web)')
    a = ap.parse_args()
    if a.co == 'web':
        web(a.wy, dict(x.split('=') for x in a.wybor.split(',') if x)); return
    nazwy = a.nazwy or list(ZRODLA)
    modele = ['x4plus', 'anime'] if a.co == 'porownaj' else None
    cache = {}
    for n in nazwy:
        for mdl in (modele or [a.model or ZRODLA[n][1]]):
            if mdl not in cache:
                cache[mdl] = model(mdl, a.wagi)
            master(n, mdl, cache[mdl], a.wy)


if __name__ == '__main__':
    main()
