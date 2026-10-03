# -*- coding: utf-8 -*-
# Łupek z żywicą: tło pierwszego ekranu (Daniel 02.10.2026: „niebieski, czarne z tej prezentacji i różowe złoto,
# motyw kamień łupkowy, kora, akcenty marmuru i a la żywicy epoksydowej w 3D”). Tylko kod (numpy + Pillow), bez AI.
#
# Warstwy (pola szumu = biały szum rozmyty przez FFT, jak w welur.py / materialy2.py):
#   1. płyty łupka: duże komórki Voronoja wydłużone wzdłuż jednego kierunku, poszarpane brzegi (zawinięcie przestrzeni
#      w trzech skalach), każda płyta lekko inaczej nachylona i inaczej ciemna (czerń, łupek, granat, szaroniebieski);
#   2. marmur: miękkie chmury w płytach, jaśniejsze przy pęknięciach; drobne kierunkowe rysy jak rysunek kory;
#   3. pęknięcia: granice płyt rozchodzą się po prawej (szczeliny zmiennej szerokości), po lewej są tylko ciemnym
#      szwem; przy szczelinach odpryski (mniejsze komórki) i włoskowate rysy;
#   4. żywica: głęboki błękit, ciemniej przy ściankach, jaśniej w środku (światło przechodzi), mętne obłoki w głębi,
#      odbicie miękkiego światła (pas) i połysk lakieru;
#   5. 3D: wysokość (płyty, wypukłe krawędzie, zagłębiona żywica z meniskiem) → normalne → światło z lewej góry;
#   6. kintsugi: różowe złoto #D4A49A na krawędziach szczelin i w rysach, blik #FFE6DA, lekka poświata.
# Kompozycja: złoto i żywica po prawej i przy krawędziach, lewa strona (nagłówek, tekst) spokojna i ciemna.
#
# Wynik: img/materialy/lupek-pc.webp (2400×1350) i lupek-tel.webp (1080×1350) + kontrast tekstu na najjaśniejszym
# miejscu tła pod tekstem. Uruchomienie z katalogu repo: python3 narzedzia/lupek.py [pc] [tel]
import os
import sys
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "img", "materialy")
f32 = np.float32


def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], f32) / 255


def norm(a):
    a = a - a.mean()
    return (a / (a.std() + 1e-9)).astype(f32)


def blur(a, s1, s2=None, kat=0.0):
    """Gauss (anizotropowy pod kątem w stopniach) przez FFT."""
    s2 = s1 if s2 is None else s2
    fy = np.fft.fftfreq(a.shape[0])[:, None]
    fx = np.fft.rfftfreq(a.shape[1])[None, :]
    t = np.deg2rad(kat)
    u = fx * np.cos(t) + fy * np.sin(t)
    v = -fx * np.sin(t) + fy * np.cos(t)
    H = np.exp(-2 * np.pi ** 2 * ((s1 * u) ** 2 + (s2 * v) ** 2))
    return np.fft.irfft2(np.fft.rfft2(a) * H, s=a.shape).astype(f32)


def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return (t * t * (3 - 2 * t)).astype(f32)


def mix(a, b, t):
    t = np.asarray(t, f32)
    return a + (b - a) * (t[..., None] if t.ndim else t)


def probka(img, x, y):
    """Dwuliniowe próbkowanie pola w punktach (x, y), z przycięciem do brzegu (bez schodków)."""
    H, W = img.shape
    x = np.clip(x, 0, W - 1.001); y = np.clip(y, 0, H - 1.001)
    x0 = x.astype(np.int32); y0 = y.astype(np.int32); fx = x - x0; fy = y - y0
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy)
            + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy).astype(f32)


