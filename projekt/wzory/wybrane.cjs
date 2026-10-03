// Zrzuty 3 stron wybranych przez Daniela (03.10.2026), w kilku miejscach przewijania. Tylko do oglądania.
const { chromium } = require('D:/CLAUDE CODE/evolution-body-lab/node_modules/playwright-core');
const strony = { augustinus: 'https://augustinusbader.com/fr-eu', orchid: 'https://www.orchid.security/', jjettas: 'https://jjettas.com/', lando: 'https://landonorris.com/' };
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  for (const [n, u] of Object.entries(strony)) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
    try {
      await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 40000 });
      await p.waitForTimeout(7000);
      for (const t of ['Tout accepter', 'Accepter', 'Accept all', 'Accept', 'Allow all', 'OK']) {
        const k = p.getByRole('button', { name: t, exact: false }).first();
        if (await k.isVisible().catch(() => false)) { await k.click().catch(() => {}); break; }
      }
      await p.waitForTimeout(1500);
      const h = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let i = 0; i < 5; i++) {
        const y = Math.round(i * Math.max(0, h - 900) / 4);
        await p.mouse.wheel(0, y - await p.evaluate(() => scrollY));
        await p.waitForTimeout(2200);
        await p.screenshot({ path: `${__dirname}/${n}-${i}.png` });
      }
      console.log(n, 'OK wysokosc', h);
    } catch (e) { console.log(n, 'BLAD', e.message.split('\n')[0]); }
    await p.close();
  }
  await b.close();
})();
