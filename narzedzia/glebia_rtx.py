"""Mapy glebi (2,5D w WebGL) dla obrazow strony, liczone na RTX (Depth Anything V2).

Uruchomienie (venv z torch cu128 + transformers, poza repo):
  set HF_HOME=D:\\CLAUDE CODE\\evolution-body-lab\\glebia\\hf
  venv\\Scripts\\python narzedzia\\glebia_rtx.py --model large --podglad "D:\\...\\podglad"

Wynik: img/glebia/<nazwa>-glebia.webp, skala szarosci 0-255 (biale = blizej),
w rozdzielczosci obrazu (ilustracje i logo max 900 px), lekko wygladzone.
Dla obrazow z kanalem alfa poza obiektem glebia = 0.
"""
import argparse
import time
from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

REPO = Path(__file__).resolve().parent.parent
MODELE = {
    "large": "depth-anything/Depth-Anything-V2-Large-hf",
    "base": "depth-anything/Depth-Anything-V2-Base-hf",
}
# (sciezka w repo, maks. dluzszy bok wyniku lub None = rozdzielczosc obrazu)
OBRAZY = [
    ("img/materialy/fala-pc.webp", None),
    ("img/materialy/fala-tel.webp", None),
    ("img/materialy/granat-kora-3.webp", None),
    ("img/materialy/klif-lustro.webp", None),
    ("projekt/ilustracje/dama-roza-kapelusz-logo.webp", 900),
    ("img/ilustracje/dama-roza-900.webp", 900),
    ("img/ilustracje/dama-kapelusz-900.webp", 900),
    ("img/ilustracje/dama-czarny-kapelusz-900.webp", 900),
]
BOK_SIECI = 1036  # dluzszy bok wejscia do sieci (wielokrotnosc 14), wiecej detalu niz domyslne 518


def wczytaj(sciezka, maks):
    im = Image.open(sciezka)
    ma_alfe = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA")
    if maks and max(im.size) > maks:
        s = maks / max(im.size)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255.0
    alfa = a[..., 3]
    if ma_alfe and alfa.min() < 0.99:
        # obiekt na neutralnym tle, zeby siec nie widziala czarnej dziury
        rgb = a[..., :3] * alfa[..., None] + 0.5 * (1 - alfa[..., None])
    else:
        alfa = None
        rgb = a[..., :3]
    return Image.fromarray((rgb * 255).round().astype(np.uint8)), alfa


def glebia(model, proc, obraz, urz):
    w, h = obraz.size
    s = BOK_SIECI / max(w, h)
    tw = max(14, int(round(w * s / 14)) * 14)
    th = max(14, int(round(h * s / 14)) * 14)
    wej = proc(images=obraz, return_tensors="pt", do_resize=True,
               size={"height": th, "width": tw}, keep_aspect_ratio=False)
    pix = wej["pixel_values"].to(urz, dtype=torch.float16 if urz == "cuda" else torch.float32)
    with torch.no_grad():
        d = model(pixel_values=pix).predicted_depth  # (1, th, tw), wieksze = blizej
    d = torch.nn.functional.interpolate(d[:, None].float(), size=(h, w), mode="bicubic",
                                        align_corners=False)[0, 0]
    return d.cpu().numpy()


def normalizuj(d, alfa):
    maska = alfa > 0.5 if alfa is not None else np.ones_like(d, bool)
    lo, hi = np.percentile(d[maska], [0.5, 99.5])
    n = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1).astype(np.float32)
    # wygladzanie bez schodkow: bilateral (zachowuje krawedzie) + gauss 1 px
    n = cv2.bilateralFilter(n, d=7, sigmaColor=0.06, sigmaSpace=3)
    n = cv2.GaussianBlur(n, (0, 0), 1.0)
    if alfa is not None:
        n = n * np.clip(alfa, 0, 1)
    return (np.clip(n, 0, 1) * 255).round().astype(np.uint8)


def arkusz(obraz, mapa, cel):
    h = 640
    s = h / obraz.height
    a = obraz.resize((round(obraz.width * s), h), Image.LANCZOS)
    b = Image.fromarray(mapa).convert("RGB").resize(a.size, Image.LANCZOS)
    out = Image.new("RGB", (a.width * 2 + 10, h), (40, 40, 40))
    out.paste(a, (0, 0))
    out.paste(b, (a.width + 10, 0))
    out.save(cel, quality=88)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="large", choices=list(MODELE))
    ap.add_argument("--podglad", help="katalog na arkusze kontrolne (poza repo)")
    ap.add_argument("--bez-zapisu", action="store_true", help="tylko podglad, bez img/glebia")
    a = ap.parse_args()

    urz = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"torch {torch.__version__}, urzadzenie: {urz}"
          + (f" ({torch.cuda.get_device_name(0)})" if urz == "cuda" else ""), flush=True)
    t0 = time.time()
    proc = AutoImageProcessor.from_pretrained(MODELE[a.model])
    model = AutoModelForDepthEstimation.from_pretrained(MODELE[a.model]).to(urz).eval()
    if urz == "cuda":
        model = model.half()
    print(f"model {MODELE[a.model]} wczytany w {time.time() - t0:.1f} s", flush=True)

    wyj = REPO / "img" / "glebia"
    wyj.mkdir(parents=True, exist_ok=True)
    pod = Path(a.podglad) if a.podglad else None
    if pod:
        pod.mkdir(parents=True, exist_ok=True)
    for rel, maks in OBRAZY:
        t = time.time()
        obraz, alfa = wczytaj(REPO / rel, maks)
        mapa = normalizuj(glebia(model, proc, obraz, urz), alfa)
        nazwa = Path(rel).stem
        if not a.bez_zapisu:
            Image.fromarray(mapa, "L").save(wyj / f"{nazwa}-glebia.webp", quality=85, method=6)
        if pod:
            arkusz(obraz, mapa, pod / f"{nazwa}-{a.model}.jpg")
        print(f"{rel}: {obraz.size[0]}x{obraz.size[1]}, alfa={'tak' if alfa is not None else 'nie'}, "
              f"{time.time() - t:.2f} s", flush=True)
    if urz == "cuda":
        print(f"maks. pamiec GPU: {torch.cuda.max_memory_allocated() / 2**20:.0f} MiB")
    print(f"razem {time.time() - t0:.1f} s")


if __name__ == "__main__":
    main()
