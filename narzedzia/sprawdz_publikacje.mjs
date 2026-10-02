// Blokuje publikację, dopóki w danych lub tekstach zostało TEST albo rezerwacje są wyłączone.
// Uruchom: node narzedzia/sprawdz_publikacje.mjs  (kod 1 = NIE publikować)
import { readFileSync } from 'node:fs';
const pliki = ['js/dane.js', 'js/teksty.js', 'index.html', 'robots.txt'];
const bledy = [];
for (const p of pliki) {
  const t = readFileSync(new URL('../' + p, import.meta.url), 'utf8');
  t.split('\n').forEach((l, i) => { if (/\bTEST\b|exemple\.test|noindex|Disallow: \//.test(l) && !l.trim().startsWith('//')) bledy.push(`${p}:${i + 1}: ${l.trim()}`); });
}
if (bledy.length) { console.error('NIE PUBLIKOWAĆ, zostały dane testowe:\n' + bledy.join('\n')); process.exit(1); }
console.log('OK: brak danych testowych.');
