// Script login thủ công. Thay vì để Playwright launch Chrome (Shopify phát hiện automation
// và chặn submit ở bước email), script tự spawn Chrome với --remote-debugging-port rồi
// dùng chromium.connectOverCDP để attach. Chrome spawn kiểu này không có cờ
// --enable-automation và rất ít footprint Playwright, Shopify coi gần như user thật.
//
// Chạy: npm run login
// Script tự động lưu session khi phát hiện bạn đã vào được trang app (không cần bấm Enter).

const { chromium } = require('@playwright/test');
const { spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

const ROOT = path.join(__dirname, '..');
const USER_DATA_DIR = path.join(ROOT, '.auth-profile');
const AUTH_FILE = path.join(ROOT, 'user.json');
const TARGET_URL = 'https://admin.shopify.com/store/dev-feed17/apps/feed-data-by-omega';
const SUCCESS_URL_REGEX = /admin\.shopify\.com\/store\/dev-feed17\/apps\/feed-data-by-omega/;
const LOGIN_TIMEOUT_MS = 10 * 60 * 1000;
const CDP_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${CDP_PORT}`;

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe')
    : null,
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    'Không tìm thấy chrome.exe. Cài Google Chrome hoặc chỉnh CHROME_CANDIDATES trong script.'
  );
}

function waitForPort(port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tryOnce = () => {
      const sock = net
        .createConnection({ host: '127.0.0.1', port })
        .once('connect', () => {
          sock.end();
          resolve();
        })
        .once('error', () => {
          sock.destroy();
          if (Date.now() > deadline) {
            reject(new Error(`CDP port ${port} không sẵn sàng sau ${timeoutMs}ms`));
          } else {
            setTimeout(tryOnce, 300);
          }
        });
    };
    tryOnce();
  });
}

function killChromeTree(pid) {
  if (!pid) return;
  try {
    execFile('taskkill', ['/F', '/T', '/PID', String(pid)], () => {});
  } catch (_) {
    // ignore
  }
}

function sanitizeChromeState() {
  const prefsPath = path.join(USER_DATA_DIR, 'Default', 'Preferences');
  if (fs.existsSync(prefsPath)) {
    try {
      const prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf-8'));
      if (prefs.profile) {
        prefs.profile.exit_type = 'Normal';
        prefs.profile.exited_cleanly = true;
      }
      fs.writeFileSync(prefsPath, JSON.stringify(prefs));
    } catch (_) {}
  }
  const victims = [
    path.join(USER_DATA_DIR, 'Default', 'Last Session'),
    path.join(USER_DATA_DIR, 'Default', 'Last Tabs'),
    path.join(USER_DATA_DIR, 'Default', 'Current Session'),
    path.join(USER_DATA_DIR, 'Default', 'Current Tabs'),
  ];
  for (const f of victims) {
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {}
  }
  const sessionsDir = path.join(USER_DATA_DIR, 'Default', 'Sessions');
  if (fs.existsSync(sessionsDir)) {
    try { fs.rmSync(sessionsDir, { recursive: true, force: true }); } catch (_) {}
  }
}

(async () => {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }
  sanitizeChromeState();

  const chromePath = findChrome();
  const chromeArgs = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-blink-features=AutomationControlled',
    '--hide-crash-restore-bubble',
    '--restore-last-session=false',
    TARGET_URL,
  ];

  const chromeProc = spawn(chromePath, chromeArgs, {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  });
  chromeProc.unref();

  try {
    await waitForPort(CDP_PORT, 20_000);
  } catch (err) {
    console.error(err.message);
    killChromeTree(chromeProc.pid);
    process.exit(1);
  }

  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0] || (await browser.newContext());

  const page = context.pages()[0] || (await context.newPage());
  // Đảm bảo tab đang ở TARGET_URL (Chrome có thể đã navigate, nhưng nếu user mở tab trắng thì goto lại)
  if (!/admin\.shopify\.com/.test(page.url())) {
    await page.goto(TARGET_URL).catch(() => {});
  }

  console.log(
    '\n============================================================\n' +
      '>>> Chrome mở trang app. Script sẽ tự click Install nếu cần.\n' +
      '>>> Nếu bị redirect về login, hãy login thủ công:\n' +
      '    Email -> Continue -> Password -> Continue -> Verify code -> Login\n' +
      `>>> Session được lưu khi app thực sự installed: ${TARGET_URL}\n` +
      '============================================================\n'
  );

  // Auto-click button Install: ưu tiên modal Polaris-Modal-Dialog, fallback landing.
  async function autoInstall() {
    for (let i = 0; i < 4; i++) {
      await page
        .waitForLoadState('domcontentloaded', { timeout: 20_000 })
        .catch(() => {});
      await new Promise((r) => setTimeout(r, 2500));

      const modal = page.locator('[role="dialog"].Polaris-Modal-Dialog').first();
      if (await modal.isVisible({ timeout: 1500 }).catch(() => false)) {
        const modalBtn = modal
          .locator('button')
          .filter({ hasText: /^\s*Install\s*$/ })
          .first();
        if (await modalBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
          console.log(`>>> Click Install trong modal (bước ${i + 1})...`);
          await modalBtn.click({ timeout: 10_000 }).catch((err) =>
            console.error('Click modal fail:', err.message)
          );
          await page
            .waitForLoadState('domcontentloaded', { timeout: 30_000 })
            .catch(() => {});
          continue;
        }
      }

      const landingBtn = page
        .locator('button[aria-label="Install app" i]')
        .first();
      if (await landingBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`>>> Click Install landing (bước ${i + 1})...`);
        await landingBtn.click({ timeout: 10_000 }).catch((err) =>
          console.error('Click landing fail:', err.message)
        );
        await page
          .waitForLoadState('domcontentloaded', { timeout: 30_000 })
          .catch(() => {});
        continue;
      }

      return;
    }
  }

  await autoInstall();

  // Chờ URL khớp VÀ page không còn ở trạng thái landing install:
  // - Body có đủ content (>= 200 ký tự để chắc chắn render xong)
  // - Body KHÔNG chứa "you don't have this app installed"
  // - KHÔNG còn button aria-label="Install app"
  const NOT_INSTALLED_RE = /you don'?t have this app installed/i;
  const success = await (async () => {
    const deadline = Date.now() + LOGIN_TIMEOUT_MS;
    while (Date.now() < deadline) {
      for (const p of context.pages()) {
        if (!SUCCESS_URL_REGEX.test(p.url())) continue;
        try {
          const state = await p.evaluate(() => {
            const body = (document.body && document.body.innerText) || '';
            const hasInstallBtn = !!document.querySelector(
              'button[aria-label="Install app" i]'
            );
            return { len: body.length, body, hasInstallBtn };
          });
          if (
            state.len >= 200 &&
            !NOT_INSTALLED_RE.test(state.body) &&
            !state.hasInstallBtn
          ) {
            return true;
          }
        } catch (_) {
          // ignore, thử lại lượt sau
        }
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    return false;
  })();

  if (!success) {
    const urls = context.pages().map((p) => p.url());
    console.error(
      `\nHết thời gian chờ (${LOGIN_TIMEOUT_MS / 1000}s). URL các tab: ${JSON.stringify(urls)}`
    );
    console.error('Nếu bạn đã login nhưng chưa vào trang app thì navigate tới URL app rồi chạy lại.');
    await browser.close().catch(() => {});
    killChromeTree(chromeProc.pid);
    process.exit(1);
  }

  console.log('\n>>> Đã phát hiện login thành công, đang lưu session...');
  await context.storageState({ path: AUTH_FILE });
  console.log(`Đã lưu session vào: ${AUTH_FILE}`);

  await browser.close().catch(() => {});
  killChromeTree(chromeProc.pid);
  process.exit(0);
})().catch((err) => {
  console.error('Login script lỗi:', err);
  process.exit(1);
});
