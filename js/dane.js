// Dane gabinetu w JEDNYM miejscu. Wszystko z dopiskiem TEST to dane pokazowe:
// przed publikacją podmień je na prawdziwe (narzedzia/sprawdz_publikacje.mjs blokuje wydanie, jeśli zostanie TEST).
window.EBL = {
  nazwa: 'Evolution Body Lab',
  osoba: 'Monika Marek',   // z dokumentu od Daniela 03.10.2026
  telefon: '+33000000000',          // TEST
  telefonTekst: '00 00 00 00 00 (TEST)',
  whatsapp: '+33000000000',         // TEST
  email: 'contact@exemple.test',    // TEST
  adres: 'Nice 06300 · adresse précise communiquée à la réservation',   // TEST: do czasu lokalu bez ulicy (Daniel 03.10.2026: nie pokazujemy adresu domowego). Podmień na adres lokalu.
  siret: '000 000 000 00000 (TEST)',
  forma: 'EI (TEST)',
  // Godziny: pon-pt 9:00-19:00, ostatnia wizyta 18:00 (ustalone z Danielem 02.10.2026)
  godziny: { dni: [1, 2, 3, 4, 5], od: '09:00', do: '19:00', ostatnia: '18:00' },
  rezerwacjeOnline: false,          // wersja pokazowa: rezerwacje wyłączone
  // Zabiegi: PRZYKŁADY do zastąpienia listą Moniki (nazwa, urządzenie, czas, cena, seria).
  zabiegi: [
    { id: 'drainage', czas: 60, cena: null, seria: null, test: true },
    { id: 'lpg', czas: 35, cena: null, seria: null, test: true },
    { id: 'radiofrequence', czas: 45, cena: null, seria: null, test: true },
    { id: 'cryo', czas: 75, cena: null, seria: null, test: true }
  ],
  przedPo: [],   // tylko prawdziwe zdjęcia klientek z pisemną zgodą; pusto = sekcja ukryta
  opinie: []     // tylko prawdziwe opinie z Google; pusto = sekcja ukryta
};
