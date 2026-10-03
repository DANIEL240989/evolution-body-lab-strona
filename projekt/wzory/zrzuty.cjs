// Zrzuty stron-wzorów (tylko do oglądania, nic nie kopiujemy). Uruchom: node zrzuty.cjs
const { chromium } = require('D:/CLAUDE CODE/evolution-body-lab/node_modules/playwright-core');
const strony = {
  skinney: 'https://skinneymedspa.com', aesop: 'https://www.aesop.com/fr/fr/', lamer: 'https://www.cremedelamer.fr/',
  sisley: 'https://www.sisley-paris.com/fr-fr/', guerlain: 'https://www.guerlain.com/fr/fr-fr/', miumiu: 'https://www.miumiu.com/fr/fr.html',
  byredo: 'https://www.byredo.com/fr_fr/', augustinus: 'https://www.augustinusbader.com/fr/', lusion: 'https://lusion.co',
  aman: 'https://www.aman.com/spa', sixsenses: 'https://www.sixsenses.com/en/spas', cheval: 'https://www.chevalblanc.com/fr/maison/paris/'
};
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  for (const [n, u] of Object.entries(strony)) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
    try {
      await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await p.waitForTimeout(6000);
      for (const t of ['Tout accepter', 'Accepter', 'Accept all', 'Accept', 'J\'accepte', 'OK']) {
        const k = p.getByRole('button', { name: t, exact: false }).first();
        if (await k.isVisible().catch(() => false)) { await k.click().catch(() => {}); break; }
      }
      await p.waitForTimeout(2500);
      await p.screenshot({ path: `${__dirname}/${n}.png` });
      console.log(n, 'OK');
    } catch (e) { console.log(n, 'BLAD', e.message.split('\n')[0]); }
    await p.close();
  }
  await b.close();
})();
