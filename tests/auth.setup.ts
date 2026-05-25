import { test as setup, expect } from './fixtures';
import fs from 'fs';
import path from 'path';

const authFile = path.join(__dirname, '..', 'user.json');

// Setup này chỉ verify session (do globalSetup spawn Chrome với .auth-profile đã login).
// Việc login ban đầu (tạo user.json + .auth-profile) làm 1 lần bằng: npm run login
setup('authenticate', async ({ page }) => {
  if (!fs.existsSync(authFile)) {
    throw new Error(
      `Không tìm thấy ${authFile}.\n` +
        'Hãy chạy: npm run login\n' +
        'để login thủ công 1 lần rồi chạy lại test.'
    );
  }

  await page.goto('https://admin.shopify.com/store/dev-feed17');

  await expect(page).toHaveURL(/.*admin\.shopify\.com\/store\/dev-feed17/, {
    timeout: 30_000,
  });
});
