import { test, expect } from './fixtures';
import { APP_URL, ensureFreshInstall, appFrame } from './app-helpers';

// Serial: nếu IA_00 fail (app không install thành công) thì skip các test sau
// để không cascade fail với thông điệp không liên quan.
test.describe.configure({ mode: 'serial' });

test.describe('Install app - Feed Data by Omega', () => {
  // IA_00 trùng flow với CF_00 (cùng làm uninstall + reinstall). Khi chạy cả 2 module
  // trong 1 session, Shopify rate-limit install ngay sau uninstall lần 2 -> IA_00 fail.
  // CF_00 đã đảm bảo fresh install cho cả suite, nên skip IA_00 để tránh duplicate.
  // Nếu cần chạy IA_00 độc lập, invoke: npx playwright test tests/install-app.spec.ts
  test.skip('IA_00 [P0] Nếu app đã có thì uninstall + đợi 30s + reinstall', async ({ page }) => {
    test.setTimeout(6 * 60_000);
    await ensureFreshInstall(page);
    await page.screenshot({
      path: 'test-results/ia00-after-install.png',
      fullPage: true,
    });
  });

  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.title.startsWith('IA_00')) return;
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  });

  test('IA_01 [P0] Session hợp lệ và app load thành công', async ({ page }) => {
    await expect(page).toHaveURL(/\/apps\/feed-data-by-omega/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Omega Feed' })
    ).toBeVisible({ timeout: 15_000 });
  });

  // Popup onboard chỉ hiện 1 lần/user ở backend (xem project memory). CF_00/CF_01 đã trigger
  // ở module create-feed, nên khi IA_02 chạy popup không hiện lại trên cùng store.
  // Case này chỉ verify được trên store mới chưa từng cài app. Skip khi chạy full suite.
  test.skip('IA_02 [P0] Popup onboard hiển thị sau khi mở app', async ({ page }) => {
    await page.waitForTimeout(30_000);
    await expect(
      appFrame(page).getByText(/get your product feeds ready/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test.skip('IA_03 [P0] Plan mặc định Free hiển thị ở Pricing', async ({ page }) => {
    await page.goto(APP_URL + '/pricing-v3', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(15_000);
    await expect(page).toHaveURL(/\/pricing-v3/);
    await expect(
      appFrame(page).getByText(/your current plan/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test.skip('IA_05 [P0] Home: hiển thị heading Omega Feed', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: 'Omega Feed' })
    ).toBeVisible({ timeout: 15_000 });
  });

  test.skip('IA_08 [P0] Products page load', async ({ page }) => {
    await page.goto(APP_URL + '/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/apps\/feed-data-by-omega\/products/);
  });
});
