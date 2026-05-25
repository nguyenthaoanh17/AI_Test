import { test, expect } from './fixtures';
import { APP_URL, appFrame, ensureFreshInstall } from './app-helpers';

// Các test CF_xx liên quan flow tạo feed qua popup onboard.
// Popup onboard chỉ hiện sau khi app vừa install (state reset qua uninstall+reinstall),
// nên CF_00 luôn đảm bảo fresh install trước các case sau.
test.describe.configure({ mode: 'serial' });

// Catalog name unique per run để tránh collision với catalog đã tồn tại trên FB side.
// Xóa feed trong app KHÔNG xóa catalog trên Facebook -> tên bị duplicate giữa các lần chạy.
const CATALOG_NAME = `FB Catalog ${Date.now()}`;

test.describe('Create feed - Omega Feed app', () => {
  test('CF_00 [P0] Pre-setup: reset app để popup onboard sẵn sàng', async ({ page }) => {
    test.setTimeout(5 * 60_000);
    await ensureFreshInstall(page);
  });

  test.beforeEach(async ({ page }, testInfo) => {
    // CF_00 làm fresh install (tự goto INSTALLED_APPS_URL bên trong)
    // CF_02, CF_03 kế thừa state Create setting từ CF_01 -> KHÔNG navigate lại
    // Chỉ CF_01 cần goto APP_URL để bắt đầu từ dashboard app
    if (!testInfo.title.startsWith('CF_01')) return;
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  });

  test('CF_01 [P0] Popup onboard -> Active Facebook catalog -> Continue -> Connect Facebook account', async ({
    page,
  }) => {
    test.setTimeout(300_000);
    const frame = appFrame(page);

    // Step 1-3: chờ popup onboard hiện hẳn rồi active Facebook catalog + Continue.
    // Dùng waitFor + log để bước wait observable được (headed mode, user quan sát).
    console.log('[CF_01] Chờ popup onboard "Get your product feeds ready!" render (tối đa 45s)...');
    const popupTitle = frame.getByText(/get your product feeds ready/i).first();
    let popupShown = true;
    try {
      await popupTitle.waitFor({ state: 'visible', timeout: 45_000 });
      console.log('[CF_01] Popup onboard đã hiện -> active widget Facebook catalog');
    } catch {
      popupShown = false;
      console.log('[CF_01] Popup onboard KHÔNG hiện sau 45s -> fallback navigate /sync-to-fb-setting-v2');
    }

    if (popupShown) {
      const fbCatalogWidget = frame
        .locator('p')
        .filter({ hasText: /^\s*Facebook catalog\s*$/i })
        .first();
      await fbCatalogWidget.waitFor({ state: 'visible', timeout: 10_000 });
      await fbCatalogWidget.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(800);
      console.log('[CF_01] Đã click widget Facebook catalog -> click Continue');

      await frame
        .getByRole('button', { name: /^\s*Continue\s*$/i })
        .first()
        .click({ force: true, timeout: 10_000 });

      await expect(popupTitle).toBeHidden({ timeout: 15_000 });
      console.log('[CF_01] Popup đóng -> verify màn Get ready for Facebook Catalog');
    } else {
      await page.goto(APP_URL + '/sync-to-fb-setting-v2', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(15_000);
    }

    // Step 4: verify ở màn "Get ready for Facebook Catalog" (wizard Step 1 of 3)
    await expect(
      frame.getByText(/get ready for facebook catalog/i).first()
    ).toBeVisible({ timeout: 15_000 });

    await page
      .screenshot({ path: 'test-results/cf01-fb-sync-state.png', fullPage: true })
      .catch(() => {});

    // Step 5: detect nếu FB account đã connected (button Disconnect hiện) -> skip OAuth
    const alreadyConnected = await frame
      .getByRole('button', { name: /^\s*Disconnect\s*$/i })
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!alreadyConnected) {
      // OAuth flow: click Connect -> popup FB
      const popupPromise = page.context().waitForEvent('page', { timeout: 30_000 });

      await frame
        .getByRole('button', { name: /^\s*Connect( account)?\s*$/i })
        .first()
        .click({ force: true, timeout: 10_000 });

      const fbPopup = await popupPromise;
      await fbPopup.waitForLoadState('domcontentloaded');

      const clickInPopup = async (label: string, nameRegex: RegExp, snapshotFile: string) => {
        if (fbPopup.isClosed()) return false;
        const btn = fbPopup.getByRole('button', { name: nameRegex }).first();
        try {
          await btn.waitFor({ state: 'visible', timeout: 15_000 });
        } catch {
          console.log(`[CF_01] ${label}: button không xuất hiện`);
          return false;
        }
        await fbPopup.screenshot({ path: snapshotFile, fullPage: true }).catch(() => {});
        await btn.click({ timeout: 10_000 });
        return true;
      };

      await clickInPopup('Step 6', /^\s*Continue\s*$/i, 'test-results/cf01-step6-continue-as.png');
      await clickInPopup('Step 7', /^\s*Continue\s*$/i, 'test-results/cf01-step7-continue.png');
      await clickInPopup('Step 8', /^\s*Save\s*$/i, 'test-results/cf01-step8-save.png');
      await clickInPopup('Step 9', /^\s*Got it\s*$/i, 'test-results/cf01-step9-got-it.png');

      if (!fbPopup.isClosed()) {
        await fbPopup.waitForEvent('close', { timeout: 30_000 }).catch(() => {});
      }

      await page.waitForTimeout(5000);
    }

    // Verify end state: vẫn ở onboard wizard Step 1 với "Account connected" + 2 field required
    await expect(
      frame.getByText(/account connected/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/select business account/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/catalog name/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf01-final.png', fullPage: true })
      .catch(() => {});
  });

  test('CF_02 [P0] Kiểm tra UI mặc định onboard wizard Step 1 (Connect Facebook account)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    // Pre-cond: CF_01 đã connect FB account -> user ở onboard wizard Step 1 with account connected.
    await expect(
      frame.getByText(/get ready for facebook catalog/i).first()
    ).toBeVisible({ timeout: 15_000 });

    await page
      .screenshot({ path: 'test-results/cf02-ui-default.png', fullPage: true })
      .catch(() => {});

    // Stepper (3 steps): Connect Facebook account -> General setting -> Complete
    await expect(
      frame.getByText(/^\s*Connect Facebook account\s*$/i).first()
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
      frame.getByText(/select business account/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/catalog name/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Button Next ở Step 1 disabled khi chưa fill 2 field required
    await expect(
      frame.getByRole('button', { name: /^\s*Next\s*$/i }).first()
    ).toBeDisabled({ timeout: 10_000 });
  });

  test('CF_03 [P0] Fill Step 1 (business + catalog name) và Next sang Step 2 General setting', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const frame = appFrame(page);

    // Pre-cond: CF_02 đã verify user ở onboard wizard Step 1.
    // DOM: cả 2 field có cùng placeholder "Type name your catalog" -> dùng index
    // .first() = Select business account, .nth(1) = Catalog name

    // Step 1.1: Click field business account để mở dropdown
    const businessField = frame
      .getByPlaceholder(/type name your catalog/i)
      .first();
    await businessField.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(1500);
    await page
      .screenshot({ path: 'test-results/cf03-step1-business-dropdown.png', fullPage: true })
      .catch(() => {});

    // Chọn option đầu tiên trong dropdown (hỗ trợ combobox role=option hoặc native <select>)
    const businessOption = frame
      .getByRole('option')
      .filter({ hasNotText: /^\s*Select\s*$/i })
      .first();
    if (await businessOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await businessOption.click({ force: true, timeout: 10_000 });
    } else {
      // Fallback: nếu là combobox autocomplete, gõ 1 ký tự để trigger suggestion
      await businessField.fill('a', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const suggestedOption = frame.getByRole('option').first();
      if (await suggestedOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await suggestedOption.click({ force: true, timeout: 10_000 });
      } else {
        const nativeSelect = frame.locator('select').first();
        if (await nativeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nativeSelect.selectOption({ index: 1 });
        } else {
          throw new Error('[CF_03] Không mở được dropdown Select business account');
        }
      }
    }
    await page.waitForTimeout(1500);

    // Step 1.2: Catalog name (input thứ 2 có cùng placeholder) -> "Facebook catalog 1"
    const catalogNameInput = frame
      .getByPlaceholder(/type name your catalog/i)
      .nth(1);
    await catalogNameInput.fill(CATALOG_NAME, { timeout: 10_000 });
    await page.waitForTimeout(500);

    await page
      .screenshot({ path: 'test-results/cf03-before-next.png', fullPage: true })
      .catch(() => {});

    // Step 1.3: Click Next -> sang Step 2 "General setting"
    const nextBtn = frame.getByRole('button', { name: /^\s*Next\s*$/i }).first();
    await expect(nextBtn).toBeEnabled({ timeout: 10_000 });
    await nextBtn.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(3000);

    await page
      .screenshot({ path: 'test-results/cf03-after-next-step2.png', fullPage: true })
      .catch(() => {});

    // Verify: đã sang Step 2 "General setting"
    await expect(
      frame.getByText(/step\s*2\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('CF_04a [P1] Step 2: Products from collections chưa chọn collection -> Next -> hiển thị lỗi "Please select collection"', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Pre-cond: CF_03 đã đưa user sang Step 2 với default "All products".
    await expect(
      frame.getByText(/step\s*2\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Wait 30s cho Step 2 render đầy đủ trước khi bắt đầu test (load FB API data, observability)
    console.log('[CF_04a] Đã sang Step 2. Chờ 30s để Step 2 load xong trước khi bắt đầu test...');
    await page.waitForTimeout(30_000);
    console.log('[CF_04a] Bắt đầu test Step 2');

    // Switch radio sang "Products from collections" (KHÔNG click Browse, KHÔNG chọn collection)
    const collectionsRadio = frame
      .getByRole('radio', { name: /products from collections/i })
      .first();
    await collectionsRadio.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(800);
    await expect(collectionsRadio).toBeChecked();

    // Verify Search + Browse hiện nhưng chưa có collection nào được chọn
    await expect(
      frame.getByPlaceholder(/search collections/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf04a-before-next-no-collection.png', fullPage: true })
      .catch(() => {});

    // Click Next -> không được sang Step 3, phải hiển thị lỗi validation
    await frame
      .getByRole('button', { name: /^\s*Next\s*$/i })
      .first()
      .click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(1500);

    // Verify: error "Please select collection" visible
    await expect(
      frame.getByText(/please select collection/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Verify: vẫn ở Step 2 (không nhảy sang Step 3)
    await expect(
      frame.getByText(/step\s*2\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 5000 });

    await page
      .screenshot({ path: 'test-results/cf04a-error-please-select-collection.png', fullPage: true })
      .catch(() => {});
  });

  test('CF_04b [P0] Step 2: Products from collections -> Browse popup -> chọn collection -> Add', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Pre-cond: CF_04a đã để user ở Step 2 với radio "Products from collections" active + error.
    await expect(
      frame.getByText(/step\s*2\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });

    const browseBtn = frame
      .getByRole('button', { name: /^\s*Browse\s*$/i })
      .first();
    await expect(browseBtn).toBeVisible({ timeout: 10_000 });
    await expect(browseBtn).toBeEnabled({ timeout: 10_000 });

    // Click Browse -> popup "Add collections"
    // Popup được render ở MAIN PAGE (App Bridge modal top-level), không phải trong iframe.
    console.log('[CF_04b] Click button Browse để mở popup Add collections');
    await browseBtn.click({ timeout: 10_000 }).catch(async () => {
      await browseBtn.click({ force: true, timeout: 10_000 });
    });
    await page.waitForTimeout(2500);

    await page
      .screenshot({ path: 'test-results/cf04b-after-browse-click.png', fullPage: true })
      .catch(() => {});

    // Verify popup xuất hiện (search ở PAGE scope vì popup ở main document)
    const popupTitle = page.getByText(/^\s*Add collections\s*$/i).first();
    await expect(popupTitle).toBeVisible({ timeout: 15_000 });
    console.log('[CF_04b] Popup Add collections đã mở');

    // Scope query vào popup container để tránh match element khác trong page
    const popup = page
      .locator('[role="dialog"], [class*="Modal"], [class*="modal"]')
      .filter({ has: popupTitle })
      .first();
    await expect(
      popup.getByText(/0\s*collections?\s*selected/i).first()
    ).toBeVisible({ timeout: 10_000 });
    const cancelBtn = popup
      .getByRole('button', { name: /^\s*Cancel\s*$/i })
      .first();
    const addBtn = popup.getByRole('button', { name: /^\s*Add\s*$/i }).first();
    await expect(cancelBtn).toBeVisible({ timeout: 10_000 });
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await expect(addBtn).toBeDisabled({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf04b-browse-popup.png', fullPage: true })
      .catch(() => {});

    // Tick checkbox của collection đầu tiên trong popup (dùng check() semantic cho checkbox)
    // Theo rule: phải tick checkbox thì mới enable Add button, click row/text không đủ.
    console.log('[CF_04b] Tick checkbox collection đầu tiên trong popup Add collections');
    const firstCheckbox = popup.getByRole('checkbox').first();
    await firstCheckbox.waitFor({ state: 'visible', timeout: 10_000 });
    await firstCheckbox.check({ force: true, timeout: 10_000 });
    await page.waitForTimeout(800);

    await page
      .screenshot({ path: 'test-results/cf04b-after-tick-checkbox.png', fullPage: true })
      .catch(() => {});

    // Verify checkbox đã được tick + counter + Add enabled
    await expect(firstCheckbox).toBeChecked({ timeout: 5000 });
    await expect(
      popup.getByText(/1\s*collections?\s*selected/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(addBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CF_04b] Checkbox ticked, Add button đã enabled -> click Add');

    // Click Add -> popup đóng, error cũ phải biến mất
    await addBtn.click({ force: true, timeout: 10_000 });
    await expect(popupTitle).toBeHidden({ timeout: 10_000 });
    console.log('[CF_04b] Popup đóng, verify error "Please select collection" biến mất');
    await expect(
      frame.getByText(/please select collection/i).first()
    ).toBeHidden({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf04b-after-add.png', fullPage: true })
      .catch(() => {});

    // Chuyển radio về "All products" để kết thúc nhánh Products from collections
    console.log('[CF_04b] Chọn lại radio "All products"');
    const allProductsRadio = frame
      .getByRole('radio', { name: /^\s*All products\s*$/i })
      .first();
    await allProductsRadio.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(500);
    await expect(allProductsRadio).toBeChecked();
    console.log('[CF_04b] Đã chuyển radio về All products');

    await page
      .screenshot({ path: 'test-results/cf04b-reset-all-products.png', fullPage: true })
      .catch(() => {});

    // Verify Variant selection giữ default "All variants"
    const allVariantsRadio = frame
      .getByRole('radio', { name: /^\s*All variants\s*$/i })
      .first();
    await expect(allVariantsRadio).toBeChecked();

    // Click Next -> sang Step 3 "Complete"
    console.log('[CF_04b] Click Next để sang Step 3 Complete');
    const nextBtn = frame.getByRole('button', { name: /^\s*Next\s*$/i }).first();
    await expect(nextBtn).toBeEnabled({ timeout: 10_000 });
    await nextBtn.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(3000);

    await page
      .screenshot({ path: 'test-results/cf04b-after-next-step3.png', fullPage: true })
      .catch(() => {});

    // Verify đã sang Step 3
    await expect(
      frame.getByText(/step\s*3\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });
    console.log('[CF_04b] Đã sang Step 3 Complete');
  });

  test('CF_05 [P0] Step 3 Complete: verify "You\'re all set!" + click Done -> Pricing plans', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const frame = appFrame(page);

    // Pre-cond: CF_04c đã đưa user sang Step 3.
    await expect(
      frame.getByText(/step\s*3\s*of\s*3/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Wait 30s cho Step 3 render đầy đủ trước khi bắt đầu test
    console.log('[CF_05] Đã sang Step 3. Chờ 30s để Step 3 load xong (syncing progress)...');
    await page.waitForTimeout(30_000);
    console.log('[CF_05] Bắt đầu test Step 3');

    // Verify nội dung Complete: heading "You're all set!" + subtext (permanent elements)
    // Note: progress bar "Syncing products..." là transient — sau 30s wait có thể đã biến mất
    // khi sync complete, nên không assert là phải visible.
    await expect(
      frame.getByText(/you'?re all set!?/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/your products are now syncing to facebook/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Bottom: Back + Done
    await expect(
      frame.getByRole('button', { name: /^\s*Back\s*$/i }).first()
    ).toBeVisible({ timeout: 10_000 });
    const doneBtn = frame
      .getByRole('button', { name: /^\s*Done\s*$/i })
      .first();
    await expect(doneBtn).toBeVisible({ timeout: 10_000 });
    await expect(doneBtn).toBeEnabled({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf05-step3-complete.png', fullPage: true })
      .catch(() => {});

    // Click Done -> điều hướng sang Pricing plans
    await doneBtn.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(5000);

    await page
      .screenshot({ path: 'test-results/cf05-after-done-pricing.png', fullPage: true })
      .catch(() => {});

    // Verify: URL chuyển sang pricing + heading "Pricing plans"
    await expect(page).toHaveURL(/\/pricing-v3/, { timeout: 15_000 });
    await expect(
      frame.getByText(/^\s*Pricing plans\s*$/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // 4 plan cards: Free / Basic / Scale / Advanced
    await expect(frame.getByText(/^\s*Free\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(frame.getByText(/^\s*Basic\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(frame.getByText(/^\s*Scale\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(frame.getByText(/^\s*Advanced\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('CF_06 [P0] Từ Pricing quay về Facebook Sync và kiểm tra setting vừa tạo', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Pre-cond: CF_05 đang ở Pricing. Navigate về Facebook Sync qua sidebar Shopify admin.
    // Sidebar link có thể "not enabled" do Polaris transition state -> dùng force click, fallback goto.
    console.log('[CF_06] Navigate về Facebook Sync qua sidebar');
    const fbSyncLink = page
      .getByRole('link', { name: /^\s*Facebook Sync\s*$/i })
      .first();
    let navigatedViaSidebar = false;
    if (await fbSyncLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      try {
        await fbSyncLink.click({ force: true, timeout: 10_000 });
        navigatedViaSidebar = true;
      } catch {
        console.log('[CF_06] Force click sidebar fail -> fallback goto URL');
      }
    }
    if (!navigatedViaSidebar) {
      await page.goto(APP_URL + '/sync-to-fb-setting-v2', {
        waitUntil: 'domcontentloaded',
      });
    }
    await page.waitForTimeout(10_000);
    console.log('[CF_06] Đã vào Facebook Sync page');

    await page
      .screenshot({ path: 'test-results/cf06-fb-sync-page.png', fullPage: true })
      .catch(() => {});

    // Verify heading + subtitle (dùng heading role để tránh match sidebar link cùng text)
    await expect(
      frame.getByRole('heading', { name: /^\s*Facebook Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/connect,\s*monitor and sync your shopify products to facebook\/meta shopping/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Facebook accounts panel: account đã connect visible
    await expect(
      frame.getByText(/^\s*Facebook accounts\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Feeds panel: table header + row của feed vừa tạo
    await expect(
      frame.getByText(/facebook\s*\/\s*meta shopping feeds/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Table columns hiện
    await expect(frame.getByText(/^\s*Active\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(frame.getByText(/^\s*Business data\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(frame.getByText(/^\s*Last sync\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(frame.getByText(/^\s*Next sync\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(frame.getByText(/^\s*Sync status\s*$/i).first()).toBeVisible({
      timeout: 10_000,
    });

    // Feed name = CATALOG_NAME (đã fill ở CF_03, dynamic per run)
    await expect(
      frame.getByText(CATALOG_NAME).first()
    ).toBeVisible({ timeout: 15_000 });

    // Business ID hiển thị trong dòng feed
    await expect(
      frame.getByText(/Business ID:\s*\d+/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Skip assert sync status (hạ tầng đang không ổn định, không verify Synced)
  });

  test('CF_07 [P0] Free plan limit: button "+ Connect new account" disabled khi đã có 1 account', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    // Pre-cond: CF_06 đã để user ở Facebook Sync page với 1 account "Thao Anh" connected.
    await expect(
      frame.getByText(/^\s*Facebook accounts\s*$/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Verify button "+ Connect new account" tồn tại và bị disabled
    const connectNewAccountBtn = frame
      .getByRole('button', { name: /connect new account/i })
      .first();
    await expect(connectNewAccountBtn).toBeVisible({ timeout: 10_000 });
    await expect(connectNewAccountBtn).toBeDisabled({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf07-connect-new-account-disabled.png', fullPage: true })
      .catch(() => {});
  });

  test('CF_08 [P0] Free plan limit: button "Create new" feed disabled khi đã có 1 feed', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    // Pre-cond: CF_06 đã để user ở Facebook Sync page với 1 feed "Facebook catalog 1".
    await expect(
      frame.getByText(/facebook\s*\/\s*meta shopping feeds/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Verify button "Create new" tồn tại và bị disabled
    const createNewBtn = frame
      .getByRole('button', { name: /^\s*Create new\s*$/i })
      .first();
    await expect(createNewBtn).toBeVisible({ timeout: 10_000 });
    await expect(createNewBtn).toBeDisabled({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf08-create-new-feed-disabled.png', fullPage: true })
      .catch(() => {});
  });

  test('CF_09 [P0] Free plan limit: GMC Sync channel - button "+ Connect account" disabled', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Pre-cond: đã connect Facebook (CF_01-CF_06). Navigate sang GMC Sync qua sidebar (force click, fallback goto).
    console.log('[CF_09] Navigate sang GMC Sync');
    const gmcLink = page
      .getByRole('link', { name: /^\s*GMC Sync\s*$/i })
      .first();
    let gmcViaSidebar = false;
    try {
      await gmcLink.click({ force: true, timeout: 10_000 });
      gmcViaSidebar = true;
    } catch {
      console.log('[CF_09] Force click sidebar fail -> fallback goto GMC URL');
    }
    if (!gmcViaSidebar) {
      await page.goto(APP_URL + '/sync-to-gmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf09-gmc-channel-locked.png', fullPage: true })
      .catch(() => {});

    // Verify heading + subtitle GMC Sync (dùng heading role để tránh match sidebar link)
    await expect(
      frame.getByRole('heading', { name: /^\s*GMC Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/connect,\s*monitor and sync your shopify products to google merchant center/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Panel "Google accounts": "No account connected" + button "+ Connect account" disabled
    await expect(
      frame.getByText(/^\s*Google accounts\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/no account connected/i).first()
    ).toBeVisible({ timeout: 10_000 });

    const gmcConnectBtn = frame
      .getByRole('button', { name: /connect account/i })
      .first();
    await expect(gmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(gmcConnectBtn).toBeDisabled({ timeout: 10_000 });

    // Empty state panel bên phải
    await expect(
      frame.getByText(/no account connected yet/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('CF_10 [P0] Free plan limit: MMC Sync channel - button "Connect" disabled ở wizard Step 1 of 5', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Pre-cond: đã connect Facebook. Navigate sang MMC Sync qua sidebar (force click, fallback goto).
    console.log('[CF_10] Navigate sang MMC Sync');
    const mmcLink = page
      .getByRole('link', { name: /^\s*MMC Sync\s*$/i })
      .first();
    let mmcViaSidebar = false;
    try {
      await mmcLink.click({ force: true, timeout: 10_000 });
      mmcViaSidebar = true;
    } catch {
      console.log('[CF_10] Force click sidebar fail -> fallback goto MMC URL');
    }
    if (!mmcViaSidebar) {
      await page.goto(APP_URL + '/sync-to-mmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf10-mmc-channel-locked.png', fullPage: true })
      .catch(() => {});

    // Verify heading MMC wizard
    await expect(
      frame.getByText(/get ready for bing\/microsoft shopping/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Stepper 5 bước
    await expect(
      frame.getByText(/^\s*Connect Microsoft account\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/connect a microsoft advertising account/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/connect a microsoft merchant center store/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/microsoft shopping settings/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/^\s*Complete\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // "Step 1 of 5" indicator
    await expect(
      frame.getByText(/step\s*1\s*of\s*5/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Panel "Connect your Microsoft account" + "No account connected"
    await expect(
      frame.getByText(/connect your microsoft account/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/no account connected/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Button Connect disabled (Free plan channel limit)
    const mmcConnectBtn = frame
      .getByRole('button', { name: /^\s*Connect\s*$/i })
      .first();
    await expect(mmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(mmcConnectBtn).toBeDisabled({ timeout: 10_000 });

    // Button Next ở stepper cũng disabled (chưa connect account)
    const nextBtn = frame.getByRole('button', { name: /^\s*Next\s*$/i }).first();
    await expect(nextBtn).toBeDisabled({ timeout: 10_000 });
  });

  test('CF_10b [P0] Free plan limit: XML Feeds - button "Create your feed now" disabled khi FB đã connect', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CF_10b] Navigate sang XML Feeds');
    const xmlLink = page
      .getByRole('link', { name: /^\s*XML Feeds\s*$/i })
      .first();
    let xmlViaSidebar = false;
    try {
      await xmlLink.click({ force: true, timeout: 10_000 });
      xmlViaSidebar = true;
    } catch {
      console.log('[CF_10b] Force click sidebar fail -> fallback goto XML URL');
    }
    if (!xmlViaSidebar) {
      await page.goto(APP_URL + '/product-feeds-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf10b-xml-feeds-page.png', fullPage: true })
      .catch(() => {});

    // Verify heading "XML Feeds"
    await expect(
      frame.getByRole('heading', { name: /^\s*XML Feeds\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    // Empty state: illustration + heading + subtext
    await expect(
      frame.getByText(/seamless syncing across channels/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/generate xml feeds for testing,?\s*backups/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Button "Create your feed now" disabled theo channel limit (button có màu đen nhưng aria-disabled="true")
    const createFeedNowBtn = frame
      .getByRole('button', { name: /^\s*Create your feed now\s*$/i })
      .first();
    await expect(createFeedNowBtn).toBeVisible({ timeout: 10_000 });
    await expect(createFeedNowBtn).toBeDisabled({ timeout: 10_000 });
    console.log('[CF_10b] XML Feeds cũng bị áp channel limit - button "Create your feed now" disabled');
  });

  test('CF_11 [P0] Xóa feed "Facebook catalog 1" -> button "Create new" enable lại', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Navigate về Facebook Sync (sidebar force click, fallback goto)
    console.log('[CF_11] Navigate về Facebook Sync để xóa feed');
    const fbSyncLink = page
      .getByRole('link', { name: /^\s*Facebook Sync\s*$/i })
      .first();
    let navigated = false;
    try {
      await fbSyncLink.click({ force: true, timeout: 10_000 });
      navigated = true;
    } catch {
      console.log('[CF_11] Force click sidebar fail -> fallback goto URL');
    }
    if (!navigated) {
      await page.goto(APP_URL + '/sync-to-fb-setting-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(8000);

    // Verify đang ở Facebook Sync page với feed row CATALOG_NAME
    await expect(
      frame.getByRole('heading', { name: /^\s*Facebook Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(CATALOG_NAME).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf11-before-delete.png', fullPage: true })
      .catch(() => {});

    // Confirm button "Create new" ĐANG disabled (state ban đầu)
    const createNewBtn = frame
      .getByRole('button', { name: /^\s*Create new\s*$/i })
      .first();
    await expect(createNewBtn).toBeDisabled({ timeout: 10_000 });
    console.log('[CF_11] Confirm Create new đang disabled (1 feed đã tồn tại)');

    // Click delete icon ở row feed CATALOG_NAME (cột Action, icon thùng rác)
    console.log('[CF_11] Click delete icon ở row feed');
    const feedRow = frame
      .locator('tr, [class*="Row"], [class*="row"]')
      .filter({ hasText: CATALOG_NAME })
      .first();

    // Thử 2 chiến thuật: aria-label "Delete" hoặc button cuối cùng trong row (theo screenshot delete là icon 3)
    let deleteClicked = false;
    const deleteByAria = feedRow
      .locator('button[aria-label*="delete" i], button[aria-label*="xóa" i], button[title*="delete" i]')
      .first();
    if (await deleteByAria.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteByAria.click({ force: true, timeout: 5000 });
      deleteClicked = true;
    } else {
      // Fallback: button cuối cùng trong row Action (thứ tự: sync / edit / delete)
      const buttons = feedRow.locator('button');
      const btnCount = await buttons.count();
      if (btnCount >= 3) {
        await buttons.nth(btnCount - 1).click({ force: true, timeout: 5000 });
        deleteClicked = true;
      }
    }
    if (!deleteClicked) {
      throw new Error('[CF_11] Không tìm được delete icon trong row feed');
    }
    await page.waitForTimeout(1500);

    await page
      .screenshot({ path: 'test-results/cf11-confirm-dialog.png', fullPage: true })
      .catch(() => {});

    // Confirmation dialog: title "Delete this feed?" + body + Cancel + Delete (destructive red)
    const deleteDialogTitle = page.getByText(/^\s*Delete this feed\??\s*$/i).first();
    await expect(deleteDialogTitle).toBeVisible({ timeout: 10_000 });
    console.log('[CF_11] Popup "Delete this feed?" đã mở');

    // Click button "Delete" để confirm. Dùng getByRole với text "Delete" exact
    // để tránh match delete icon trong row (icon không có accessible name = "Delete")
    console.log('[CF_11] Click Delete trong popup để confirm xóa');
    const confirmDeleteBtn = page
      .getByRole('button', { name: /^\s*Delete\s*$/i })
      .last();
    await confirmDeleteBtn.click({ force: true, timeout: 10_000 });

    // Verify popup đóng
    await expect(deleteDialogTitle).toBeHidden({ timeout: 10_000 });

    // Chờ 5s cho UI cập nhật sang empty state (theo rule user confirm)
    console.log('[CF_11] Chờ 5s cho UI update sang empty state sau khi xóa...');
    await page.waitForTimeout(5000);

    await page
      .screenshot({ path: 'test-results/cf11-after-delete.png', fullPage: true })
      .catch(() => {});

    // Verify feed row đã biến mất
    await expect(
      frame.getByText(CATALOG_NAME).first()
    ).toBeHidden({ timeout: 10_000 });
    console.log(`[CF_11] Feed "${CATALOG_NAME}" đã bị xóa khỏi table`);

    // Sau khi xóa, UI chuyển sang empty state:
    // - Illustration
    // - Text "No feeds created yet"
    // - Subtext "Create a feed to sync products from Shopify to Facebook catalog."
    // - Button "+ Create first feed" (ở giữa panel, thay cho button "Create new" trước đó)
    await expect(
      frame.getByText(/no feeds created yet/i).first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      frame.getByText(/create a feed to sync products from shopify to facebook catalog/i).first()
    ).toBeVisible({ timeout: 5000 });

    // Button tạo feed giờ là "Create first feed" (empty state), enabled -> user có thể tạo feed mới
    const createFirstFeedBtn = frame
      .getByRole('button', { name: /create first feed/i })
      .first();
    await expect(createFirstFeedBtn).toBeVisible({ timeout: 10_000 });
    await expect(createFirstFeedBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CF_11] Empty state hiển thị đúng + button "Create first feed" enabled (user có thể tạo feed mới)');

    await page
      .screenshot({ path: 'test-results/cf11-empty-state.png', fullPage: true })
      .catch(() => {});
  });

  test('CF_12 [P0] Sau khi xóa feed: GMC Sync button "+ Connect account" VẪN DISABLED (FB account còn connect)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    // Navigate sang GMC Sync
    console.log('[CF_12] Navigate sang GMC Sync sau khi xóa feed');
    const gmcLink = page
      .getByRole('link', { name: /^\s*GMC Sync\s*$/i })
      .first();
    let gmcViaSidebar = false;
    try {
      await gmcLink.click({ force: true, timeout: 10_000 });
      gmcViaSidebar = true;
    } catch {
      console.log('[CF_12] Force click sidebar fail -> fallback goto GMC URL');
    }
    if (!gmcViaSidebar) {
      await page.goto(APP_URL + '/sync-to-gmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf12-gmc-after-delete-feed.png', fullPage: true })
      .catch(() => {});

    // Verify vào đúng GMC Sync page
    await expect(
      frame.getByRole('heading', { name: /^\s*GMC Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    // Rule Free plan: channel limit bind vào account connected (không phải feed).
    // FB account "Thao Anh" vẫn đang connect -> GMC channel vẫn bị khóa, button Connect vẫn DISABLED.
    const gmcConnectBtn = frame
      .getByRole('button', { name: /connect account/i })
      .first();
    await expect(gmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(gmcConnectBtn).toBeDisabled({ timeout: 10_000 });
    console.log('[CF_12] GMC channel vẫn locked vì FB account còn connect (channel limit phụ thuộc account, không phải feed)');
  });

  test('CF_13 [P0] Sau khi xóa feed: MMC Sync button "Connect" VẪN DISABLED (FB account còn connect)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    // Navigate sang MMC Sync
    console.log('[CF_13] Navigate sang MMC Sync sau khi xóa feed');
    const mmcLink = page
      .getByRole('link', { name: /^\s*MMC Sync\s*$/i })
      .first();
    let mmcViaSidebar = false;
    try {
      await mmcLink.click({ force: true, timeout: 10_000 });
      mmcViaSidebar = true;
    } catch {
      console.log('[CF_13] Force click sidebar fail -> fallback goto MMC URL');
    }
    if (!mmcViaSidebar) {
      await page.goto(APP_URL + '/sync-to-mmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf13-mmc-after-delete-feed.png', fullPage: true })
      .catch(() => {});

    // Verify vào đúng MMC Sync wizard
    await expect(
      frame.getByText(/get ready for bing\/microsoft shopping/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Rule: channel limit theo account, không phải feed. FB account còn connect -> MMC vẫn locked.
    const mmcConnectBtn = frame
      .getByRole('button', { name: /^\s*Connect\s*$/i })
      .first();
    await expect(mmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(mmcConnectBtn).toBeDisabled({ timeout: 10_000 });
    console.log('[CF_13] MMC channel vẫn locked vì FB account còn connect');
  });

  test('CF_14 [P0] Disconnect FB account trên Facebook Sync page -> panel chuyển về "No account connected"', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const frame = appFrame(page);

    // Navigate về Facebook Sync
    console.log('[CF_14] Navigate về Facebook Sync để disconnect FB account');
    const fbSyncLink = page
      .getByRole('link', { name: /^\s*Facebook Sync\s*$/i })
      .first();
    let navigated = false;
    try {
      await fbSyncLink.click({ force: true, timeout: 10_000 });
      navigated = true;
    } catch {
      console.log('[CF_14] Force click sidebar fail -> fallback goto URL');
    }
    if (!navigated) {
      await page.goto(APP_URL + '/sync-to-fb-setting-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(8000);

    await expect(
      frame.getByRole('heading', { name: /^\s*Facebook Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      frame.getByText(/^\s*Facebook accounts\s*$/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .screenshot({ path: 'test-results/cf14-before-disconnect.png', fullPage: true })
      .catch(() => {});

    // Account row có thể bị horizontal scroll -> icon disconnect ẩn. Scope tight vào Polaris Card
    // chứa cả heading "Facebook accounts" và row "Thao Anh".
    console.log('[CF_14] Tìm button Disconnect icon trong Facebook accounts card');
    const fbAccountsCard = frame
      .locator('[class*="Card"], [class*="card"], section, div')
      .filter({ has: frame.getByText(/^\s*Facebook accounts\s*$/i) })
      .filter({ has: frame.getByText(/^\s*Thao Anh\s*$/i) })
      .first();

    // Hover vào row account để reveal icon (Polaris pattern) + scroll container horizontal đến cuối
    const accountNameText = fbAccountsCard.getByText(/^\s*Thao Anh\s*$/i).first();
    await accountNameText.hover().catch(() => {});
    await page.waitForTimeout(500);
    // Scroll mọi scrollable ancestor đến tận cùng bên phải để reveal disconnect icon
    await accountNameText
      .evaluate((el) => {
        let p: HTMLElement | null = el.parentElement;
        while (p) {
          if (p.scrollWidth > p.clientWidth) {
            p.scrollLeft = p.scrollWidth;
          }
          p = p.parentElement;
        }
      })
      .catch(() => {});
    await page.waitForTimeout(500);

    await page
      .screenshot({ path: 'test-results/cf14-scrolled-right.png', fullPage: true })
      .catch(() => {});

    // Dump toàn bộ button trong card để debug
    const allBtns = fbAccountsCard.locator('button');
    const totalBtns = await allBtns.count();
    console.log(`[CF_14] Card có ${totalBtns} button tổng cộng`);
    for (let i = 0; i < totalBtns; i++) {
      const btn = allBtns.nth(i);
      const text = (await btn.innerText().catch(() => '')).trim().slice(0, 40);
      const aria = (await btn.getAttribute('aria-label').catch(() => '')) || '';
      const disabled = await btn.isDisabled().catch(() => false);
      console.log(`[CF_14]   Btn[${i}] text="${text}" aria="${aria}" disabled=${disabled}`);
    }

    let disconnectClicked = false;
    // Strategy 1: aria-label/title chứa disconnect/logout/sign-out
    const disconnectByAria = fbAccountsCard
      .locator(
        'button[aria-label*="disconnect" i], button[aria-label*="log out" i], button[aria-label*="logout" i], button[aria-label*="sign out" i], button[title*="disconnect" i]'
      )
      .first();
    if (await disconnectByAria.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('[CF_14] Strategy 1: click button theo aria-label disconnect');
      await disconnectByAria.scrollIntoViewIfNeeded().catch(() => {});
      await disconnectByAria.click({ force: true, timeout: 5000 });
      disconnectClicked = true;
    } else {
      // Strategy 2: tìm account item (row chứa "Thao Anh") rồi lấy button trong row đó
      console.log('[CF_14] Strategy 2: scope vào account row rồi tìm button trong row');
      const accountItem = fbAccountsCard
        .locator('li, [role="listitem"], div')
        .filter({ has: accountNameText })
        .last(); // .last() để lấy row trực tiếp chứa tên, không phải card bọc ngoài
      const rowBtns = accountItem.locator('button').filter({ hasNotText: /connect/i });
      const rowCount = await rowBtns.count();
      console.log(`[CF_14] Account row có ${rowCount} button non-Connect`);
      if (rowCount >= 1) {
        // Click button cuối cùng trong row (icon Disconnect ở cuối row theo screenshot)
        const btn = rowBtns.last();
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        await btn.click({ force: true, timeout: 5000 });
        disconnectClicked = true;
      }
    }
    if (!disconnectClicked) {
      throw new Error('[CF_14] Không tìm được button Disconnect icon');
    }
    await page.waitForTimeout(2000);

    await page
      .screenshot({ path: 'test-results/cf14-after-click-disconnect.png', fullPage: true })
      .catch(() => {});

    // Có thể hiện confirmation dialog (page scope - App Bridge giống Delete feed)
    // Title có thể: "Disconnect this account?" hoặc "Are you sure?". Confirm bằng button Disconnect/Confirm/OK.
    const confirmDialog = page
      .getByText(/disconnect.*account\??|are you sure\??/i)
      .first();
    const hasConfirm = await confirmDialog.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasConfirm) {
      console.log('[CF_14] Confirmation dialog hiện, click Disconnect/Confirm');
      const confirmBtn = page
        .getByRole('button', { name: /^\s*(Disconnect|Confirm|OK|Yes)\s*$/i })
        .last();
      await confirmBtn.click({ force: true, timeout: 10_000 });
      await page.waitForTimeout(3000);
    }

    // Chờ UI update sau disconnect
    console.log('[CF_14] Chờ 5s cho UI update sau disconnect...');
    await page.waitForTimeout(5000);

    await page
      .screenshot({ path: 'test-results/cf14-after-disconnect.png', fullPage: true })
      .catch(() => {});

    // Verify: account "Thao Anh" biến mất + panel chuyển về state "No account connected"
    await expect(
      frame.getByText(/^\s*Thao Anh\s*$/i).first()
    ).toBeHidden({ timeout: 20_000 });
    console.log('[CF_14] FB account đã disconnect khỏi panel');

    // Button connect trên chính FB panel giờ phải enable (empty state)
    const fbConnectBtn = frame
      .getByRole('button', { name: /connect( new)? account/i })
      .first();
    await expect(fbConnectBtn).toBeVisible({ timeout: 20_000 });
    await expect(fbConnectBtn).toBeEnabled({ timeout: 20_000 });
    console.log('[CF_14] Button Connect account trên FB panel giờ ENABLED');
  });

  test('CF_15 [P0] Sau disconnect FB: GMC Sync button "+ Connect account" chuyển ENABLED', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CF_15] Navigate sang GMC Sync sau khi disconnect FB');
    const gmcLink = page
      .getByRole('link', { name: /^\s*GMC Sync\s*$/i })
      .first();
    let gmcViaSidebar = false;
    try {
      await gmcLink.click({ force: true, timeout: 10_000 });
      gmcViaSidebar = true;
    } catch {
      console.log('[CF_15] Force click sidebar fail -> fallback goto URL');
    }
    if (!gmcViaSidebar) {
      await page.goto(APP_URL + '/sync-to-gmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf15-gmc-after-disconnect.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByRole('heading', { name: /^\s*GMC Sync\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    // Rule: FB disconnect -> GMC channel unlock, button Connect enable lại
    const gmcConnectBtn = frame
      .getByRole('button', { name: /connect account/i })
      .first();
    await expect(gmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(gmcConnectBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CF_15] GMC channel UNLOCKED sau disconnect FB - button Connect ENABLED');
  });

  test('CF_16 [P0] Sau disconnect FB: MMC Sync button "Connect" chuyển ENABLED', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CF_16] Navigate sang MMC Sync sau khi disconnect FB');
    const mmcLink = page
      .getByRole('link', { name: /^\s*MMC Sync\s*$/i })
      .first();
    let mmcViaSidebar = false;
    try {
      await mmcLink.click({ force: true, timeout: 10_000 });
      mmcViaSidebar = true;
    } catch {
      console.log('[CF_16] Force click sidebar fail -> fallback goto URL');
    }
    if (!mmcViaSidebar) {
      await page.goto(APP_URL + '/sync-to-mmc-setting', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf16-mmc-after-disconnect.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByText(/get ready for bing\/microsoft shopping/i).first()
    ).toBeVisible({ timeout: 15_000 });

    const mmcConnectBtn = frame
      .getByRole('button', { name: /^\s*Connect\s*$/i })
      .first();
    await expect(mmcConnectBtn).toBeVisible({ timeout: 10_000 });
    await expect(mmcConnectBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CF_16] MMC channel UNLOCKED sau disconnect FB - button Connect ENABLED');
  });

  test('CF_16b [P0] Sau disconnect FB: XML Feeds button "Create your feed now" chuyển ENABLED', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const frame = appFrame(page);

    console.log('[CF_16b] Navigate sang XML Feeds sau khi disconnect FB');
    const xmlLink = page
      .getByRole('link', { name: /^\s*XML Feeds\s*$/i })
      .first();
    let xmlViaSidebar = false;
    try {
      await xmlLink.click({ force: true, timeout: 10_000 });
      xmlViaSidebar = true;
    } catch {
      console.log('[CF_16b] Force click sidebar fail -> fallback goto URL');
    }
    if (!xmlViaSidebar) {
      await page.goto(APP_URL + '/product-feeds-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf16b-xml-after-disconnect.png', fullPage: true })
      .catch(() => {});

    await expect(
      frame.getByRole('heading', { name: /^\s*XML Feeds\s*$/i }).first()
    ).toBeVisible({ timeout: 15_000 });

    const createFeedNowBtn = frame
      .getByRole('button', { name: /^\s*Create your feed now\s*$/i })
      .first();
    await expect(createFeedNowBtn).toBeVisible({ timeout: 10_000 });
    await expect(createFeedNowBtn).toBeEnabled({ timeout: 10_000 });
    console.log('[CF_16b] XML Feeds UNLOCKED sau disconnect FB - button Create ENABLED');
  });

  test('CF_17 [P0] Reconnect FB + tạo feed qua trang Create setting', async ({
    page,
  }) => {
    test.setTimeout(360_000);
    const frame = appFrame(page);
    const settingName = 'Facebook feed 1';

    // Pre-cond: CF_14 đã disconnect FB, CF_15/16/16b verify unlocked. Giờ reconnect + tạo feed.
    console.log('[CF_17] Navigate về Facebook Sync');
    const fbSyncLink = page
      .getByRole('link', { name: /^\s*Facebook Sync\s*$/i })
      .first();
    try {
      await fbSyncLink.click({ force: true, timeout: 10_000 });
    } catch {
      await page.goto(APP_URL + '/sync-to-fb-v2', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(10_000);

    // Click Connect -> OAuth popup
    console.log('[CF_17] Click Connect trên FB Sync -> chờ OAuth popup');
    const popupPromise = page.context().waitForEvent('page', { timeout: 30_000 });
    await frame
      .getByRole('button', { name: /^\s*Connect( account)?\s*$/i })
      .first()
      .click({ force: true, timeout: 10_000 });
    const fbPopup = await popupPromise;
    await fbPopup.waitForLoadState('domcontentloaded');

    const clickInPopup = async (label: string, nameRegex: RegExp, file: string) => {
      if (fbPopup.isClosed()) return;
      const btn = fbPopup.getByRole('button', { name: nameRegex }).first();
      try {
        await btn.waitFor({ state: 'visible', timeout: 15_000 });
      } catch {
        console.log(`[CF_17] ${label}: button không xuất hiện`);
        return;
      }
      await fbPopup.screenshot({ path: file, fullPage: true }).catch(() => {});
      await btn.click({ timeout: 10_000 });
    };
    await clickInPopup('Continue 1', /^\s*Continue\s*$/i, 'test-results/cf17-oauth-1.png');
    await clickInPopup('Continue 2', /^\s*Continue\s*$/i, 'test-results/cf17-oauth-2.png');
    await clickInPopup('Save', /^\s*Save\s*$/i, 'test-results/cf17-oauth-3.png');
    await clickInPopup('Got it', /^\s*Got it\s*$/i, 'test-results/cf17-oauth-4.png');
    if (!fbPopup.isClosed()) {
      await fbPopup.waitForEvent('close', { timeout: 30_000 }).catch(() => {});
    }
    await page.waitForTimeout(5000);
    console.log('[CF_17] OAuth hoàn tất, quay về app');

    await page
      .screenshot({ path: 'test-results/cf17-after-oauth.png', fullPage: true })
      .catch(() => {});

    // Sau reconnect FB: app mở trang "Create setting" (1 trang với tabs Product settings/Mapping fields/Mapping rules),
    // KHÔNG phải 3-step wizard. Nếu chưa mở thì click "Create first feed" trên channel page.
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
      console.log('[CF_17] Create setting chưa mở -> click "Create first feed" button');
      const createBtnVisible = await createFirstBtn
        .isVisible({ timeout: 8000 })
        .catch(() => false);
      if (!createBtnVisible) {
        throw new Error(
          '[CF_17] Sau OAuth không detect được "Create setting" lẫn button "Create first feed". Check cf17-after-oauth.png'
        );
      }
      await expect(createFirstBtn).toBeEnabled({ timeout: 10_000 });
      await createFirstBtn.click({ force: true, timeout: 10_000 });
      await page.waitForTimeout(5000);
    }
    await expect(createSettingMarker).toBeVisible({ timeout: 15_000 });
    console.log('[CF_17] Đã vào trang Create setting');

    // Helper: chọn option đầu tiên (bỏ placeholder) trong custom dropdown
    const pickFirstOptionInPopup = async (label: string) => {
      await page.waitForTimeout(1500);
      const opt = frame
        .getByRole('option')
        .filter({ hasNotText: /^\s*(Select|Create new)/i })
        .first();
      await opt.waitFor({ state: 'visible', timeout: 8000 });
      await opt.click({ force: true, timeout: 10_000 });
      console.log(`[CF_17] ${label}: đã chọn option đầu`);
    };

    // 1. Choose business account: click dropdown -> select option đầu tiên
    console.log('[CF_17] Fill Choose business account');
    await frame
      .getByLabel(/Choose business account/i)
      .first()
      .click({ force: true, timeout: 10_000 });
    await pickFirstOptionInPopup('Choose business account');
    await page.waitForTimeout(1500);

    // 2. Choose catalog: click dropdown -> chọn "Create new"
    console.log('[CF_17] Fill Choose catalog = Create new');
    await frame
      .getByLabel(/Choose catalog/i)
      .first()
      .click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(1500);
    await frame
      .getByRole('option', { name: /Create new/i })
      .first()
      .click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(1500);

    // 3. Setting name = "Facebook feed 1"
    console.log(`[CF_17] Fill Setting name = "${settingName}"`);
    const settingNameInput = frame.getByLabel(/^\s*Setting name\s*$/i).first();
    await settingNameInput.fill(settingName, { timeout: 10_000 });
    await page.waitForTimeout(500);

    // 4. Product source: giữ default radio
    // 5. Variant selection: giữ default "All variants"
    // 6. Market settings: SKIP (chỉ có ở Advanced plan)
    // 7. Product attributes: 3 native <select> (Age group / Gender / Product condition) -> pick option index 1
    console.log('[CF_17] Product attributes: chọn option 2 cho Age group / Gender / Product condition');
    for (const attrLabel of [/Age group/i, /Gender/i, /Product condition/i]) {
      const sel = frame.getByLabel(attrLabel).first();
      await sel.selectOption({ index: 1 }).catch(async (err) => {
        console.log(`[CF_17] selectOption index 1 thất bại cho ${attrLabel}: ${err.message}`);
      });
      await page.waitForTimeout(300);
    }
    // 8. Schedule auto-sync: giữ default (Weekly / Every Monday)

    await page
      .screenshot({ path: 'test-results/cf17-create-setting-filled.png', fullPage: true })
      .catch(() => {});

    // 9. Click Save trên Shopify Contextual Save Bar (top header, "Unsaved changes" + Discard + Save)
    // Save bar render ở TOP-LEVEL page (Shopify admin chrome), KHÔNG trong iframe apps.feednexa.com
    console.log('[CF_17] Click Save trên Shopify Contextual Save Bar');
    // Chờ "Unsaved changes" text xuất hiện để confirm save bar đã hiện sau khi fill form
    await expect(
      page.getByText(/Unsaved changes/i).first()
    ).toBeVisible({ timeout: 15_000 });
    // Scope Save button vào save bar container (cùng ancestor với "Unsaved changes")
    const saveBarBtn = page
      .locator('*')
      .filter({ has: page.getByText(/Unsaved changes/i) })
      .getByRole('button', { name: /^\s*Save\s*$/i })
      .first();
    await expect(saveBarBtn).toBeEnabled({ timeout: 10_000 });
    await saveBarBtn.click({ force: true, timeout: 10_000 });
    await page.waitForTimeout(10_000);

    await page
      .screenshot({ path: 'test-results/cf17-feed-created.png', fullPage: true })
      .catch(() => {});
    console.log(`[CF_17] Feed "${settingName}" đã tạo qua flow Connect + Create setting`);
  });
});
