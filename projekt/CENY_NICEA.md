# Ceny rynkowe w Nicei: drenaż, LPG, radiofrekwencja, kriolipoliza

Sprawdzone: **03.10.2026**. Przygotował: skarbnik projektu (Claude).
Obliczenia: `projekt/ceny_nicea.py` (uruchom `python3 projekt/ceny_nicea.py`).

**To jest propozycja do decyzji Moniki, nie cena na stronę.** Strona zostaje bez cen, dopóki Monika ich nie zatwierdzi.

## Jak zebrano dane (ważne zastrzeżenie)

W tej chmurze strony planity.com, treatwell.fr i wszystkie strony gabinetów, a także legifrance.gouv.fr
i service-public.fr są zablokowane (sprawdzone: WebFetch i curl zwracają blokadę). **Żadnej strony z cennikiem
nie udało się otworzyć.** Wszystkie liczby pochodzą z wyników wyszukiwarki (opisy stron w wynikach),
czyli: „z wyników wyszukiwania, strona nieotwarta”. Przed decyzją warto, żeby Daniel lub Monika otworzyli
3-4 linki z każdej tabeli u siebie i potwierdzili ceny. Gdzie dwa wyniki się różniły, piszę to w uwagach.

Oznaczenia: **W** = cena wystawiona (katalogowa), **P** = promocja / séance découverte / cena przekreślona.
Do median wchodzą tylko ceny W z Nicei. Cannes jako tło, poza medianą.

---

## 1. Drenaż limfatyczny manualny (Nicea)

