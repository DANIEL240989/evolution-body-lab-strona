"""Ceny rynkowe Nicea, sprawdzone 03.10.2026 (z wyników wyszukiwarki, strony gabinetów nieotwarte:
planity.com, treatwell.fr i strony instytutów są zablokowane w tej chmurze).
Uruchom: python3 projekt/ceny_nicea.py

Zasady:
- 'cena' = cena wystawiona (katalogowa) pojedynczej sesji; promocje, 'découverte' i prix barré
  liczone osobno (promo=True) i NIE wchodzą do mediany cen wystawionych.
- 'pakiet' = (cena pakietu, liczba sesji) -> cena za sesję w pakiecie.
- 'min' = czas sesji w minutach (None = brak danych).
- Tylko Nicea do mediany; Cannes/Antibes jako tło (tlo=True).
"""
from statistics import median

DANE = {
 "drainage": [
  # nazwa, dzielnica, cena, min, promo, pakiety, uwagi
  dict(n="Green Beauty Center", d="Carabacel", c=69.90, m=60),
  dict(n="V Esthetic", d="Coeur de Nice", c=120, m=75),
  dict(n="Fyna madero", d="Saint-Roch", c=80, m=60),
  dict(n="Blissful Body (Renata Franca)", d="Vieux-Nice", c=150, m=60),
  dict(n="Luxa Beaute", d="Carabacel", c=90, m=45),
  dict(n="Institut Leda", d="rue de France", c=88, m=60, u="'des 88'; inny wynik podaje 120"),
  dict(n="BeautyfaceByLara (Vodder)", d="Fabron", c=58.50, m=60, u="'des'"),
  dict(n="Patrick Helfer", d="06300, rue Alexandre Mari", c=120, m=60),
  dict(n="Lymphatika by Centre Clemenceau", d="av. Georges Clemenceau", c=140, m=75),
  dict(n="Marine Drainage Lymphatique", d="av. Buenos Ayres", c=130, m=80),
  dict(n="Aesthetic Expert Nice", d="06000", c=90, m=60),
  dict(n="Perle de beaute", d="brak danych", c=99, m=90, p=[(460, 5)]),
  dict(n="Sereny'Ti", d="av. Teiras, 06300", c=75, m=60, u="'a partir de'"),
  dict(n="Drainessence", d="brak danych", c=65, m=60),
  dict(n="ClaraNaturo (Vodder)", d="brak danych", c=75, m=None, p=[(650, 5)], u="pakiet = Renata Franca, sesja 150"),
  dict(n="Body Tech (post-op)", d="Musiciens", c=80, m=60, p=[(680, 10)]),
  dict(n="Expertise Beaute", d="av. Sainte-Marguerite", c=99, m=None, u="promo 69"),
  dict(n="Expertise Beaute PROMO", d="", c=69, m=None, promo=True),
  dict(n="Pauline Holistic Massage", d="brak danych", c=160, m=90, u="prix barre 160, promo 140"),
  dict(n="Pauline Holistic Massage PROMO", d="", c=140, m=90, promo=True),
  dict(n="Camille Butet (osteopata!)", d="Cimiez", c=None, m=None, p=[(650, 5)], u="inny zawod, tylko pakiet"),
 ],
 "lpg": [
  dict(n="Body Tech", d="Musiciens", c=39, m=35, p=[(175, 5), (320, 10), (560, 20)]),
  dict(n="Endermospa", d="rue Bonaparte, Port", c=38, m=27.5, u="38-45 EUR, 25-30 min"),
  dict(n="Institut Rivoli", d="06000", c=60, m=40, p=[(460, 10)], u="bilan offert; czas pakietu niepewny"),
  dict(n="Silhouette & Care", d="rue Tiranty, centrum", c=45, m=25, u="20 min 35 EUR; cure 5+1 na wycene"),
  dict(n="Cellu06", d="rue Maraldi, Port", c=50, m=25, u="40 min 75, 50 min 90"),
  dict(n="Cybele Envie", d="06000", c=59, m=40),
  dict(n="My Private Wellness Corniche Fleurie", d="06200", c=60, m=30),
  dict(n="Elegance Academies Nice", d="brak danych", c=None, m=40, p=[(480, 10)], u="promo 432"),
  dict(n="Cannes Beautyfit (TLO)", d="Cannes", c=55, m=30, p=[(500, 10), (300, 6)], tlo=True),
 ],
 "rf": [
  dict(n="L'Institut Bien-etre", d="06000", c=53, m=25, p=[(238, 5)]),
  dict(n="Nice Derma Institut (RF+ultrasons)", d="06100", c=60, m=30, u="60 min 120"),
  dict(n="Flamingo Beauty (combo laser+kawitacja+RF)", d="rue de Maeyer, 06300", c=59, m=60, promo=True, p=[(225, 4)], u="seance decouverte"),
  dict(n="IDUUN Beauty (combo)", d="06200", c=139, m=105),
  dict(n="GLO Nail Care / Innov Institut (RF + oklad)", d="06000", c=69, m=50),
  dict(n="Fit Body Care Nice (gabinet lekarski)", d="06000", c=80, m=45),
  dict(n="Esthetique 06", d="Nice i Cannes", c=90, m=60, u="'a partir de', strona o twarzy"),
  dict(n="EstheClinic Cannes (TLO)", d="Cannes", c=150, m=30, tlo=True),
 ],
 "cryo": [  # cena = 1 zona, 1 sesja; pakiety = wiele stref (cena, liczba stref) lub serii
  dict(n="Centre Massena", d="rue Massena", c=179, m=60, p=[(320, 2), (450, 3)]),
  dict(n="Nevalis", d="Ginestiere, 06200", c=120, m=None, p=[(220, 2), (300, 3)]),
  dict(n="Invibes Beauty", d="06300", c=99, m=None, p=[(169, 2), (229, 3), (280, 4)]),
  dict(n="Aceso Technologie Esthetique", d="06300", c=300, m=None, p=[(550, 2), (700, 3)]),
  dict(n="Cryotera", d="brak danych", c=200, m=None, p=[(550, 3), (385, 2)], u="550 = 3 sesje 1 zona; 385 = 1 sesja 2 zony"),
  dict(n="Centre Laser Nice", d="brak danych", c=350, m=None, u="mala strefa; srednia 500, duza 650"),
  dict(n="Le 43 (medecine esthetique)", d="brak danych", c=240, m=None, p=[(340, 2)]),
  dict(n="Institut Kara PROMO", d="rue Clement Roassal", c=49, m=45, promo=True),
  dict(n="Samana Esthetique PROMO 8 stref", d="brak danych", c=400, m=90, promo=True, u="cena wystawiona 1200 za 8 stref"),
 ],
}

def staty(lista):
    lista = sorted(lista)
    return dict(n=len(lista), mediana=round(median(lista), 2), min=lista[0], max=lista[-1])

for zab, rek in DANE.items():
    nice = [r for r in rek if not r.get("tlo")]
    wyst = [r["c"] for r in nice if r.get("c") is not None and not r.get("promo")]
    za_min = [r["c"] / r["m"] for r in nice if r.get("c") and r.get("m") and not r.get("promo")]
    pak = [round(c / k, 2) for r in nice for (c, k) in r.get("p", [])]
    print(f"\n== {zab} ==")
    print(" sesja, cena wystawiona:", staty(wyst))
    if za_min:
        s = staty(za_min)
        print(" EUR za minute:", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in s.items()},
              "-> mediana za 60 min:", round(s["mediana"] * 60, 1), " za 30 min:", round(s["mediana"] * 30, 1))
    if pak:
        print(" za sesje (lub strefe) w pakiecie:", staty(pak), sorted(pak))
    med = median(wyst)
    print(f" wariant A (mediana -5..-10%): {med*0.90:.0f} .. {med*0.95:.0f} EUR;  wariant B (mediana): {med:.0f} EUR")
