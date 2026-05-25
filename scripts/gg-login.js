// Script login Google 1 lần lưu vào .auth-profile (dùng chung user-data-dir với fb-login).
// Cookies persist cho các lần sau khi click "Connect" ở GMC -> OAuth Google auto-authorize,
// không phải nhập lại email/password.
// Chạy: npm run gg-login

const { chromium } = require('@playwright/test');
const { spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

const ROOT = path.join(__dirname, '..');
const USER_DATA_DIR = path.join(ROOT, '.auth-profile');
const TARGET_URL = 'https://accounts.google.com/';
// Khi user login xong, Google set cookie `__Secure-3PSID` (hoặc fallback `SID`) ở domain .google.com.
const LOGIN_TIMEOUT_MS = 10 * 60_000;
const CDP_PORT = 9223;
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
  throw new Error('Không tìm thấy chrome.exe. Cài Google Chrome.');
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
  } catch (_) {}
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
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch (_) {}
  }
  const sessionsDir = path.join(USER_DATA_DIR, 'Default', 'Sessions');
  if (fs.existsSync(sessionsDir)) {
    try {
      fs.rmSync(sessionsDir, { recursive: true, force: true });
    } catch (_) {}
  }
  for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
    const p = path.join(USER_DATA_DIR, f);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (_) {}
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
      TARGET_URL,
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

  console.log(
    '\n============================================================\n' +
      '>>> Chrome mở accounts.google.com. Hãy login thủ công (email / password / 2FA nếu có).\n' +
      '>>> Script tự detect khi login thành công (cookie __Secure-3PSID hoặc SID) và thoát.\n' +
      '>>> Cookies lưu trong .auth-profile -> lần sau test tự động authorize OAuth Google (GMC).\n' +
      '============================================================\n'
  );

  const deadline = Date.now() + LOGIN_TIMEOUT_MS;
  let success = false;
  while (Date.now() < deadline) {
    try {
      const cookies = await context.cookies('https://accounts.google.com');
      const signedIn = cookies.find(
        (c) => (c.name === '__Secure-3PSID' || c.name === 'SID') && c.value && c.value.length > 10
      );
      if (signedIn) {
        success = true;
        console.log(`>>> Đã phát hiện login Google thành công (cookie: ${signedIn.name})`);
        break;
      }
    } catch (_) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!success) {
    console.error(`\nHết thời gian chờ (${LOGIN_TIMEOUT_MS / 1000}s). Chưa thấy cookie Google sign-in.`);
    await browser.close().catch(() => {});
    killChromeTree(proc.pid);
    process.exit(1);
  }

  console.log('>>> Session Google đã lưu vào .auth-profile. Có thể đóng Chrome.');
  await browser.close().catch(() => {});
  killChromeTree(proc.pid);
  process.exit(0);
})().catch((err) => {
  console.error('gg-login script lỗi:', err);
  process.exit(1);
});
