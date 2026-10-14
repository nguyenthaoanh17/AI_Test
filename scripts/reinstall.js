// Reinstall flow: nếu app đã cài -> uninstall -> đợi 30s -> reinstall.
// Dùng spawn Chrome + connectOverCDP giống login.js để tránh Shopify bot detection.
// Chạy: npm run reinstall

const { chromium } = require('@playwright/test');
const { spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

const ROOT = path.join(__dirname, '..');
const USER_DATA_DIR = path.join(ROOT, '.auth-profile');
const AUTH_FILE = path.join(ROOT, 'user.json');
const TARGET_URL = 'https://admin.shopify.com/store/dev-feed17/apps/feed-data-by-omega';
const INSTALLED_APPS_URL =
  'https://admin.shopify.com/store/dev-feed17/settings/apps?tab=installed';
const SUCCESS_URL_REGEX =
  /admin\.shopify\.com\/store\/dev-feed17\/apps\/feed-data-by-omega/;
const APP_NAME_RE = /omega google.*feed|omega feed|feed data by omega/i;
const TOTAL_TIMEOUT_MS = 5 * 60_000;
const CDP_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${CDP_PORT}`;

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe')
    : null,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Không tìm thấy chrome.exe.');
}

function waitForPort(port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tryOnce = () => {
      const s = net
        .createConnection({ host: '127.0.0.1', port })
        .once('connect', () => {
          s.end();
          resolve();
        })
        .once('error', () => {
          s.destroy();
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
    if (process.platform === 'win32') {
      execFile('taskkill', ['/F', '/T', '/PID', String(pid)], () => {});
    } else {
      try { process.kill(-Number(pid), 'SIGKILL'); } catch (_) {}
      
    }
  } catch (_) {}
}

async function tryUninstall(page) {
  await page.goto(INSTALLED_APPS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Link app trong main content (không phải sidebar) -> href chứa /app_installations/app/
  const appLink = page
    .locator('a[href*="/settings/apps/app_installations/app/feed-data-by-omega"]')
    .first();
  const hasApp = await appLink.isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasApp) {
    console.log('>>> App chưa cài sẵn, skip bước uninstall.');
    return false;
  }

  console.log('>>> App đang cài, tiến hành uninstall...');

  // Row container theo class Polaris _SettingsItem__wrapper
  const row = page
    .locator('[class*="SettingsItem__wrapper"]')
    .filter({ has: appLink })
    .first();

  const moreBtn = row.getByRole('button', { name: /more actions/i }).first();
  if (!(await moreBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
    console.error('Không tìm thấy button "More actions" trong row app.');
    return false;
  }
  await moreBtn.click({ timeout: 5000 });

  // Menu hiện ra, click "Uninstall"
  await page.waitForTimeout(600);
  const uninstallItem = page
    .getByRole('menuitem', { name: /uninstall/i })
    .first();
  if (!(await uninstallItem.isVisible({ timeout: 3000 }).catch(() => false))) {
    console.error('Menu hiện ra nhưng không có menuitem "Uninstall".');
    return false;
  }
  await uninstallItem.click();

  // Confirm dialog — lọc button theo visible text "Uninstall" (exact, không phải "Installed"/"Uninstalled")
  await page.waitForTimeout(800);
  const confirmBtn = page
    .locator('button')
    .filter({ hasText: /^\s*Uninstall\s*$/ })
    .last();
  try {
    await confirmBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await confirmBtn.click({ timeout: 10_000 });
  } catch (err) {
    console.error('Không click được button confirm Uninstall:', err.message);
    const btns = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map((b) => ({
        text: (b.innerText || '').trim().slice(0, 60),
        aria: b.getAttribute('aria-label'),
      })).filter((x) => x.text || x.aria).slice(0, 20)
    );
    console.error('Buttons hiện có:', JSON.stringify(btns));
    return false;
  }

  // Link biến khỏi list
  try {
    await appLink.waitFor({ state: 'hidden', timeout: 30_000 });
    console.log('>>> App đã biến khỏi list Installed.');
    return true;
  } catch {
    console.error('App vẫn hiển thị sau khi click uninstall.');
    return false;
  }
}

async function autoInstall(page) {
  for (let i = 0; i < 4; i++) {
    await page
      .waitForLoadState('domcontentloaded', { timeout: 20_000 })
      .catch(() => {});
    await page.waitForTimeout(2500);

    // Ưu tiên button "Install" trong modal Polaris-Modal-Dialog (phủ lên landing).
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

    // Fallback: button "Install app" trên landing page (aria-label)
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

    // Không còn button Install nào → thoát loop
    return;
  }
}

async function waitForInstalled(context, deadline) {
  const NOT_INSTALLED_RE = /you don'?t have this app installed/i;
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
      } catch (_) {}
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
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
  const proc = spawn(
    chromePath,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled',
      '--hide-crash-restore-bubble',
      '--restore-last-session=false',
      INSTALLED_APPS_URL,
    ],
    { detached: true, stdio: 'ignore', windowsHide: false }
  );
  proc.unref();

  try {
    await waitForPort(CDP_PORT, 20_000);
  } catch (err) {
    console.error(err.message);
    killChromeTree(proc.pid);
    process.exit(1);
  }

  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0];
  const page = context.pages()[0] ?? (await context.newPage());

  const deadline = Date.now() + TOTAL_TIMEOUT_MS;

  const uninstalled = await tryUninstall(page);
  if (uninstalled) {
    console.log('>>> Chờ 30 giây trước khi reinstall...');
    await page.waitForTimeout(30_000);
  }

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await autoInstall(page);

  const ok = await waitForInstalled(context, deadline);
  if (!ok) {
    console.error('\nKhông xác nhận được app đã installed sau timeout.');
    console.error('URL các tab:', context.pages().map((p) => p.url()));
    await browser.close().catch(() => {});
    killChromeTree(proc.pid);
    process.exit(1);
  }

  console.log('\n>>> App đã cài thành công, đang lưu session...');
  await context.storageState({ path: AUTH_FILE });
  console.log(`Đã lưu session vào: ${AUTH_FILE}`);

  await browser.close().catch(() => {});
  killChromeTree(proc.pid);
  process.exit(0);
})().catch((err) => {
  console.error('Reinstall script lỗi:', err);
  process.exit(1);
});
