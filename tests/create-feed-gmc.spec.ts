import { test, expect } from './fixtures';
import { APP_URL, appFrame, dismissChatbot, ensureFreshInstall } from './app-helpers';

// Flow GMC (Google Merchant Center) từ popup onboard — mirror cấu trúc CF (Facebook).
// Prefix CG = Create feed Google. Serial mode để chạy tuần tự.
test.describe.configure({ mode: 'serial' });

// Data source name unique per run để tránh collision với data source đã tồn tại bên GMC side.
const DATA_SOURCE_NAME = `GMC Feed ${Date.now()}`;

test.describe('Create feed GMC - Omega Feed app', () => {
  test('CG_00 [P0] Pre-setup: reset app để popup onboard sẵn sàng', async ({ page }) => {
    test.setTimeout(5 * 60_000);
    await ensureFreshInstall(page);
  });

  test.beforeEach(async ({ page }, testInfo) => {
    // Chỉ CG_01 cần goto APP_URL để bắt đầu từ dashboard app.
    // Các CG_xx sau kế thừa state wizard từ CG_01 -> không navigate lại.
    if (!testInfo.title.startsWith('CG_01')) return;
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  });

  test('CG_01 [P0] Popup onboard -> Active Google - GMC -> Continue -> Connect GMC account', async ({
    page,
  }) => {
    test.setTimeout(300_000);
    const frame = appFrame(page);

    // Step 1-3: chờ popup onboard, active widget Google - GMC, click Continue
    console.log('[CG_01] Chờ popup onboard "Get your product feeds ready!" render (tối đa 45s)...');
    const popupTitle = frame.getByText(/get your product feeds ready/i).first();
    let popupShown = true;
    try {
      await popupTitle.waitFor({ state: 'visible', timeout: 45_000 });
      console.log('[CG_01] Popup onboard đã hiện -> active widget Google - GMC');
    } catch {
      popupShown = false;
      console.log('[CG_01] Popup onboard KHÔNG hiện sau 45s -> fallback navigate GMC');
    }

    if (popupShown) {
      // Click widget "Google - GMC" (theo memory, popup có 6 widget; Google-GMC là option 2)
      const gmcWidget = frame
        .locator('p')
        .filter({ hasText: /^\s*Google\s*-?\s*GMC\s*$/i })
        .first();
      await gmcWidget.waitFor({ state: 'visible', timeout: 10_000 });
      await gmcWidget.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(800);
      console.log('[CG_01] Đã click widget Google - GMC -> click Continue');

      await frame
        .getByRole('button', { name: /^\s*Continue\s*$/i })
        .first()
        .click({ force: true, timeout: 10_000 });

      await expect(popupTitle).toBeHidden({ timeout: 15_000 });
      console.log('[CG_01] Popup đóng -> verify màn GMC setup hiện');
    } else {
      // Fallback: navigate thẳng vào GMC Sync
      await page.goto(APP_URL + '/sync-to-gmc-setting', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(15_000);
    }

    // Verify đã vào màn "Get ready for Google Merchant Center" (wizard 3 steps giống FB)
    await expect(
      frame.getByText(/get ready for google merchant center/i).first()
    ).toBeVisible({ timeout: 15_000 });
    console.log('[CG_01] Đã vào màn "Get ready for Google Merchant Center"');

    await page
      .screenshot({ path: 'test-results/cg01-fb-sync-state.png', fullPage: true })
      .catch(() => {});

    // Detect account đã connected (button Disconnect visible) -> skip OAuth
    const alreadyConnected = await frame
      .getByRole('button', { name: /^\s*Disconnect\s*$/i })
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!alreadyConnected) {
      // OAuth flow: click Connect -> popup Google
      console.log('[CG_01] Click Connect để mở Google OAuth popup');
      const popupPromise = page.context().waitForEvent('page', { timeout: 30_000 });

      await frame
        .getByRole('button', { name: /^\s*Connect( account)?\s*$/i })
        .first()
        .click({ force: true, timeout: 10_000 });

      const googlePopup = await popupPromise;
      await googlePopup.waitForLoadState('domcontentloaded');
      console.log('[CG_01] Google OAuth popup đã mở');

      // Helper click button/element trong Google popup (tương tự FB clickInPopup)
      const clickInGooglePopup = async (label: string, locator: any, snapshotFile: string) => {
        if (googlePopup.isClosed()) return false;
        await googlePopup.screenshot({ path: snapshotFile, fullPage: true }).catch(() => {});
        try {
          await locator.waitFor({ state: 'visible', timeout: 15_000 });
        } catch {
          console.log(`[CG_01] ${label}: element không xuất hiện`);
          return false;
        }
        await locator.click({ force: true, timeout: 10_000 });
        return true;
      };

      // Step A: "Choose an account" -> click account tile đầu tiên (position-based,
      // tránh hardcode email để tuân thủ rule không leak credential).
      // Google render account list với attribute data-identifier hoặc data-authuser.
      await page.waitForTimeout(2000);
      const firstAccountTile = googlePopup
        .locator('[data-authuser="0"], [data-identifier]')
        .first();
      const accountPicked = await clickInGooglePopup(
        'Step A Choose account',
        firstAccountTile,
        'test-results/cg01-oauth-step-a-choose-account.png'
      );
      if (!accountPicked) {
        // Fallback: click bất kỳ element có text email
        const fallbackAccount = googlePopup
          .locator('li, [role="listitem"], [role="link"]')
          .filter({ hasText: /@/ })
          .first();
        await clickInGooglePopup(
          'Step A fallback',
          fallbackAccount,
          'test-results/cg01-oauth-step-a-fallback.png'
        );
      }

      // Step B: "You're signing back in to FeedNexa" -> Continue
      await googlePopup.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(2000);
      await clickInGooglePopup(
        'Step B Signing back Continue',
        googlePopup.getByRole('button', { name: /^\s*Continue\s*$/i }).first(),
        'test-results/cg01-oauth-step-b-signing-back.png'
      );

      // Step C: "FeedNexa wants access to your Google Account" -> Continue
      await googlePopup.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(2000);
      await clickInGooglePopup(
        'Step C Wants access Continue',
        googlePopup.getByRole('button', { name: /^\s*Continue\s*$/i }).first(),
        'test-results/cg01-oauth-step-c-wants-access.png'
      );

      // Đợi popup đóng sau khi hoàn tất OAuth
      if (!googlePopup.isClosed()) {
        await googlePopup.waitForEvent('close', { timeout: 60_000 }).catch(() => {});
      }
      console.log('[CG_01] Google OAuth popup đã đóng, quay về app');
      await page.waitForTimeout(5000);
    }

    // Verify end state: wizard Step 1 với "Account connected" + 2 field required
    // Mirror FB layout, chỉ khác field: Merchant center ID + Data source name
    await expect(
      frame.getByText(/account connected/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/merchant center id/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/data source name/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cg01-final.png', fullPage: true })
      .catch(() => {});
  });

  test('CG_02 [P0] Kiểm tra UI mặc định onboard wizard Step 1 (Connect Google account)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    // Pre-cond: CG_01 đã connect Google account -> user ở wizard Step 1.
    await expect(
      frame.getByText(/get ready for google merchant center/i).first()
    ).toBeVisible({ timeout: 15_000 });

    await page
      .screenshot({ path: 'test-results/cg02-ui-default.png', fullPage: true })
      .catch(() => {});

    // Stepper (3 steps): Connect Google account -> General setting -> Complete
    await expect(
      frame.getByText(/^\s*Connect Google account\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/^\s*General setting\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/^\s*Complete\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Step indicator "Step 1 of 3"
    await expect(
      frame.getByText(/step\s*1\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Panel account connected + 2 field required
    await expect(
      frame.getByText(/account connected/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByRole('button', { name: /^\s*Disconnect\s*$/i }).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/merchant center id/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/data source name/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Button Next ở Step 1 disabled khi chưa fill 2 field required
    await expect(
      frame.getByRole('button', { name: /^\s*Next\s*$/i }).first()
    ).toBeDisabled({ timeout: 10_000 });
  });

  test('CG_03 [P0] Fill Step 1 (Merchant center ID + Data source name) và Next sang Step 2', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const frame = appFrame(page);

    // Pre-cond: CG_02 đã verify user ở Step 1.
    // DOM: cả 2 field có cùng placeholder "Type name your data source" -> dùng index.
    // .first() = Merchant center ID, .nth(1) = Data source name.

    // Step 1.1: Click Merchant center ID field để mở dropdown (giả định giống FB là combobox)
    const merchantIdField = frame
      .getByPlaceholder(/type name your data source/i)
      .first();
    await merchantIdField.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(1500);
    await page
      .screenshot({ path: 'test-results/cg03-step1-merchant-dropdown.png', fullPage: true })
      .catch(() => {});

    // Chọn option đầu tiên (hỗ trợ combobox role=option hoặc native select)
    const merchantOption = frame
      .getByRole('option')
      .filter({ hasNotText: /^\s*Select\s*$/i })
      .first();
    if (await merchantOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await merchantOption.click({ force: true, timeout: 10_000 });
    } else {
      // Fallback: typing
      await merchantIdField.fill('a', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const suggestedOption = frame.getByRole('option').first();
      if (await suggestedOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await suggestedOption.click({ force: true, timeout: 10_000 });
      } else {
        const nativeSelect = frame.locator('select').first();
        if (await nativeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nativeSelect.selectOption({ index: 1 });
        } else {
          throw new Error('[CG_03] Không mở được dropdown Merchant center ID');
        }
      }
    }
    await page.waitForTimeout(1500);

    // Step 1.2: Data source name (input thứ 2 cùng placeholder) -> "GMC feed 1"
    const dataSourceNameInput = frame
      .getByPlaceholder(/type name your data source/i)
      .nth(1);
    await dataSourceNameInput.fill(DATA_SOURCE_NAME, { timeout: 10_000 });
    await page.waitForTimeout(500);

    await page
      .screenshot({ path: 'test-results/cg03-before-next.png', fullPage: true })
      .catch(() => {});

    // Step 1.3: Click Next -> sang Step 2 "General setting"
    const nextBtn = frame.getByRole('button', { name: /^\s*Next\s*$/i }).first();
    await expect(nextBtn).toBeEnabled({ timeout: 10_000 });
    await nextBtn.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(3000);

    await page
      .screenshot({ path: 'test-results/cg03-after-next-step2.png', fullPage: true })
      .catch(() => {});

    // Verify: đã sang Step 2 "General setting"
    await expect(
      frame.getByText(/step\s*2\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('CG_04a [P1] Step 2: Products from collections chưa chọn collection -> Next -> hiển thị lỗi "Please select collection"', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Pre-cond: CG_03 đã đưa user sang Step 2 với default "All products".
    await expect(
      frame.getByText(/step\s*2\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Wait 30s cho Step 2 render đầy đủ (theo rule feedback_wait_30s_new_step)
    console.log('[CG_04a] Đã sang Step 2. Chờ 30s để Step 2 load xong...');
    await page.waitForTimeout(30_000);
    console.log('[CG_04a] Bắt đầu test Step 2');

    // Switch radio sang "Products from collections" (KHÔNG chọn collection nào)
    const collectionsRadio = frame
      .getByRole('radio', { name: /products from collections/i })
      .first();
    await collectionsRadio.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(800);
    await expect(collectionsRadio).toBeChecked();

    await expect(
      frame.getByPlaceholder(/search collections/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cg04a-before-next-no-collection.png', fullPage: true })
      .catch(() => {});

    // Click Next -> verify error
    await frame
      .getByRole('button', { name: /^\s*Next\s*$/i })
      .first()
      .click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(1500);

    await expect(
      frame.getByText(/please select collection/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/step\s*2\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 5000 });

    await page
      .screenshot({ path: 'test-results/cg04a-error-please-select-collection.png', fullPage: true })
      .catch(() => {});
  });

  test('CG_04b [P0] Step 2: Products from collections -> Browse popup -> chọn collection -> Add -> reset All products -> Next sang Step 3', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Pre-cond: CG_04a để user ở Step 2 với Products from collections active + error.
    await expect(
      frame.getByText(/step\s*2\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });

    const browseBtn = frame
      .getByRole('button', { name: /^\s*Browse\s*$/i })
      .first();
    await expect(browseBtn).toBeVisible({ timeout: 10_000 });
    await expect(browseBtn).toBeEnabled({ timeout: 10_000 });

    console.log('[CG_04b] Click button Browse để mở popup Add collections');
    await browseBtn.click({ timeout: 10_000 }).catch(async () => {
      await browseBtn.click({ force: true, timeout: 10_000 });
    });
    await page.waitForTimeout(2500);

    await page
      .screenshot({ path: 'test-results/cg04b-after-browse-click.png', fullPage: true })
      .catch(() => {});

    // Popup "Add collections" render ở page scope (App Bridge modal, giống FB)
    const popupTitle = page.getByText(/^\s*Add collections\s*$/i).first();
    await expect(popupTitle).toBeVisible({ timeout: 15_000 });
    console.log('[CG_04b] Popup Add collections đã mở');

    const popup = page
      .locator('[role="dialog"], [class*="Modal"], [class*="modal"]')
      .filter({ has: popupTitle })
      .first();
    const addBtn = popup.getByRole('button', { name: /^\s*Add\s*$/i }).first();
    await expect(addBtn).toBeDisabled({ timeout: 10_000 });

    // Tick checkbox collection đầu tiên
    console.log('[CG_04b] Tick checkbox collection đầu tiên');
    const firstCheckbox = popup.getByRole('checkbox').first();
    await firstCheckbox.waitFor({ state: 'visible', timeout: 10_000 });
    await firstCheckbox.check({ force: true, timeout: 10_000 });
    await page.waitForTimeout(800);

    await expect(firstCheckbox).toBeChecked({ timeout: 5000 });
    await expect(addBtn).toBeEnabled({ timeout: 10_000 });

    await addBtn.click({ force: true, timeout: 10_000 });
    await expect(popupTitle).toBeHidden({ timeout: 10_000 });
    await expect(
      frame.getByText(/please select collection/i).first()
    ).toBeHidden({ timeout: 10_000 });

    // Reset về All products
    console.log('[CG_04b] Chọn lại radio "All products"');
    const allProductsRadio = frame
      .getByRole('radio', { name: /^\s*All products\s*$/i })
      .first();
    await allProductsRadio.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(500);
    await expect(allProductsRadio).toBeChecked();

    // Click Next -> Step 3
    console.log('[CG_04b] Click Next sang Step 3 Complete');
    const nextBtn = frame.getByRole('button', { name: /^\s*Next\s*$/i }).first();
    await expect(nextBtn).toBeEnabled({ timeout: 10_000 });
    await nextBtn.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(3000);

    await expect(
      frame.getByText(/step\s*3\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });
    console.log('[CG_04b] Đã sang Step 3 Complete');
  });

  test('CG_05 [P0] Step 3 Complete: verify "You\'re all set!" + click Done -> Pricing plans', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const frame = appFrame(page);

    // Pre-cond: CG_04b đã đưa user sang Step 3.
    await expect(
      frame.getByText(/step\s*3\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Wait 30s cho Step 3 render đầy đủ (theo rule)
    console.log('[CG_05] Đã sang Step 3. Chờ 30s để Step 3 load xong...');
    await page.waitForTimeout(30_000);
    console.log('[CG_05] Bắt đầu test Step 3');

    // Verify nội dung Complete (giống FB: "You're all set!" + subtext syncing)
    await expect(
      frame.getByText(/you'?re all set!?/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Subtext có thể là "syncing to Google" thay vì "syncing to Facebook" cho GMC
    // Match text chung "your products are now syncing" để linh hoạt
    await expect(
      frame.getByText(/your products are now syncing/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Bottom: Back + Done
    const doneBtn = frame
      .getByRole('button', { name: /^\s*Done\s*$/i })
      .first();
    await expect(doneBtn).toBeVisible({ timeout: 10_000 });
    await expect(doneBtn).toBeEnabled({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cg05-step3-complete.png', fullPage: true })
      .catch(() => {});

    // Click Done -> Pricing plans
    await doneBtn.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(5000);

    await page
      .screenshot({ path: 'test-results/cg05-after-done-pricing.png', fullPage: true })
      .catch(() => {});

    // Verify chuyển sang Pricing
    await expect(page).toHaveURL(/\/pricing-v3/, { timeout: 15_000 });
    await expect(
      frame.getByText(/^\s*Pricing plans\s*$/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // 4 plan cards
    await expect(frame.getByText(/^\s*Free\s*$/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(frame.getByText(/^\s*Basic\s*$/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(frame.getByText(/^\s*Scale\s*$/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(frame.getByText(/^\s*Advanced\s*$/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('CG_06 [P0] Từ Pricing quay về GMC Sync và kiểm tra setting vừa tạo', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Pre-cond: CG_05 đang ở Pricing. Navigate về GMC Sync qua sidebar.
    console.log('[CG_06] Navigate về GMC Sync qua sidebar');
    const gmcLink = page
      .getByRole('link', { name: /^\s*GMC Sync\s*$/i })
      .first();
    let navigated = false;
    try {
      await gmcLink.click({ force: true, timeout: 10_000 });
      navigated = true;
    } catch {
      console.log('[CG_06] Force click sidebar fail -> fallback goto URL');
    }
    if (!navigated) {
      await page.goto(APP_URL + '/sync-to-gmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg06-gmc-sync-page.png', fullPage: true })
      .catch(() => {});

    // Verify heading GMC Sync
    await expect(
      frame.getByRole('heading', { name: /^\s*GMC Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/connect,\s*monitor and sync your shopify products to google merchant center/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Panel "Google accounts" có account đã connect
    await expect(
      frame.getByText(/^\s*Google accounts\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Feeds panel + row feed vừa tạo
    await expect(
      frame.getByText(/^\s*Data source name\s*$|^\s*Business data\s*$|meta shopping feeds|google merchant/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Feed name = DATA_SOURCE_NAME (đã fill ở CG_03, dynamic per run)
    await expect(
      frame.getByText(DATA_SOURCE_NAME).first()
    ).toBeVisible({ timeout: 15_000 });

    // Skip assert sync status (hạ tầng GMC/Google đang không ổn định, không verify Synced/Syncing)
  });

  test('CG_07 [P0] Free plan limit: button "+ Connect new account" ở GMC Sync disabled khi đã có 1 account', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    await expect(
      frame.getByText(/^\s*Google accounts\s*$/i).first()
    ).toBeVisible({ timeout: 15_000 });

    const connectNewAccountBtn = frame
      .getByRole('button', { name: /connect new account/i })
      .first();
    await expect(connectNewAccountBtn).toBeVisible({ timeout: 10_000 });
    await expect(connectNewAccountBtn).toBeDisabled({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cg07-connect-new-account-disabled.png', fullPage: true })
      .catch(() => {});
  });

  test('CG_08 [P0] Free plan limit: button "Create new" feed ở GMC Sync disabled khi đã có 1 feed', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    // Pre-cond: CG_06 đã đưa user ở GMC Sync page với 1 feed
    const createNewBtn = frame
      .getByRole('button', { name: /^\s*Create new\s*$/i })
      .first();
    await expect(createNewBtn).toBeVisible({ timeout: 10_000 });
    await expect(createNewBtn).toBeDisabled({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cg08-create-new-feed-disabled.png', fullPage: true })
      .catch(() => {});
  });

  test('CG_09 [P0] Free plan limit: Facebook Sync channel - button Connect disabled khi GMC đã connect', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    console.log('[CG_09] Navigate sang Facebook Sync');
    const fbLink = page
      .getByRole('link', { name: /^\s*Facebook Sync\s*$/i })
      .first();
    let fbViaSidebar = false;
    try {
      await fbLink.click({ force: true, timeout: 10_000 });
      fbViaSidebar = true;
    } catch {
      console.log('[CG_09] Force click sidebar fail -> fallback goto FB URL');
    }
    if (!fbViaSidebar) {
      await page.goto(APP_URL + '/sync-to-fb-setting-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg09-fb-channel-locked.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByRole('heading', { name: /^\s*Facebook Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      frame.getByText(/^\s*Facebook accounts\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/no account connected/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const fbConnectBtn = frame
      .getByRole('button', { name: /connect account/i })
      .first();
    await expect(fbConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(fbConnectBtn).toBeDisabled({ timeout: 10_000 });
  });

  test('CG_10 [P0] Free plan limit: MMC Sync channel - button "Connect" disabled ở wizard Step 1 of 5', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    console.log('[CG_10] Navigate sang MMC Sync');
    const mmcLink = page
      .getByRole('link', { name: /^\s*MMC Sync\s*$/i })
      .first();
    let mmcViaSidebar = false;
    try {
      await mmcLink.click({ force: true, timeout: 10_000 });
      mmcViaSidebar = true;
    } catch {
      console.log('[CG_10] Force click sidebar fail -> fallback goto MMC URL');
    }
    if (!mmcViaSidebar) {
      await page.goto(APP_URL + '/sync-to-mmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg10-mmc-channel-locked.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByText(/get ready for bing\/microsoft shopping/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/step\s*1\s*of\s*5/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const mmcConnectBtn = frame
      .getByRole('button', { name: /^\s*Connect\s*$/i })
      .first();
    await expect(mmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(mmcConnectBtn).toBeDisabled({ timeout: 10_000 });
  });

  test('CG_10b [P0] Free plan limit: XML Feeds - button "Create your feed now" disabled khi GMC đã connect', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CG_10b] Navigate sang XML Feeds');
    const xmlLink = page
      .getByRole('link', { name: /^\s*XML Feeds\s*$/i })
      .first();
    let xmlViaSidebar = false;
    try {
      await xmlLink.click({ force: true, timeout: 10_000 });
      xmlViaSidebar = true;
    } catch {
      console.log('[CG_10b] Force click sidebar fail -> fallback goto XML URL');
    }
    if (!xmlViaSidebar) {
      await page.goto(APP_URL + '/product-feeds-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg10b-xml-feeds-page.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByRole('heading', { name: /^\s*XML Feeds\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    const createFeedNowBtn = frame
      .getByRole('button', { name: /^\s*Create your feed now\s*$/i })
      .first();
    await expect(createFeedNowBtn).toBeVisible({ timeout: 10_000 });
    await expect(createFeedNowBtn).toBeDisabled({ timeout: 10_000 });
  });

  test('CG_11 [P0] Xóa feed "GMC feed 1" -> empty state + button "Create first feed" enable', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Navigate về GMC Sync
    console.log('[CG_11] Navigate về GMC Sync để xóa feed');
    const gmcLink = page
      .getByRole('link', { name: /^\s*GMC Sync\s*$/i })
      .first();
    let navigated = false;
    try {
      await gmcLink.click({ force: true, timeout: 10_000 });
      navigated = true;
    } catch {
      console.log('[CG_11] Force click sidebar fail -> fallback goto URL');
    }
    if (!navigated) {
      await page.goto(APP_URL + '/sync-to-gmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(8000);

    await expect(
      frame.getByRole('heading', { name: /^\s*GMC Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(DATA_SOURCE_NAME).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cg11-before-delete.png', fullPage: true })
      .catch(() => {});

    const createNewBtn = frame
      .getByRole('button', { name: /^\s*Create new\s*$/i })
      .first();
    await expect(createNewBtn).toBeDisabled({ timeout: 10_000 });

    // Click delete icon ở row feed
    console.log('[CG_11] Click delete icon ở row feed');
    const feedRow = frame
      .locator('tr, [class*="Row"], [class*="row"]')
      .filter({ hasText: DATA_SOURCE_NAME })
      .first();

    let deleteClicked = false;
    const deleteByAria = feedRow
      .locator('button[aria-label*="delete" i], button[aria-label*="xóa" i], button[title*="delete" i]')
      .first();
    if (await deleteByAria.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteByAria.click({ force: true, timeout: 5000 });
      deleteClicked = true;
    } else {
      const buttons = feedRow.locator('button');
      const btnCount = await buttons.count();
      if (btnCount >= 3) {
        await buttons.nth(btnCount - 1).click({ force: true, timeout: 5000 });
        deleteClicked = true;
      }
    }
    if (!deleteClicked) {
      throw new Error('[CG_11] Không tìm được delete icon trong row feed');
    }
    await page.waitForTimeout(1500);

    await page
      .screenshot({ path: 'test-results/cg11-confirm-dialog.png', fullPage: true })
      .catch(() => {});

    // Popup confirm delete (page scope, giống FB)
    const deleteDialogTitle = page.getByText(/^\s*Delete this feed\??\s*$/i).first();
    await expect(deleteDialogTitle).toBeVisible({ timeout: 10_000 });
    console.log('[CG_11] Popup "Delete this feed?" đã mở');

    console.log('[CG_11] Click Delete trong popup để confirm xóa');
    await page
      .getByRole('button', { name: /^\s*Delete\s*$/i })
      .last()
      .click({ force: true, timeout: 10_000 });

    await expect(deleteDialogTitle).toBeHidden({ timeout: 10_000 });

    // Chờ 5s cho UI update sang empty state
    console.log('[CG_11] Chờ 5s cho UI update sang empty state...');
    await page.waitForTimeout(5000);

    await page
      .screenshot({ path: 'test-results/cg11-after-delete.png', fullPage: true })
      .catch(() => {});

    // Verify feed row biến mất
    await expect(
      frame.getByText(DATA_SOURCE_NAME).first()
    ).toBeHidden({ timeout: 10_000 });

    // Empty state + button "Create first feed" enabled
    await expect(
      frame.getByText(/no feeds created yet/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const createFirstFeedBtn = frame
      .getByRole('button', { name: /create first feed/i })
      .first();
    await expect(createFirstFeedBtn).toBeVisible({ timeout: 10_000 });
    await expect(createFirstFeedBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CG_11] Empty state + button "Create first feed" enabled');
  });

  test('CG_12 [P0] Sau khi xóa feed: Facebook Sync button Connect VẪN DISABLED (Google account còn connect)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CG_12] Navigate sang Facebook Sync sau khi xóa feed GMC');
    const fbLink = page
      .getByRole('link', { name: /^\s*Facebook Sync\s*$/i })
      .first();
    let viaSidebar = false;
    try {
      await fbLink.click({ force: true, timeout: 10_000 });
      viaSidebar = true;
    } catch {}
    if (!viaSidebar) {
      await page.goto(APP_URL + '/sync-to-fb-setting-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg12-fb-after-delete-feed.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByRole('heading', { name: /^\s*Facebook Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    const fbConnectBtn = frame
      .getByRole('button', { name: /connect account/i })
      .first();
    await expect(fbConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(fbConnectBtn).toBeDisabled({ timeout: 10_000 });
    console.log('[CG_12] FB channel vẫn locked vì Google account còn connect');
  });

  test('CG_13 [P0] Sau khi xóa feed: MMC Sync button Connect VẪN DISABLED (Google account còn connect)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CG_13] Navigate sang MMC Sync sau khi xóa feed GMC');
    const mmcLink = page
      .getByRole('link', { name: /^\s*MMC Sync\s*$/i })
      .first();
    let viaSidebar = false;
    try {
      await mmcLink.click({ force: true, timeout: 10_000 });
      viaSidebar = true;
    } catch {}
    if (!viaSidebar) {
      await page.goto(APP_URL + '/sync-to-mmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg13-mmc-after-delete-feed.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByText(/get ready for bing\/microsoft shopping/i).first()
    ).toBeVisible({ timeout: 15_000 });

    const mmcConnectBtn = frame
      .getByRole('button', { name: /^\s*Connect\s*$/i })
      .first();
    await expect(mmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(mmcConnectBtn).toBeDisabled({ timeout: 10_000 });
    console.log('[CG_13] MMC channel vẫn locked vì Google account còn connect');
  });

  test('CG_14 [P0] Disconnect Google account trên GMC Sync page -> panel chuyển về "No account connected"', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    console.log('[CG_14] Navigate về GMC Sync để disconnect Google account');
    const gmcLink = page
      .getByRole('link', { name: /^\s*GMC Sync\s*$/i })
      .first();
    let navigated = false;
    try {
      await gmcLink.click({ force: true, timeout: 10_000 });
      navigated = true;
    } catch {
      console.log('[CG_14] Force click sidebar fail -> fallback goto URL');
    }
    if (!navigated) {
      await page.goto(APP_URL + '/sync-to-gmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(8000);

    await expect(
      frame.getByRole('heading', { name: /^\s*GMC Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/^\s*Google accounts\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cg14-before-disconnect.png', fullPage: true })
      .catch(() => {});

    // Scope vào Polaris Card chứa heading "Google accounts" (mirror CF_14)
    console.log('[CG_14] Tìm button Disconnect icon trong Google accounts card');
    const gmcAccountsCard = frame
      .locator('[class*="Card"], [class*="card"], section, div')
      .filter({ has: frame.getByText(/^\s*Google accounts\s*$/i) })
      .filter({ hasNot: frame.getByText(/no account connected/i) })
      .first();

    // Dump toàn bộ button trong card để debug
    const allBtns = gmcAccountsCard.locator('button');
    const totalBtns = await allBtns.count();
    console.log(`[CG_14] Card có ${totalBtns} button tổng cộng`);
    for (let i = 0; i < totalBtns; i++) {
      const btn = allBtns.nth(i);
      const text = (await btn.innerText().catch(() => '')).trim().slice(0, 40);
      const aria = (await btn.getAttribute('aria-label').catch(() => '')) || '';
      const disabled = await btn.isDisabled().catch(() => false);
      console.log(`[CG_14]   Btn[${i}] text="${text}" aria="${aria}" disabled=${disabled}`);
    }

    let disconnectClicked = false;
    // Strategy 1: aria-label chứa disconnect/logout/sign-out
    const disconnectByAria = gmcAccountsCard
      .locator(
        'button[aria-label*="disconnect" i], button[aria-label*="log out" i], button[aria-label*="logout" i], button[aria-label*="sign out" i], button[title*="disconnect" i]'
      )
      .first();
    if (await disconnectByAria.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('[CG_14] Strategy 1: click button theo aria-label disconnect');
      await disconnectByAria.scrollIntoViewIfNeeded().catch(() => {});
      await disconnectByAria.click({ force: true, timeout: 5000 });
      disconnectClicked = true;
    } else {
      // Strategy 2: button trong card, không text Connect, không text matching các label không liên quan.
      // Mirror CF_14 result: Btn[0] = account row clickable, Btn[1] = disconnect icon (empty text) -> click empty-text button.
      console.log('[CG_14] Strategy 2: tìm button empty-text (icon only) trong card');
      const iconBtns = gmcAccountsCard
        .locator('button')
        .filter({ hasNotText: /connect|cancel|create|disconnect|re-login|request/i });
      const iconCount = await iconBtns.count();
      console.log(`[CG_14] Có ${iconCount} button empty-text candidates`);
      // Click từng cái và check nếu dialog xuất hiện
      for (let i = 0; i < iconCount; i++) {
        const btn = iconBtns.nth(i);
        try {
          await btn.scrollIntoViewIfNeeded().catch(() => {});
          await btn.click({ force: true, timeout: 3000 });
          await page.waitForTimeout(1500);
          const dialogHit = await page
            .getByText(/disconnect.*account\??|are you sure/i)
            .first()
            .isVisible({ timeout: 2000 })
            .catch(() => false);
          if (dialogHit) {
            console.log(`[CG_14] Button ${i} trigger dialog -> disconnect icon confirmed`);
            disconnectClicked = true;
            break;
          }
        } catch (err) {
          console.log(`[CG_14] Button ${i} click fail, thử tiếp`);
        }
      }
    }
    if (!disconnectClicked) {
      throw new Error('[CG_14] Không tìm được button Disconnect icon');
    }
    await page.waitForTimeout(2000);

    await page
      .screenshot({ path: 'test-results/cg14-after-click-disconnect.png', fullPage: true })
      .catch(() => {});

    // Có thể hiện confirmation dialog (page scope)
    const confirmDialog = page
      .getByText(/disconnect.*account\??|are you sure\??/i)
      .first();
    const hasConfirm = await confirmDialog.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasConfirm) {
      console.log('[CG_14] Confirmation dialog hiện, click Disconnect/Confirm');
      const confirmBtn = page
        .getByRole('button', { name: /^\s*(Disconnect|Confirm|OK|Yes)\s*$/i })
        .last();
      await confirmBtn.click({ force: true, timeout: 10_000 });
      await page.waitForTimeout(3000);
    }

    console.log('[CG_14] Chờ 5s cho UI update sau disconnect...');
    await page.waitForTimeout(5000);

    await page
      .screenshot({ path: 'test-results/cg14-after-disconnect.png', fullPage: true })
      .catch(() => {});

    // Verify: panel chuyển về state "No account connected" + button connect enable
    await expect(
      frame.getByText(/no account connected/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const gmcConnectBtn = frame
      .getByRole('button', { name: /connect( new)? account/i })
      .first();
    await expect(gmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(gmcConnectBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CG_14] Google account đã disconnect + button Connect trên GMC panel ENABLED');
  });

  test('CG_15 [P0] Sau disconnect Google: Facebook Sync button Connect chuyển ENABLED', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CG_15] Navigate sang Facebook Sync sau khi disconnect Google');
    const fbLink = page
      .getByRole('link', { name: /^\s*Facebook Sync\s*$/i })
      .first();
    let viaSidebar = false;
    try {
      await fbLink.click({ force: true, timeout: 10_000 });
      viaSidebar = true;
    } catch {}
    if (!viaSidebar) {
      await page.goto(APP_URL + '/sync-to-fb-setting-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg15-fb-after-disconnect.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByRole('heading', { name: /^\s*Facebook Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    const fbConnectBtn = frame
      .getByRole('button', { name: /connect( new)? account/i })
      .first();
    await expect(fbConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(fbConnectBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CG_15] FB channel UNLOCKED sau disconnect Google - button Connect ENABLED');
  });

  test('CG_16 [P0] Sau disconnect Google: MMC Sync button Connect chuyển ENABLED', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CG_16] Navigate sang MMC Sync sau khi disconnect Google');
    const mmcLink = page
      .getByRole('link', { name: /^\s*MMC Sync\s*$/i })
      .first();
    let viaSidebar = false;
    try {
      await mmcLink.click({ force: true, timeout: 10_000 });
      viaSidebar = true;
    } catch {}
    if (!viaSidebar) {
      await page.goto(APP_URL + '/sync-to-mmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg16-mmc-after-disconnect.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByText(/get ready for bing\/microsoft shopping/i).first()
    ).toBeVisible({ timeout: 15_000 });

    const mmcConnectBtn = frame
      .getByRole('button', { name: /^\s*Connect\s*$/i })
      .first();
    await expect(mmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(mmcConnectBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CG_16] MMC channel UNLOCKED sau disconnect Google - button Connect ENABLED');
  });

  test('CG_16b [P0] Sau disconnect Google: XML Feeds button "Create your feed now" chuyển ENABLED', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CG_16b] Navigate sang XML Feeds sau khi disconnect Google');
    const xmlLink = page
      .getByRole('link', { name: /^\s*XML Feeds\s*$/i })
      .first();
    let viaSidebar = false;
    try {
      await xmlLink.click({ force: true, timeout: 10_000 });
      viaSidebar = true;
    } catch {}
    if (!viaSidebar) {
      await page.goto(APP_URL + '/product-feeds-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg16b-xml-after-disconnect.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByRole('heading', { name: /^\s*XML Feeds\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    const createFeedNowBtn = frame
      .getByRole('button', { name: /^\s*Create your feed now\s*$/i })
      .first();
    await expect(createFeedNowBtn).toBeVisible({ timeout: 10_000 });
    await expect(createFeedNowBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CG_16b] XML Feeds UNLOCKED sau disconnect Google - button Create ENABLED');
  });

  test('CG_17 [P0] Products page: số sản phẩm sync về = min(activated, 100)', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const frame = appFrame(page);
    const MAX_PRODUCTS = 100;

    // Step 0: vào Dashboard đọc "X products activated in Shopify"
    console.log('[CG_17] Navigate sang Dashboard để đọc số products activated in Shopify');
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(10_000);
    await dismissChatbot(page);

    await page
      .screenshot({ path: 'test-results/cg17-dashboard.png', fullPage: true })
      .catch(() => {});

    const activatedLabel = frame.getByText(/activated in Shopify/i).first();
    await activatedLabel.waitFor({ state: 'visible', timeout: 20_000 });
    let activatedCount = NaN;
    let cur = activatedLabel.locator('xpath=..');
    for (let depth = 0; depth < 4 && isNaN(activatedCount); depth++) {
      const text = (((await cur.innerText().catch(() => '')) || '')
        .replace(/\s+/g, ' ')
        .trim());
      const m = text.match(/(\d+)\s*products?\s*activated in Shopify/i);
      if (m) {
        activatedCount = parseInt(m[1], 10);
        break;
      }
      cur = cur.locator('xpath=..');
    }
    if (isNaN(activatedCount)) {
      throw new Error('[CG_17] Không đọc được số "products activated in Shopify" trên Dashboard');
    }
    console.log(`[CG_17] Products activated in Shopify = ${activatedCount}`);

    const expectedCount = Math.min(activatedCount, MAX_PRODUCTS);
    console.log(
      `[CG_17] Expected products imported to Omega Feed = ${expectedCount} (min(${activatedCount}, ${MAX_PRODUCTS}))`
    );

    // Step 1: vào Products page
    console.log('[CG_17] Navigate sang Products page qua goto /products');
    await page.goto(APP_URL + '/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(15_000);
    await dismissChatbot(page);

    await page
      .screenshot({ path: 'test-results/cg17-products-initial.png', fullPage: true })
      .catch(() => {});

    console.log('[CG_17] Đọc badge "All products" để so sánh với expected');
    const allProductsLabel = frame.getByText(/^All products$/i).first();
    await allProductsLabel.waitFor({ state: 'visible', timeout: 20_000 });
    const pillText = (
      (await allProductsLabel.locator('xpath=..').innerText()) || ''
    )
      .replace(/\s+/g, ' ')
      .trim();
    const badgeMatch = pillText.match(/(\d+)/);
    if (!badgeMatch) {
      throw new Error(`[CG_17] Không đọc được số trong pill "All products", text="${pillText}"`);
    }
    const badgeCount = parseInt(badgeMatch[1], 10);
    console.log(`[CG_17] Badge "All products" = ${badgeCount}`);
    expect(badgeCount).toBe(expectedCount);

    // Step 1: chọn Rows per page = 50 qua button aria-label="Rows per page"
    console.log('[CG_17] Set Rows per page = 50 qua dropdown');
    let rppSet = false;
    const rppNativeSelect = frame.locator('select').filter({
      has: frame.locator('option', { hasText: /^\s*50\s*$/ }),
    }).first();
    try {
      await rppNativeSelect.selectOption({ label: '50' }, { timeout: 3000 });
      rppSet = true;
      console.log('[CG_17] Đã set rows/page = 50 qua native select');
    } catch {
      console.log('[CG_17] Không phải native select -> click custom dropdown');
    }
    if (!rppSet) {
      // Dùng aria-label chính xác để tránh click nhầm chatbot / button khác
      const rppBtn = frame.locator('button[aria-label="Rows per page" i]').first();
      await rppBtn.waitFor({ state: 'visible', timeout: 5000 });
      await rppBtn.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(800);
      const option50 = frame
        .getByRole('option', { name: /^\s*50\s*$/ })
        .or(frame.getByRole('menuitemradio', { name: /^\s*50\s*$/ }))
        .or(frame.getByRole('menuitem', { name: /^\s*50\s*$/ }));
      await option50.first().click({ force: true, timeout: 5000 });
    }
    await page.waitForTimeout(3000);

    await page
      .screenshot({ path: 'test-results/cg17-products-50perpage.png', fullPage: true })
      .catch(() => {});

    // Step 2: parse pagination "1/N" sau khi set 50/page
    const pageInfo = frame
      .locator('text=/^\\s*\\d+\\s*\\/\\s*\\d+\\s*$/')
      .first();
    await pageInfo.waitFor({ state: 'visible', timeout: 10_000 });
    const pageInfoText = ((await pageInfo.textContent()) || '').trim();
    const pageMatch = pageInfoText.match(/(\d+)\s*\/\s*(\d+)/);
    if (!pageMatch) {
      throw new Error(`[CG_17] Không parse được pagination "${pageInfoText}"`);
    }
    const totalPages = parseInt(pageMatch[2], 10);
    console.log(`[CG_17] Sau khi set 50/page -> table có ${totalPages} page`);

    // Step 3: loop qua từng page, click nút ">" (aria-label="Next page")
    const nextBtn = frame.locator('button[aria-label="Next page" i]').first();
    const rowsLoc = frame.locator('table tbody tr');

    let totalCount = 0;
    for (let p = 1; p <= totalPages; p++) {
      await page.waitForTimeout(1500);
      const rowsInPage = await rowsLoc.count();
      console.log(`[CG_17] Page ${p}/${totalPages}: ${rowsInPage} product, scroll từng row...`);
      // Scroll từ từ qua từng row để user quan sát table (mode --headed)
      for (let r = 0; r < rowsInPage; r++) {
        await rowsLoc.nth(r).scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(150);
      }
      totalCount += rowsInPage;
      if (p < totalPages) {
        // Scroll lại pagination bar trước khi click next
        await nextBtn.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(500);
        await nextBtn.click({ force: true, timeout: 5000 });
        await page.waitForTimeout(2500);
        const currText = ((await pageInfo.textContent()) || '').trim();
        const currMatch = currText.match(/(\d+)\s*\/\s*(\d+)/);
        const currPage = currMatch ? parseInt(currMatch[1], 10) : -1;
        if (currPage !== p + 1) {
          throw new Error(
            `[CG_17] Click next không advance: expect page ${p + 1}, đang ở "${currText}"`
          );
        }
      }
    }

    await page
      .screenshot({ path: 'test-results/cg17-products-last-page.png', fullPage: true })
      .catch(() => {});

    console.log(`[CG_17] Tổng product đếm qua ${totalPages} page = ${totalCount}`);
    expect(totalCount).toBe(expectedCount);
  });

  test('CG_18 [P0] Reconnect Google + tạo feed qua trang Create setting', async ({
    page,
  }) => {
    test.setTimeout(360_000);
    const frame = appFrame(page);
    const settingName = 'Google feed 1';

    // Pre-cond: CG_14 đã disconnect Google, CG_15/16/16b verify unlocked. Giờ reconnect + tạo feed.
    console.log('[CG_18] Navigate về GMC Sync');
    const gmcSyncLink = page
      .getByRole('link', { name: /^\s*GMC Sync\s*$/i })
      .first();
    try {
      await gmcSyncLink.click({ force: true, timeout: 10_000 });
    } catch {
      await page.goto(APP_URL + '/sync-to-gmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg18-before-connect.png', fullPage: true })
      .catch(() => {});

    // Click Connect -> Google OAuth popup (click-through, profile đã login sẵn)
    console.log('[CG_18] Click Connect trên GMC Sync -> chờ Google OAuth popup');
    const popupPromise = page.context().waitForEvent('page', { timeout: 30_000 });
    await frame
      .getByRole('button', { name: /^\s*Connect( account)?\s*$/i })
      .first()
      .click({ force: true, timeout: 10_000 });
    const googlePopup = await popupPromise;
    await googlePopup.waitForLoadState('domcontentloaded');
    console.log('[CG_18] Google OAuth popup đã mở');

    const clickInGooglePopup = async (label: string, locator: any, file: string) => {
      if (googlePopup.isClosed()) return;
      await googlePopup.screenshot({ path: file, fullPage: true }).catch(() => {});
      try {
        await locator.waitFor({ state: 'visible', timeout: 15_000 });
      } catch {
        console.log(`[CG_18] ${label}: element không xuất hiện`);
        return;
      }
      await locator.click({ force: true, timeout: 10_000 });
    };

    // Step A: Choose account -> click tile đầu (position-based, không leak email)
    await page.waitForTimeout(2000);
    await clickInGooglePopup(
      'Step A Choose account',
      googlePopup.locator('[data-authuser="0"], [data-identifier]').first(),
      'test-results/cg18-oauth-a.png'
    );
    // Step B: Continue signing back
    await googlePopup.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(2000);
    await clickInGooglePopup(
      'Step B Continue',
      googlePopup.getByRole('button', { name: /^\s*Continue\s*$/i }).first(),
      'test-results/cg18-oauth-b.png'
    );
    // Step C: Continue wants access
    await googlePopup.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(2000);
    await clickInGooglePopup(
      'Step C Continue',
      googlePopup.getByRole('button', { name: /^\s*Continue\s*$/i }).first(),
      'test-results/cg18-oauth-c.png'
    );
    if (!googlePopup.isClosed()) {
      await googlePopup.waitForEvent('close', { timeout: 60_000 }).catch(() => {});
    }
    await page.waitForTimeout(5000);
    console.log('[CG_18] OAuth hoàn tất, quay về app');

    await page
      .screenshot({ path: 'test-results/cg18-after-oauth.png', fullPage: true })
      .catch(() => {});

    // Sau reconnect Google: app mở trang "Create setting" (tabs Product settings/Mapping fields/Mapping rules)
    const createSettingMarker = frame
      .getByRole('heading', { name: /^\s*Create setting\s*$/i })
      .first();
    const createFirstBtn = frame
      .getByRole('button', { name: /^\s*Create first feed\s*$/i })
      .first();

    const createSettingOpen = await createSettingMarker
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!createSettingOpen) {
      console.log('[CG_18] Create setting chưa mở -> click "Create first feed" button');
      const createBtnVisible = await createFirstBtn
        .isVisible({ timeout: 8000 })
        .catch(() => false);
      if (!createBtnVisible) {
        throw new Error(
          '[CG_18] Sau OAuth không detect được "Create setting" lẫn button "Create first feed". Check cg18-after-oauth.png'
        );
      }
      await expect(createFirstBtn).toBeEnabled({ timeout: 10_000 });
      await createFirstBtn.click({ force: true, timeout: 10_000 });
      await page.waitForTimeout(5000);
    }
    await expect(createSettingMarker).toBeVisible({ timeout: 15_000 });
    console.log('[CG_18] Đã vào trang Create setting');

    // Helper: chọn option đầu tiên (bỏ placeholder) trong custom dropdown
    const pickFirstOptionInPopup = async (label: string) => {
      await page.waitForTimeout(1500);
      const opt = frame
        .getByRole('option')
        .filter({ hasNotText: /^\s*(Select|Create new)/i })
        .first();
      await opt.waitFor({ state: 'visible', timeout: 8000 });
      await opt.click({ force: true, timeout: 10_000 });
      console.log(`[CG_18] ${label}: đã chọn option đầu`);
    };

    // 1. Merchant Center Account: click dropdown -> option đầu
    console.log('[CG_18] Fill Merchant Center Account');
    await frame
      .getByLabel(/Merchant Center Account/i)
      .first()
      .click({ force: true, timeout: 10_000 });
    await pickFirstOptionInPopup('Merchant Center Account');
    await page.waitForTimeout(1500);

    // 2. Choose data source: Create new
    console.log('[CG_18] Fill Choose data source = Create new');
    await frame
      .getByLabel(/Choose data source/i)
      .first()
      .click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(1500);
    await frame
      .getByRole('option', { name: /Create new/i })
      .first()
      .click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(1500);

    // 3. Setting name = "Google feed 1"
    console.log(`[CG_18] Fill Setting name = "${settingName}"`);
    const settingNameInput = frame.getByLabel(/^\s*Setting name\s*$/i).first();
    await settingNameInput.fill(settingName, { timeout: 10_000 });
    await page.waitForTimeout(500);

    // 4. Product source: default radio
    // 5. Variant selection: default "All variants"
    // 6. Market settings: SKIP (Advanced plan)
    // 7. Product attributes: native <select> -> option index 1
    console.log('[CG_18] Product attributes: chọn option 2 cho Age group / Gender / Product condition');
    for (const attrLabel of [/Age group/i, /Gender/i, /Product condition/i]) {
      const sel = frame.getByLabel(attrLabel).first();
      await sel.selectOption({ index: 1 }).catch(async (err) => {
        console.log(`[CG_18] selectOption index 1 thất bại cho ${attrLabel}: ${err.message}`);
      });
      await page.waitForTimeout(300);
    }
    // 8. Schedule auto-sync: default
    // 9. Shipping & Tax: bỏ qua
    // 10. Sold-out items management: bỏ qua

    await page
      .screenshot({ path: 'test-results/cg18-create-setting-filled.png', fullPage: true })
      .catch(() => {});

    // 11. Click Save trên Shopify Contextual Save Bar (top-level page, ngoài iframe)
    console.log('[CG_18] Click Save trên Shopify Contextual Save Bar');
    await expect(
      page.getByText(/Unsaved changes/i).first()
    ).toBeVisible({ timeout: 15_000 });
    const saveBarBtn = page
      .locator('*')
      .filter({ has: page.getByText(/Unsaved changes/i) })
      .getByRole('button', { name: /^\s*Save\s*$/i })
      .first();
    await expect(saveBarBtn).toBeEnabled({ timeout: 10_000 });
    await saveBarBtn.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cg18-feed-created.png', fullPage: true })
      .catch(() => {});
    console.log(`[CG_18] Feed "${settingName}" đã tạo qua flow Connect + Create setting`);
  });
});
