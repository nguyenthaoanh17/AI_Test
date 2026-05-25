import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PID_FILE = path.join(__dirname, '.chrome-cdp.pid');

export default async function globalTeardown() {
  if (!fs.existsSync(PID_FILE)) return;
  const pid = fs.readFileSync(PID_FILE, 'utf-8').trim();
  try {
    fs.unlinkSync(PID_FILE);
  } catch (_) {
    // ignore
  }
  if (!pid) return;
  await new Promise<void>((resolve) => {
    execFile('taskkill', ['/F', '/T', '/PID', pid], () => resolve());
  });
}
