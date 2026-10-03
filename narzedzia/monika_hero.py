"""Pierwszy ekran: Monika narysowana wtopiona w falę (03.10.2026).
Z pliku Daniela img/monika-rys.webp (nie zmieniany) robi img/monika-rys-hero.webp: biała bluzka przechodzi od kości
słoniowej przez różowe złoto w czerń przy krawędziach i u dołu (bez twardej białej plamy), dół i boki rozpuszczone
w przezroczystość. Robi też TYMCZASOWĄ mapę głębi img/glebia/monika-rys-glebia.webp z alfy (sylwetka wypukła, twarz
bliżej); mapa z RTX (Depth Anything) zastąpi ją pod tą samą nazwą. Uruchom: python3 narzedzia/monika_hero.py [--bez-glebi]"""
import sys
from PIL import Image, ImageFilter
import numpy as np

def sm(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

src = Image.open('img/monika-rys.webp').convert('RGBA')
A = np.asarray(src).astype(np.float32) / 255.
H, W = A.shape[:2]
rgb, al = A[..., :3], A[..., 3]
yy, xx = np.mgrid[0:H, 0:W]; Y = yy / H; X = xx / W
L = rgb @ np.array([.299, .587, .114], np.float32)
sat = (rgb.max(-1) - rgb.min(-1)) / (rgb.max(-1) + 1e-4)
bl = sm(.55, .75, L) * (1 - sm(.12, .25, sat)) * sm(.36, .46, Y)          # biel bluzki pod twarzą
bl = np.asarray(Image.fromarray((bl * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255.

def ton(x):   # czerń -> cień różowego złota -> #D4A49A -> kość słoniowa #F6F0E4
    x = np.clip(x, 0, 1)[..., None]
    c0, c1, c2, c3 = np.array([.06, .04, .045]), np.array([.42, .27, .24]), np.array([.831, .643, .604]), np.array([.965, .94, .894])
    c = c0 + (c1 - c0) * sm(0, .4, x); c = c + (c2 - c) * sm(.35, .7, x); return c + (c3 - c) * sm(.75, 1, x)

kraw = np.maximum.reduce([sm(.34, .0, X), sm(.5, .98, X), sm(.52, .92, Y)])
t = (.15 + .85 * kraw) * bl
out = rgb * (1 - t[..., None]) + ton(L * (1 - .62 * kraw)) * t[..., None]
out *= (1 - .7 * sm(.62, 1., Y))[..., None]
a2 = al * (1 - sm(.80, .995, Y))
a2 *= 1 - (1 - sm(.0, .34, X)) * sm(.30, .42, Y)
a2 *= 1 - (1 - sm(1., .86, X)) * sm(.55, .85, Y) * .8
o = np.dstack([np.clip(out, 0, 1), np.clip(a2, 0, 1)])
Image.fromarray((o * 255 + .5).astype(np.uint8), 'RGBA').save('img/monika-rys-hero.webp', quality=88, method=6)

if '--bez-glebi' not in sys.argv:
    a8 = Image.fromarray((al * 255).astype(np.uint8)).resize((512, 768))
    g = np.asarray(a8.filter(ImageFilter.GaussianBlur(26))).astype(np.float32) / 255.
    y2, x2 = np.mgrid[0:768, 0:512]
    twarz = np.exp(-(((x2 / 512 - .42) / .17) ** 2 + ((y2 / 768 - .30) / .14) ** 2))
    d = np.clip(.15 + .55 * g + .3 * twarz, 0, 1) * (np.asarray(a8).astype(np.float32) / 255. * .85 + .15)
    Image.fromarray((d * 255).astype(np.uint8), 'L').convert('RGB').save('img/glebia/monika-rys-glebia.webp', quality=90)