def voronoi(X, Y, kom, rng, nlos=3):
    """Dla każdego piksela: odległość do granicy komórek (w jednostkach X/Y) i nlos losowych wartości komórki."""
    ny, nx = int(np.ceil(Y.max() / kom)) + 3, int(np.ceil(X.max() / kom)) + 3
    off = 2
    jit = rng.uniform(.08, .92, (ny + 2 * off, nx + 2 * off, 2)).astype(f32)
    los = rng.uniform(0, 1, (ny + 2 * off, nx + 2 * off, nlos)).astype(f32)
    cy = np.floor(Y / kom).astype(np.int32) + off; cx = np.floor(X / kom).astype(np.int32) + off
    best = [np.full(X.shape, 1e18, f32), np.full(X.shape, 1e18, f32)]
    p1 = [np.zeros(X.shape, f32), np.zeros(X.shape, f32)]; p2 = [np.zeros(X.shape, f32), np.zeros(X.shape, f32)]
    l1 = np.zeros(X.shape + (nlos,), f32)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            iy = np.clip(cy + dy, 0, ny + 2 * off - 1); ix = np.clip(cx + dx, 0, nx + 2 * off - 1)
            py = (iy - off + jit[iy, ix, 0]) * kom; px = (ix - off + jit[iy, ix, 1]) * kom
            d = (Y - py) ** 2 + (X - px) ** 2
            m1 = d < best[0]; m2 = (~m1) & (d < best[1])
            # przesuń pierwsze na drugie tam, gdzie nowe jest najbliższe
            best[1] = np.where(m1, best[0], np.where(m2, d, best[1]))
            p2[0] = np.where(m1, p1[0], np.where(m2, py, p2[0])); p2[1] = np.where(m1, p1[1], np.where(m2, px, p2[1]))
            best[0] = np.where(m1, d, best[0])
            p1[0] = np.where(m1, py, p1[0]); p1[1] = np.where(m1, px, p1[1])
            l1 = np.where(m1[..., None], los[iy, ix], l1)
    sep = np.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) + 1e-6
    return ((best[1] - best[0]) / (2 * sep)).astype(f32), l1


