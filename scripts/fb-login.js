// Script login Facebook 1 lần lưu vào .auth-profile. Cookies sẽ persist cho các lần sau
// khi click "Connect account" trong app -> OAuth auto-authorize, không phải nhập lại email/password.
// Chạy: npm run fb-login

const { chromium } = require('@playwright/test');
const { spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

const ROOT = path.join(__dirname, '..');
const USER_DATA_DIR = path.join(ROOT, '.auth-profile');
const TARGET_URL = 'https://www.facebook.com/';
// Khi user login xong, Facebook redirect tới URL chính (ví dụ / hoặc /home hoặc có /me).
// Detect bằng cookie `c_user` (Facebook set sau khi login).
const LOGIN_TIMEOUT_MS = 10 * 60_000;
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
    if (process.platform === 'win32') {
      execFile('taskkill', ['/F', '/T', '/PID', String(pid)], () => {});
    } else {
      try { process.kill(-Number(pid), 'SIGKILL'); } catch (_) {}
      
    }
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
      '>>> Chrome mở facebook.com. Hãy login thủ công (email / password / 2FA nếu có).\n' +
      '>>> Script tự detect khi login thành công (cookie c_user được set) và thoát.\n' +
      '>>> Cookies lưu trong .auth-profile -> lần sau test tự động authorize OAuth Facebook.\n' +
      '============================================================\n'
  );

  const deadline = Date.now() + LOGIN_TIMEOUT_MS;
  let success = false;
  while (Date.now() < deadline) {
    try {
      const cookies = await context.cookies('https://www.facebook.com');
      const cUser = cookies.find((c) => c.name === 'c_user');
      if (cUser && cUser.value && /^\d+$/.test(cUser.value)) {
        success = true;
        console.log(`>>> Đã phát hiện login thành công (FB user id: ${cUser.value})`);
        break;
      }
    } catch (_) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!success) {
    console.error(`\nHết thời gian chờ (${LOGIN_TIMEOUT_MS / 1000}s). Chưa thấy cookie c_user.`);
    await browser.close().catch(() => {});
    killChromeTree(proc.pid);
    process.exit(1);
  }

  console.log('>>> Session Facebook đã lưu vào .auth-profile. Có thể đóng Chrome.');
  await browser.close().catch(() => {});
  killChromeTree(proc.pid);
  process.exit(0);
})().catch((err) => {
  console.error('fb-login script lỗi:', err);
  process.exit(1);
});
