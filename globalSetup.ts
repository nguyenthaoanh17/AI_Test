import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

const ROOT = __dirname;
const USER_DATA_DIR = path.join(ROOT, '.auth-profile');
const AUTH_FILE = path.join(ROOT, 'user.json');
const PID_FILE = path.join(ROOT, '.chrome-cdp.pid');
const CDP_PORT = 9222;

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe')
    : '',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function findChrome(): string {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Không tìm thấy chrome.exe. Cài Google Chrome.');
}

function waitForPort(port: number, timeoutMs: number): Promise<void> {
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

function sanitizeChromeState() {
  // (1) Fix exit_type trong Preferences
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

  // (2) Xóa session recovery files: Chrome dựa vào đây để show "Restore pages?" bubble.
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

  // Singleton locks: nếu Chrome bị kill abruptly, các file này còn lại và chặn start.
  for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
    const p = path.join(USER_DATA_DIR, f);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (_) {}
  }

  console.log('[globalSetup] sanitizeChromeState done');
}

export default async function globalSetup() {
  if (!fs.existsSync(USER_DATA_DIR) || !fs.existsSync(AUTH_FILE)) {
    throw new Error(
      `Thiếu ${USER_DATA_DIR} hoặc ${AUTH_FILE}. Hãy chạy: npm run login`
    );
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
      'about:blank',
    ],
    { detached: true, stdio: 'ignore', windowsHide: false }
  );
  proc.unref();
  if (proc.pid) fs.writeFileSync(PID_FILE, String(proc.pid));

  await waitForPort(CDP_PORT, 20_000);
}