def zrob(W, H, maska_fn, ziarno, s=1.0):
    """s: skala elementów (1 = projekt 2400 px szerokości)."""
    P = 192
    Hp, Wp = H + 2 * P, W + 2 * P
    rng = np.random.default_rng(ziarno)
    g = lambda: rng.standard_normal((Hp, Wp)).astype(f32)
    yy, xx = np.mgrid[0:Hp, 0:Wp].astype(f32)
    u = (xx - P) / W; v = (yy - P) / H
    KAT = -58.0                                      # kierunek warstw: z lewego dołu do prawej góry
    t = np.deg2rad(KAT)

    M = np.clip(maska_fn(u, v) * (1 + .25 * np.tanh(norm(blur(g(), 150 * s)))), 0, 1)

    # zawinięcie przestrzeni w trzech skalach: kamień pęka poszarpanie
    def warp(a1, a2, a3):
        return (a1 * s * norm(blur(g(), 110 * s)) + a2 * s * norm(blur(g(), 16 * s)) + a3 * s * norm(blur(g(), 3.5 * s)),
                a1 * s * norm(blur(g(), 110 * s)) + a2 * s * norm(blur(g(), 16 * s)) + a3 * s * norm(blur(g(), 3.5 * s)))
    wx, wy = warp(55, 7, 1.0)
    X = xx + wx; Y = yy + wy
    # obrót i wydłużenie płyt wzdłuż kierunku warstw
    A = X * np.cos(t) + Y * np.sin(t); B = -X * np.sin(t) + Y * np.cos(t)
    ROZ = 1.9
    d_pl, c_pl = voronoi(A / ROZ, B, 300 * s, rng)
    d_pl = d_pl * 1.15                                # przybliżenie odległości w px (wydłużenie)

    # ---- szczeliny między płytami
    zmien = ss(-1.1, 1.3, norm(blur(g(), 90 * s)))   # szerokość zmienia się wzdłuż pęknięcia
    w_pl = (1.0 + 18 * zmien ** 2.0) * s * ss(.25, .95, M)
    otw = w_pl > .35 * s
    r_pl = np.where(otw, d_pl - w_pl, 99).astype(f32)
    blisko = ss(70 * s, 4 * s, d_pl) * ss(.2, .7, M)

    # odpryski przy szczelinach: mniejsze komórki z innym nachyleniem
    wx2, wy2 = warp(0, 14, 1.4)
    d_od, c_od = voronoi(xx + wx + wx2, yy + wy + wy2, 42 * s, rng)
    odpr = (ss(30 * s, 6 * s, d_pl) * ss(.35, .8, M) * (c_od[..., 2] > .35)).astype(f32)
    # włoskowate rysy (tylko złoto) blisko szczelin
    wx3, wy3 = warp(0, 5, 1.8)
    d_w, _ = voronoi(xx + .5 * wx + wx3, yy + .5 * wy + wy3, 30 * s, rng, 1)
    wlos = ss(1.15 * s, .2 * s, d_w) * ss(.7, 1.5, norm(blur(g(), 20 * s))) * ss(.3, .85, M) \
        * np.maximum(ss(110 * s, 10 * s, d_pl), .2 * ss(.85, 1, M))
    # drugorzędne rysy w odpryskach
    r_od = np.where(odpr > .5, d_od - .55 * s, 99).astype(f32)

    r = np.minimum(r_pl, 99)
    wew = ss(.75 * s, -.75 * s, r)                                      # żywica (antyaliasing)
    glebia = np.clip(-r / np.maximum(w_pl, .6 * s), 0, 1)              # 0 przy ściance → 1 w środku
    gr = (.55 + .4 * ss(3 * s, 14 * s, w_pl)) * s                       # grubość złotej obwódki
    zl_brzeg = ss(gr + .8 * s, gr - .2 * s, np.abs(r)) * otw
    zl_od = ss(.9 * s, .1 * s, np.abs(r_od)) * .75
    zloto = np.clip(np.maximum.reduce([zl_brzeg, zl_od, .85 * wlos]), 0, 1)
    szew = ss(1.6 * s, .2 * s, d_pl) * (1 - otw)                          # zamknięty szew po lewej (ciemny)

    # ---- marmur i kora
    c = (1.0 * norm(blur(g(), 200 * s, 120 * s, KAT)) + .5 * norm(blur(g(), 70 * s, 40 * s, KAT))
         + .22 * norm(blur(g(), 22 * s, 14 * s, KAT)))
    chmury = norm(probka(norm(c), xx + 1.4 * wx, yy + 1.4 * wy))
    kora = norm(blur(g(), 14 * s, .8 * s, KAT + 3)) + .6 * norm(blur(g(), 6 * s, .7 * s, KAT - 10))
    kora = norm(probka(norm(kora), xx + .7 * wx, yy + .7 * wy)) * ss(-.6, 1.2, norm(blur(g(), 60 * s)))   # rysunek kory tylko łatami
    ziarnko = norm(blur(g(), .7 * s))

    # ---- wysokość i normalne
    tilt_pl = (c_pl[..., :2] - .5) * .5
    tilt_od = (c_od[..., :2] - .5) * 1.1
    tx = tilt_pl[..., 0] * (1 - odpr) + tilt_od[..., 0] * odpr
    ty = tilt_pl[..., 1] * (1 - odpr) + tilt_od[..., 1] * odpr
    h = (.9 * chmury + .10 * kora + .06 * ziarnko) * 2.2 * s
    wal = ss(7 * s, 0, np.maximum(r, 0)) * otw * (1 - wew)
    h = h + 2.5 * s * wal
    h_zyw = -2.0 * s + 2.4 * s * (1 - glebia) ** 3                     # menisk przy ściankach
    h = h * (1 - wew) + h_zyw * wew + .9 * s * zloto
    hb = blur(h, .8 * s)
    hy, hx = np.gradient(hb)
    stal = 1 - wew                                                      # nachylenie płyt tylko na kamieniu
    nx_ = -hx * 1.3 + tx * stal; ny_ = -hy * 1.3 + ty * stal
    ln = np.sqrt(nx_ ** 2 + ny_ ** 2 + 1)
    nx_, ny_, nz = nx_ / ln, ny_ / ln, 1 / ln
    L = np.array([-.5, -.6, .62], f32); L /= np.linalg.norm(L)
    Hh = L + np.array([0, 0, 1], f32); Hh /= np.linalg.norm(Hh)
    dif = np.clip(nx_ * L[0] + ny_ * L[1] + nz * L[2], 0, 1.5) / L[2]
    spec = np.clip(nx_ * Hh[0] + ny_ * Hh[1] + nz * Hh[2], 0, 1)

    # ---- kolor kamienia
    czern = hexrgb("#04070C"); lupek = hexrgb("#0A0F18"); granat = hexrgb("#132746")
    lazur = hexrgb("#2C4A72"); mgla = hexrgb("#7189A8")
    ton = c_pl[..., 2] * (1 - odpr) + c_od[..., 1] * odpr               # każda płyta ma swój ton
    jas = .5 + .5 * np.tanh(.85 * chmury + 1.3 * (ton - .5) * (.35 + .65 * M))
    jas = jas * (.58 + .42 * M) + .35 * blisko * (.5 + .5 * np.tanh(chmury + .8))
    kol = mix(czern, lupek, ss(.04, .4, jas))
    kol = mix(kol, granat, ss(.38, .82, jas))
    kol = mix(kol, lazur, ss(.7, 1.0, jas) * (.3 + .7 * M))
    kol = mix(kol, mgla, ss(.92, 1.2, jas) * ss(.45, 1, M) * .55)
    kol = kol * (1 + .035 * kora[..., None] + .04 * ziarnko[..., None])
    kol = kol * np.clip(.5 + .5 * dif, 0, 1.4)[..., None]
    kol = kol + (.06 * spec ** 24 * (.25 + .75 * M))[..., None] * hexrgb("#A8BCD8")   # matowy połysk łupka
    kol = kol * (1 - .55 * szew)[..., None]

    # ---- żywica
    zyw_g = hexrgb("#010616"); zyw_s = hexrgb("#082660"); zyw_j = hexrgb("#174CA6")
    obl = .5 + .5 * np.tanh(.9 * norm(blur(g(), 5 * s)) + norm(blur(g(), 30 * s)))
    zk = mix(zyw_g, zyw_s, ss(0, .6, glebia) * (.55 + .45 * obl))
    zk = mix(zk, zyw_j, ss(.35, 1, glebia) * obl * .8)
    # odbicie miękkiego okna w lakierze (pas po skosie) + połysk menisku
    pas = ss(.25, 0, np.abs(((xx - P) / W * .9 - (yy - P) / H * .55) - .55 + .08 * norm(blur(g(), 120 * s))))
    zk = zk + (pas * .22 * glebia)[..., None] * hexrgb("#9CC2FF")
    zk = zk + (spec ** 70 * 1.2)[..., None] * hexrgb("#E2EEFF")
    kol = mix(kol, zk, wew)
    pz = blur(wew, 5 * s)
    kol = kol + (pz * (1 - wew) * .12)[..., None] * hexrgb("#2C72DA")   # żywica przeświecająca w brzeg kamienia

    # ---- różowe złoto
    rz = hexrgb("#D4A49A"); rz_c = hexrgb("#94594C"); blik = hexrgb("#FFE6DA")
    zl = mix(rz_c, rz, np.clip(.35 + .65 * ss(.4, 1.25, dif), 0, 1))
    zl = mix(zl, rz, ss(.2, .9, wlos))                 # rysy: czyste różowe złoto (cienkie linie nie bieleją)
    zl = mix(zl, blik, np.clip(spec ** 36 * 1.4 + .08 * pas, 0, 1))
    kol = mix(kol, zl, zloto)
    posw = blur(zloto, 2.5 * s) * .5 + blur(zloto, 14 * s) * 1.2
    kol = kol + (posw * .18)[..., None] * hexrgb("#E9B3A2")

    kol = kol * (.80 + .20 * np.clip(M * 1.7, 0, 1))[..., None]       # lewa strona ciemniej (tekst)
    kol = np.clip(kol, 0, 1)[P:P + H, P:P + W]
    kol = kol + rng.standard_normal(kol.shape[:2])[..., None].astype(f32) * (.5 / 255)
    return (np.clip(kol, 0, 1) * 255 + .5).astype(np.uint8)


