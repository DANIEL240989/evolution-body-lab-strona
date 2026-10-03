// Analiza landonorris.com: biblioteki, sekcje, przejĹ›cia, nagranie przewijania. Tylko do nauki ruchu, nic nie kopiujemy.
const { chromium } = require('D:/CLAUDE CODE/evolution-body-lab/node_modules/playwright-core');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const skrypty = [];
  p.on('response', r => { const u = r.url(); if (/\.(js|mjs)(\?|$)/.test(u)) skrypty.push(u); });
  await p.goto('https://landonorris.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(8000);
  const info = await p.evaluate(() => {
    const g = (k) => typeof window[k] !== 'undefined';
    const sekcje = [...document.querySelectorAll('section, [class*=section], main > div')].slice(0, 40).map(e => ({
      tag: e.tagName, klasa: (e.className + '').slice(0, 80), h: Math.round(e.getBoundingClientRect().height),
      tlo: getComputedStyle(e).backgroundColor, tekst: (e.innerText || '').trim().slice(0, 80).replace(/\s+/g, ' ')
    }));
    const fonty = [...new Set([...document.querySelectorAll('h1,h2,h3,p,a')].slice(0, 200).map(e => getComputedStyle(e).fontFamily))];
    return { globals: { gsap: g('gsap'), ScrollTrigger: g('ScrollTrigger'), Lenis: g('Lenis') || g('lenis'), THREE: g('THREE'), barba: g('barba'), webflow: g('Webflow') },
      canvas: document.querySelectorAll('canvas').length, video: document.querySelectorAll('video').length,
      wysokosc: document.documentElement.scrollHeight, fonty, sekcje };
  });
  // powolne przewijanie do koĹ„ca (nagrywa siÄ™ wideo) + klatki co ~1/3 ekranu
  const h = info.wysokosc; let i = 0;
  for (let y = 0; y < h; y += 300) { await p.mouse.wheel(0, 300); await p.waitForTimeout(450); await p.screenshot({ path: `${__dirname}/lando-k${String(i++).padStart(2, '0')}.png` }); }
  info.skrypty = [...new Set(skrypty)].map(u => u.split('?')[0]).slice(0, 40);
  fs.writeFileSync(__dirname + '/lando-analiza.json', JSON.stringify(info, null, 1));
  await ctx.close(); await b.close();
  console.log('OK klatek', i, 'canvas', info.canvas, 'video', info.video, JSON.stringify(info.globals));
})();