| Gabinet | Dzielnica / adres | Sesja | Czas | Pakiet | Uwagi | Źródło |
|---|---|---|---|---|---|---|
| Green Beauty Center | Carabacel | 69,90 € W | 60 min | brak danych | | [Treatwell, drenaż Nicea](https://www.treatwell.fr/salons/soin-drainage-lymphatique/offre-type-local/dans-nice-france-2/) |
| V Esthetic | Cœur de Nice | 120 € W | 75 min | brak danych | „corps entier” | jw. |
| Fyna madero | Saint-Roch | 80 € W | 60 min | brak danych | | jw. |
| Blissful Body | Vieux-Nice | 150 € W | 60 min | brak danych | metoda Renata França | jw. |
| Luxa Beauté | Carabacel | 90 € W | 45 min | brak danych | corps entier | jw. |
| Institut Leda | rue de France | od 88 € W | 60 min | brak danych | inny wynik podaje 120 €; niepewne | jw. |
| BeautyfaceByLara | Fabron | od 58,50 € W | 60 min | brak danych | metoda Vodder; „dès” może być promocją | jw. |
| Patrick Helfer | 11 rue Alexandre Mari, 06300 | 120 € W | 60 min | brak danych | 1h30: 160 €, 2h: 200 €; praktyk wellness, nie kinezyterapeuta | [Planity](https://www.planity.com/patrick-helfer-drainage-lymphatique-06300-nice) |
| Lymphatika by Centre Clémenceau | 4 av. Georges Clemenceau | 140 € W | 75 min | brak danych | nogi 60 min: 90 €, brzuch 30 min: 50 € | [Planity](https://www.planity.com/lymphatika-by-centre-clemenceau-06000-nice) |
| Marine, Drainage Lymphatique | 22 av. Buenos Ayres | 130-150 € W | 80 min | brak danych | | [Planity](https://www.planity.com/marine-drainage-lymphatique-maderotherapie-vacuslim-06000-nice) |
| Aesthetic Expert Nice | 06000 | 90 € W | 60 min | brak danych | | [Planity](https://www.planity.com/aesthetic-expert-nice-06000) |
| Expertise Beauté | 40 av. Sainte-Marguerite, 06200 | 99 € W / 69 € P | brak danych | brak danych | promocja | [Planity](https://www.planity.com/expertise-beaute-06200-nice) |
| Perle de beauté | brak danych | 99 € W | 90 min | 5 × 90 min: 460 € (92 €/sesja); ventre-jambes 55 min 5×: 290 € | | z wyników wyszukiwania (Treatwell) |
| Sereny'Ti | 7 av. Teiras, 06300 | od 75 € W | 60 lub 90 min | brak danych | | [Funbooker](https://www.funbooker.com/fr/annonce/massage-drainant-a-nice-06/voir) |
| Drainessence | brak danych | 65 € W | 60 min | brak danych | protokoły specjalne 75-95 € | [drainessence.fr](https://drainessence.fr/) |
| ClaraNaturo | brak danych | 75 € W (Vodder) | brak danych | Renata França 5×: 650 € (130 €/sesja) | Renata França 1 sesja: 150 € | [claranaturo.com](https://claranaturo.com/drainages-lymphatiques/) |
| Body Tech | Musiciens | 80 € W | 60 min | 10×: 680 € (68 €/sesja) | drenaż pooperacyjny | [body-tech.fr/tarifs](https://body-tech.fr/tarifs) |
| Pauline Holistic Massage | brak danych | 160 € W / 140 € P | 90 min | brak danych | metoda brazylijska, cena przekreślona | z wyników wyszukiwania (Treatwell) |
| Camille Butet | Cimiez | brak danych | brak danych | 5×: 650 € (130 €/sesja) | **osteopata**, inny zawód, tylko jako tło | [osteobutetnice.fr](https://www.osteobutetnice.fr/drainage-lympathique) |

**Wynik skryptu (Nicea, ceny W):** 18 gabinetów, sesja: mediana **90 €**, min 58,50 €, max 160 €.
Za minutę: mediana 1,48 €/min, czyli ok. **89 € za 60 min**. W pakiecie: mediana 111 €/sesja (tylko 4 pakiety,
z czego dwa to Renata França i osteopata; za mało danych, żeby wyciągać wnioski o rabacie).

## 2. Endermologia LPG (Cellu M6 Alliance / Infinity), ciało (Nicea)

| Gabinet | Dzielnica / adres | Sesja | Czas | Pakiet | Uwagi | Źródło |
|---|---|---|---|---|---|---|
| Body Tech | Musiciens | 39 € W | 35 min | 5×: 175 € (35); 10×: 320 € (32); 20×: 560 € (28) | | [body-tech.fr/cellu-m6](https://body-tech.fr/cellu-m6) |
| Endermospa | 49 rue Bonaparte, 06300 (Port) | 38-45 € W | 25-30 min | brak danych | Cellu M6 Infinity | [Planity](https://www.planity.com/endermospa-06300-nice) |
| Institut Rivoli | 06000 | 60 € W | 40 min | 10×: 460 € (46), **bilan offert** | detox 30 min: 45 €; jeden wynik podaje 60 € za 30 min, niepewne; czas sesji w pakiecie brak danych | [institutrivoli.fr](https://www.institutrivoli.fr/endermologie-lpg-alliance) |
| Silhouette & Care | 4 rue Emma et Philippe Tiranty, 06000 | 45 € W | 25 min | cure 5 + 1 gratis: na wycenę | 20 min: 35 €; konsultacja gratis | [Planity](https://www.planity.com/silhouette-care-06300-nice) |
| Cellu06 | 17 rue Maraldi, 06300 (Port) | 50 € W | 25 min | brak danych | 40 min: 75 €, 50 min: 90 € | [Planity](https://www.planity.com/cellu06-06300-nice) |
| Cybele Envie | 06000 | 59 € W | 40 min | brak danych | | [Planity](https://www.planity.com/cybele-envie-06000-nice) |
| My Private Wellness, Corniche Fleurie | 06200 | 60 € W | 30 min | brak danych | 20 min: 40 € | [Planity](https://www.planity.com/my-private-wellness-06200-nice) |
| Elegance Académies Nice | brak danych | brak danych | 40 min | 10×: 480 € W (48) / 432 € P | ważne 1 rok; endermowear 30 € | [elegance.fr](https://www.elegance.fr/produit/10-seances-cellu-m6-corps/) |
| Tło: Cannes Beautyfit | Cannes | 55 € W | 30 min | 6×: 300 €; 10×: 500 € (50) | 20 min: 50 €, 10×: 450 € | [cannes-beautyfit.com](https://www.cannes-beautyfit.com/lpg-endermologie-cellu-m6-alliance) |

Dodatkowo: w wynikach pojawia się „séance découverte” 20 min za 25-30 € (nazwa gabinetu niepewna) i strój
endermowear płatny osobno (20-30 €), w niektórych miejscach wliczony w kurację.

**Wynik skryptu:** 7 gabinetów, sesja: mediana **50 €** (min 38, max 60), ale czasy różne (25-40 min).
Za minutę: mediana 1,50 €/min, czyli ok. **45 € za 30 min**. W pakiecie: mediana **35 €/sesja** (28-48 €).

## 3. Radiofrekwencja ciała (Nicea)

Uwaga: w Nicei radiofrekwencja ciała rzadko jest sprzedawana „solo”; często w kombinacji z kawitacją,
lipolaserem, vacuum lub okładem. Porównanie jest przez to mniej czyste niż przy LPG.

| Gabinet | Dzielnica / adres | Sesja | Czas | Pakiet | Uwagi | Źródło |
|---|---|---|---|---|---|---|
| L'Institut Bien-être | 06000 | 53 € W | 25 min | 5×: 238 € (47,60) | 1 strefa; jest też séance découverte po obniżonej cenie (kwota brak danych) | [Planity](https://www.planity.com/linstitut-bien-etre-06000-nice) |
| Nice Derma Institut | 06100 | 60 € W | 30 min | brak danych | RF + ultradźwięki; 45 min: 90 €, 60 min: 120 € | [Planity](https://www.planity.com/nice-derma-institut-06100) |
| Flamingo Beauty | 6 rue de Maeyer, 06300 | 59 € P | 60 min | 4×: 225 € (56,25) | séance découverte, 1 strefa, lipolaser + kawitacja + RF | [flamingobeauty.fr](https://www.flamingobeauty.fr/institut-de-beaute-nice/services/soins-du-corps/soins-minceur-lipocavitation-radiofrequence.html) |
| IDUUN Beauty | 06200 | 139 € W | 105 min | brak danych | pełny protokół: diagnoza, manualne, RF, vacuum/ultradźwięki | [Planity](https://www.planity.com/iduun-beauty-06200-nice) |
| GLO Nail Care / Innov Institut | 06000 | 69 € W | 50 min | brak danych | RF + okład na cellulit | [Planity](https://planity.com/innov-institut-cryolipolyse-microneedling-epilations-laser-radiofrequence-06000-nice) |
| Fit Body Care Nice | 06000 | 80 € W | 45 min | brak danych | **gabinet lekarski** (dr Camille Paturaud), nogi | [Planity](https://www.planity.com/fit-body-care-nice-dr-camille-paturaud-06000) |
| Esthétique 06 | Nicea i Cannes | od 90 € W | 60 min | brak danych | strona dotyczy technik twarzy, niepewne czy ciało | [esthetique06.fr](https://esthetique06.fr/les-techniques/techniques-pour-les-soins-du-visage/radio-frequence-nice-cannes/) |
| Tło: Body Tech | Musiciens | 49 € (twarz) | 30 min | 5×: 229 €; 10×: 449 € | tylko twarz, poza medianą | [body-tech.fr](https://body-tech.fr/radiofrequence/) |
| Tło: EstheClinic Cannes | Cannes | 150 € W | 30 min | brak danych | klinika | [Planity](https://www.planity.com/estheclinic-cannes-06400) |

**Wynik skryptu:** 6 cen W, sesja: mediana **74,50 €** (53-139 €). Za minutę: mediana 1,64 €/min,
czyli ok. **49 € za 30 min**. Pakiety: tylko 2 (47,60 i 56,25 €/sesja), za mało na wniosek.

## 4. Kriolipoliza (Nicea), cena za 1 strefę, 1 sesję

| Gabinet | Dzielnica / adres | 1 strefa | Czas | Więcej stref / seria | Uwagi | Źródło |
|---|---|---|---|---|---|---|
| Centre Masséna | 3 rue Masséna, 06000 | 179 € W | 60 min | 2 strefy: 320 €; 3: 450 € | „cryo 360°”; ta sama siatka cen co cryolipolyse-nice.fr (prawdopodobnie ten sam gabinet, liczony raz) | [Planity](https://www.planity.com/centre-massena-cryolipolyse-amincissement-ems-electrostimulation-06000-nice) |
| Nevalis | 299 ch. de la Ginestière, 06200 | 120 € W | brak danych | 2: 220 €; 3: 300 € | | [Planity](https://www.planity.com/nevalis-epilation-laser-centre-minceur-06200-nice) |
| Invibes Beauty | 06300 | 99 € W | brak danych | 2: 169 €; 3: 229 €; 4: 280 € | | [Planity](https://www.planity.com/invibes-beauty-06300-nice) |
| Acéso Technologie Esthétique | 06300 | 300 € W | brak danych | 2: 550 €; 3: 700 € | 2 aplikatory: 350 € | [Planity](https://www.planity.com/aceso-technologie-esthetique-06300-nice) |
| Cryotera | brak danych | 200 € W | brak danych | 3 sesje 1 strefa: 550 €; 1 sesja 2 strefy: 385 € | | [cryotera.fr](https://cryotera.fr/blog/centre-cryolipolyse-nice) |
| Centre Laser Nice | brak danych | 350 € W (mała) | brak danych | średnia 500 €, duża 650 € | | [centrelasernice.fr](https://www.centrelasernice.fr/silhouette/cryolipolyse/) |
| Le 43 | brak danych | 240 € W | brak danych | 2 strefy: 340 € | **médecine esthétique** (gabinet lekarski) | [nice-cryolipolyse.com](https://nice-cryolipolyse.com/prix-et-tarifs/) |
| Institut Kara | 18 rue Clément Roassal, 06000 | 49 € P | 45 min | brak danych | promocja wyprzedażowa | [Planity](https://www.planity.com/institut-kara-06000-nice) |
| Samana Esthétique | brak danych | 400 € P za 8 stref | 90 min | cena wystawiona 1200 € | promocja | [samana-esthetique.com](https://www.samana-esthetique.com/page-d-articles/promotion-cryolipolyse-nice) |
| Esthemed Nice | brak danych | 49 € P | brak danych | brak danych | tylko tytuł strony „Cryolipolyse Nice 49€” | [esthemed-nice.com](https://www.esthemed-nice.com/cryolipolyse-49euros-nice-cryo) |

**Wynik skryptu:** 7 cen W, 1 strefa: mediana **200 €** (99-350 €). Cena za strefę przy kilku strefach lub
w serii: mediana 155 € (70-275 €). Rynek jest mocno rozbity promocjami (49 €).

---

## 5. Propozycja „à partir de” (do decyzji Moniki, nie na stronę)

Liczone skryptem z median cen wystawionych w Nicei. Wariant A = mediana minus 5-10%, zaokrąglone.
Wariant B = mediana.

| Zabieg | Podstawa | A: wejście na rynek | B: premium (mediana) |
|---|---|---|---|
| Drenaż manualny, 60 min | mediana 90 €/sesja, 89 €/60 min | **od 80-85 €** | **od 90 €** |
| LPG ciało, 30 min | mediana 45 €/30 min; pakiet 35 €/sesja | **od 42 €**; 10 sesji ok. 360-380 € | **od 45-50 €**; 10 sesji ok. 400-450 € |
| Radiofrekwencja ciała, 30 min | mediana 49 €/30 min (74,50 €/sesja, różne czasy) | **od 45 €** | **od 50 €** |
| Kriolipoliza, 1 strefa | mediana 200 € | **nie proponuję ceny, patrz punkt 6** | jw. |

Pakiety LPG w wariantach to moja propozycja z rabatu widocznego u Body Tech (10× = 82% ceny pojedynczej)
i Rivoli (10× = 77%); dla drenażu i radiofrekwencji danych o pakietach jest za mało (2-4 pakiety).

**Wariant A, za:** łatwiej zdobyć pierwsze klientki w mieście, gdzie są oferty po 49-59 € „découverte”.
**Wariant A, przeciw:** marka wygląda luksusowo, a cena poniżej mediany może wyglądać na niezgodną
z wyglądem; podnieść cenę później jest trudniej niż obniżyć promocją.

**Wariant B, za:** spójne z marką premium i nadal w środku rynku, nie na górze (górę trzymają Renata França
po 150 € i gabinety lekarskie). **Wariant B, przeciw:** nowy gabinet bez opinii nie ma jeszcze argumentu
„dlaczego u was, a nie w Body Tech za 39 €”; potrzebny wtedy np. bilan gratis albo pierwsza sesja taniej.

Rynek w Nicei często daje: bilan / konsultację gratis (Rivoli, Silhouette & Care), „séance découverte”
(Flamingo 59 €, LPG 25-30 €), pakiet 5 + 1 gratis (Silhouette & Care), ważność pakietu 1 rok (Elegance).

---

## 6. Co jest wymagane prawnie we Francji (stan na 03.10.2026)

Źródła oficjalne były zablokowane do otwarcia; poniżej to, co podają wyniki wyszukiwania z tych źródeł.
Przed publikacją oferty dobrze, żeby to przejrzał prawnik albo izba rzemieślnicza (CMA 06).

**a) Kwalifikacja esthéticienne (CAP).** Usługi estetyczne „inne niż medyczne i paramedyczne” oraz
„modelages esthétiques de confort sans finalité médicale” może wykonywać tylko osoba z kwalifikacją
(co najmniej CAP Esthétique cosmétique parfumerie, BP, bac pro lub BTS, albo równoważny tytuł z RNCP)
lub pod jej „contrôle effectif et permanent”. Podstawa: art. 16 ustawy nr 96-603 z 5.07.1996 i dekret
98-246 z 2.04.1998 (dziś art. L121-1 code de l'artisanat).
Źródła: [DGCCRF, FAQ soins esthétiques](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/faq-encadrement-des-soins-esthetiques-et-de-la-coiffure),
[INPI, institut de beauté](https://www.inpi.fr/annuaire-activites-et-professions/institut-de-beaute-estheticien),
[France compétences, CAP ECP RNCP39030](https://www.francecompetences.fr/recherche/rncp/39030/).
**Do sprawdzenia: jaki dyplom ma Monika i czy jest uznawany we Francji.** To warunek dla wszystkich czterech zabiegów.

**b) Kriolipoliza: wysokie ryzyko, w praktyce akt lekarski.**
- Arrêté z 6.01.1962, art. 2: tylko lekarze mogą wykonywać „tout acte de physiothérapie aboutissant à la
  destruction si limitée soit-elle des téguments, et notamment la cryothérapie”.
  [Légifrance, art. 2](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000049595364)
- **Cour de cassation, chambre criminelle, 31.01.2023, nr 22-83.399:** utrzymane skazanie lekarza za
  współudział w nielegalnym wykonywaniu medycyny, bo sprzedał aparat do kriolipolizy i szkolił salon
  kosmetyczny; sąd uznał kriolipolizę za krioterapię zastrzeżoną dla lekarzy.
  [MACSF](https://www.macsf.fr/responsabilite-professionnelle/analyse-de-decisions/cryolipolyse-et-micro-needling-medecin-condamne),
  [Care & Law, 21.02.2023](https://careandlaw.com/2023/02/21/cryolipolyse-et-micro-needling-exercice-illegal-de-la-medecine/)
- Cour de cassation, crim., 10.05.2022 (krioterapia ogólnoustrojowa): instytuty kosmetyczne nie mogą jej
  wykonywać nawet „de confort”. [service-public.fr A15796](https://www.service-public.gouv.fr/particuliers/actualites/A15796)
- HAS 2018 zaleca „encadrement renforcé” z powodu powikłań (oparzenia, przebarwienia, hiperplazja paradoksalna).
  [HAS](https://www.has-sante.fr/jcms/c_2872741/en/cryolipolyse-a-visee-esthetique-la-has-preconise-un-encadrement-renforce);
  pytanie poselskie nr 4958 (JO 11.03.2025) o regulację kriolipolizy:
  [Assemblée nationale](https://questions.assemblee-nationale.fr/q17/17-4958QE.htm) (odpowiedź ministra: brak danych).
- Wniosek: mimo że wiele gabinetów w Nicei ją oferuje, **dla esthéticienne kriolipoliza to ryzyko zarzutu
  „exercice illégal de la médecine”**. Rekomendacja skarbnika: nie pokazywać jej na stronie i nie kupować
  aparatu na kredyt, dopóki prawnik nie potwierdzi inaczej.

**c) Radiofrekwencja ciała: szara strefa, raczej dopuszczalna w wersji nieinwazyjnej.**
- Dekret 2011-382 zakazał technik lipolizy; Conseil d'État 17.02.2012 (nr 349431) unieważnił art. 2, który
  obejmował nieinwazyjne techniki zewnętrzne (lasery, radiofrekwencja, ultradźwięki, podczerwień); utrzymał
  zakaz technik inwazyjnych. [APHP](https://affairesjuridiques.aphp.fr/textes/conseil-detat-17-fevrier-2012-n-349431-actes-a-visee-esthetique-reglementation/),
  [HAS](https://www.has-sante.fr/jcms/c_1045952/en/decret-du-11/04/2011-relatif-a-l-interdiction-de-la-pratique-d-actes-de-lyse-adipocytaire-a-visee-esthetique-l-article-2-a-ete-annule-suite-a-la-decision-du-conseil-d-etat-du-17-fevrier-2012).
- Brak przepisu, który wprost pozwala lub zabrania esthéticienne radiofrekwencji nieinwazyjnej. Branża (CNAIB-SPA)
  uznaje ją za dostępną dla esthéticienne; radiofrekwencja z mikroigłami (przerwanie skóry) jest aktem lekarskim.
  Aparaty RF do modelowania sylwetki są w aneksie XVI rozporządzenia UE 2017/745 (MDR), więc sprzęt musi
  spełniać te wymogi (CE). [CNAIB, MDR aneks XVI](https://www.cnaib.fr/ce-medical/)
- Ryzyko: arrêté 1962 zastrzega dla lekarzy akty, które niszczą tkanki; jeśli RF jest reklamowana jako
  „destruction des graisses”, zbliża się do tej granicy. Na stronie: „raffermissement”, „soin remodelant”,
  bez „détruit les graisses”, „lipolyse”.
- W parlamencie trwają prace nad definicją „soins esthétiques” (projekt ustawy nr 1732 z 11.07.2025;
  pytania poselskie 5887, 6236; Senat 2025). Stan uchwalenia na dziś: brak danych.
  [AN, PPL 1732](https://www.assemblee-nationale.fr/dyn/17/textes/l17b1732_proposition-loi.pdf),
  [Senat, définition juridique des soins esthétiques](https://www.senat.fr/questions/base/2025/qSEQ250604934.html)

**d) Drenaż limfatyczny: nazwa ma znaczenie.**
- Masaż jest zastrzeżony dla masseur-kinésithérapeute (art. L4321-1 CSP); art. R4321-3 definiuje masaż
  jako manewr zewnętrzny „à des fins thérapeutiques ou non”, ręcznie lub aparatem (poza elektroterapią);
  drenaż limfatyczny manualny na receptę wymieniony jest w aktach kinezyterapeuty.
  [Kodeks, tekst przez Ordre MK](https://www.ordremk.fr/wp-content/uploads/2017/05/code-de-la-sante-publique-_-legifrance-articles-r4321-1-a-r4321-145.pdf)
- Odpowiedź ministra na pytanie poselskie (11. kadencja, nr 25040): monopol nie narusza działalności
  esthéticienne, gdy cel jest wyłącznie estetyczny, bez celu terapeutycznego, **i nazwa usługi nie myli się
  z drenażem limfatycznym manualnym zastrzeżonym dla kinezyterapeutów**.
  [Assemblée nationale, QE 11-25040](https://questions.assemblee-nationale.fr/q11/11-25040QE.htm)
  (stara odpowiedź; czy nadal tak interpretowana: niepewne).
- Wniosek: dla Moniki bezpieczniej „modelage drainant esthétique” / „soin drainant” zamiast
  „drainage lymphatique manuel”, „massage” i bez obietnic medycznych (obrzęki pooperacyjne, lipoedème,
  limfoedème to domena kinezyterapeuty na receptę). W Nicei wiele instytutów używa jednak nazwy
  „drainage lymphatique”; to praktyka rynku, nie dowód, że jest bezpieczna.

**e) LPG endermologia.** Aparat mechaniczny (podciśnienie + rolki). Esthéticienne stosują go jako
„modelage” / „soin” w ramach CAP; definicja masażu w R4321-3 obejmuje jednak także masaż aparatem, więc
to samo zastrzeżenie co przy drenażu: nazwa „soin/modelage LPG”, nie „massage”, bez celu leczniczego.
Bezpośredniego orzeczenia o LPG u esthéticienne: brak danych.

---

## 7. Czego nie udało się ustalić

- Żaden cennik nie został otwarty bezpośrednio (blokada sieci); wszystko z opisów w wynikach wyszukiwarki.
- Pakiety drenażu i radiofrekwencji: tylko 2-4 pakiety, za mało na rzetelną medianę rabatu.
- Kilka adresów i dzielnic: brak danych (Perle de beauté, Drainessence, ClaraNaturo, Cryotera, Centre Laser Nice, Le 43, Samana).
- Institut Leda (88 € czy 120 €) i Institut Rivoli (60 € za 30 czy 40 min): sprzeczne wyniki.
- Antibes: brak danych (nie znalazłem cenników z Antibes); Cannes tylko 2 punkty tła.
- Czy odpowiedź ministra na pytanie 4958 o kriolipolizę została opublikowana: brak danych.
- Status ustawy o definicji „soins esthétiques” na dziś: brak danych.