def maska_pc(u, v):
    # komputer (hero 1440×~850, tło „cover” do prawej): karta z obrazem zajmuje u .55 do .91, tekst u < .51.
    # Złoto: prawy margines, pasy u góry i u dołu (wychodzą zza karty), żyły przechodzą pod kartą.
    prawo = ss(.50, .98, u)
    brzegi = (np.exp(-np.clip(v, 0, 1) / .09) + np.exp(-np.clip(1 - v, 0, 1) / .09)) * ss(.36, .75, u)
    return np.clip(prawo + .75 * brzegi, 0, 1).astype(f32)


def maska_tel(u, v):
    # telefon (hero 375×~810, obraz 1080×2200 „cover”): karta z obrazem zasłania v .04 do .30 i prawie całą szerokość,
    # tekst od v .33. Złoto tam, gdzie je widać: pas nad kartą, boczne marginesy obok karty (prawy mocniej),
    # pęknięcie wychodzące spod karty przy prawej krawędzi; niżej spokojny łupek.
    gora = ss(.10, .02, v)
    prawo = ss(.80, .97, u) * ss(.34, .26, v)
    lewo = ss(.14, .03, u) * ss(.30, .20, v) * .7
    pod = ss(.24, .14, v) * .5
    return np.clip(np.maximum.reduce([gora, prawo, lewo, pod]), 0, 1).astype(f32)


