// Connect vào Chrome đang chạy ở CDP 9222 và dump state trang hiện tại.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'test-results', 'explore');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  const data = await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"], dialog')).map((d) => ({
      tag: d.tagName.toLowerCase(),
      aria: d.getAttribute('aria-label'),
      labelledby: d.getAttribute('aria-labelledby'),
      classes: d.className.toString().slice(0, 200),
      innerText: d.innerText.slice(0, 500),
      outer: d.outerHTML.slice(0, 2000),
      buttons: Array.from(d.querySelectorAll('button')).map((b) => ({
        text: (b.innerText || '').trim().slice(0, 80),
        aria: b.getAttribute('aria-label'),
        disabled: b.disabled,
      })),
    }));

    const allBtns = Array.from(document.querySelectorAll('button'))
      .map((b) => ({
        text: (b.innerText || '').trim().slice(0, 80),
        aria: b.getAttribute('aria-label'),
        disabled: b.disabled,
      }))
      .filter((x) => x.text || x.aria);

    return {
      url: location.href,
      title: document.title,
      dialogs,
      buttons: allBtns.slice(0, 30),
    };
  });

  fs.writeFileSync(
    path.join(OUT_DIR, 'current-modal.json'),
    JSON.stringify(data, null, 2),
    'utf-8'
  );
  await page.screenshot({ path: path.join(OUT_DIR, 'current-modal.png'), fullPage: true });

  console.log('Dumped to', path.join(OUT_DIR, 'current-modal.json'));
  await browser.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