def lum(c):
    c = np.asarray(c, float)
    c = np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)
    return c @ np.array([.2126, .7152, .0722])


def kontrast(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + .05) / (min(la, lb) + .05)


def hx(c):
    return "#" + "".join(f"{int(round(float(x) * 255)):02X}" for x in c)


def raport(img, nazwa, obszar):
    """Najjaśniejsze miejsce tła pod tekstem: maksimum po rozmyciu 2 px (skala liter) i pojedynczy piksel max."""
    H, W = img.shape[:2]
    x0, y0, x1, y1 = obszar
    a = img[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)].astype(f32) / 255
    L = lum(a).astype(f32)
    ab = np.stack([blur(a[..., k], 2) for k in range(3)], -1)
    Lb = lum(ab)
    najj = ab.reshape(-1, 3)[np.argmax(Lb)]
    maxp = a.reshape(-1, 3)[np.argmax(L)]
    sr = a.reshape(-1, 3).mean(0)
    out = [f"{nazwa}: obszar tekstu {obszar}: średnio {hx(sr)}, najjaśniej (rozmycie 2 px) {hx(najj)}, "
           f"pojedynczy piksel max {hx(maxp)}"]
    for n_, k in (("biel #F6F0E4", hexrgb("#F6F0E4")), ("różowe złoto #D4A49A", hexrgb("#D4A49A"))):
        out.append(f"   {n_}: na najjaśniejszym {kontrast(k, najj):.2f}:1 · na pikselu max {kontrast(k, maxp):.2f}:1 "
                   f"· na średnim {kontrast(k, sr):.2f}:1")
    print("\n".join(out))


def zapisz(arr, nazwa, q):
    p = os.path.join(OUT, nazwa)
    Image.fromarray(arr).save(p, "WEBP", quality=q, method=6)
    print(f"{nazwa} {arr.shape[1]}×{arr.shape[0]} {os.path.getsize(p) / 1024:.0f} KB")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    tylko = sys.argv[1:] or ["pc", "tel"]
    if "pc" in tylko:
        pc = zrob(2400, 1350, maska_pc, 20261002)
        zapisz(pc, "lupek-pc.webp", 80)
        raport(pc, "lupek-pc", (0.0, .15, .52, .85))      # lewa połowa: etykieta, H1, akapit, przyciski, notka
    if "tel" in tylko:
        tel = zrob(1080, 2200, maska_tel, 20261003, s=1.4)
        zapisz(tel, "lupek-tel.webp", 80)
        raport(tel, "lupek-tel", (0.0, .33, 1.0, 1.0))      # pod kartą: etykieta, H1, akapit, przyciski
