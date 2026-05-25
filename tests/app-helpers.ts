import { expect, Page } from '@playwright/test';

export const APP_URL =
  'https://admin.shopify.com/store/dev-feed17/apps/feed-data-by-omega';
export const INSTALLED_APPS_URL =
  'https://admin.shopify.com/store/dev-feed17/settings/apps?tab=installed';

export function appFrame(page: Page) {
  return page.frameLocator('iframe[src*="apps.feednexa.com"]').first();
}

/**
 * Dismiss the auto-opening support chatbot widget on Omega Feed pages.
 * Tries close/minimize buttons first; if none found, hides the widget via CSS
 * so it doesn't overlap table UI in screenshots or intercept clicks.
 */
export async function dismissChatbot(page: Page) {
  const frame = appFrame(page);
  // Strategy 1: click minimize/close button by aria-label
  const closeCandidates = [
    frame.locator('button[aria-label="Minimize" i]'),
    frame.locator('button[aria-label="Close" i]'),
    frame.locator('button[aria-label*="minimize chat" i]'),
    frame.locator('button[aria-label*="close chat" i]'),
  ];
  for (const cand of closeCandidates) {
    try {
      const first = cand.first();
      if (await first.isVisible({ timeout: 500 })) {
        await first.click({ force: true, timeout: 2000 });
        await page.waitForTimeout(300);
        return;
      }
    } catch {}
  }
  // Strategy 2: hide widget container via CSS (tìm qua text đặc trưng "Chat with support")
  try {
    await frame.locator('body').evaluate(() => {
      const triggerTexts = ['Chat with support', 'Live Chat'];
      const hideStyle = 'display:none !important;visibility:hidden !important;';
      for (const text of triggerTexts) {
        const nodes = Array.from(document.querySelectorAll('*')).filter(
          (el) => el.textContent?.trim() === text
        );
        for (const node of nodes) {
          let cur: Element | null = node;
          // Leo lên 10 tầng tìm ancestor có class chứa "chat"/"widget"/"popup"
          for (let i = 0; i < 10 && cur; i++) {
            const cls = (cur.getAttribute('class') || '').toLowerCase();
            if (
              cls.includes('chat') ||
              cls.includes('widget') ||
              cls.includes('popup') ||
              cls.includes('crisp') ||
              cls.includes('kchat')
            ) {
              (cur as HTMLElement).setAttribute(
                'style',
                ((cur as HTMLElement).getAttribute('style') || '') + ';' + hideStyle
              );
              break;
            }
            cur = cur.parentElement;
          }
        }
      }
    });
  } catch {}
}

export async function isAppInstalled(page: Page) {
  const link = page
    .locator('a[href*="/settings/apps/app_installations/app/feed-data-by-omega"]')
    .first();
  return await link.isVisible({ timeout: 5000 }).catch(() => false);
}

export async function uninstallApp(page: Page) {
  const appLink = page
    .locator('a[href*="/settings/apps/app_installations/app/feed-data-by-omega"]')
    .first();
  const row = page
    .locator('[class*="SettingsItem__wrapper"]')
    .filter({ has: appLink })
    .first();
  await row.getByRole('button', { name: /more actions/i }).first().click();
  await page.getByRole('menuitem', { name: /uninstall/i }).first().click();
  await page.waitForTimeout(600);
  await page
    .locator('button')
    .filter({ hasText: /^\s*Uninstall\s*$/ })
    .last()
    .click({ timeout: 10_000 });
  await appLink.waitFor({ state: 'hidden', timeout: 30_000 });
}

async function dumpInstallButtons(page: Page, label: string) {
  const info = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a[role="button"]'));
    return btns
      .map((b) => ({
        text: (b.textContent || '').trim().slice(0, 80),
        ariaLabel: b.getAttribute('aria-label') || '',
        dataTestId: b.getAttribute('data-testid') || '',
        visible: !!(b as HTMLElement).offsetParent,
      }))
      .filter(
        (b) =>
          /install/i.test(b.text) ||
          /install/i.test(b.ariaLabel) ||
          /install/i.test(b.dataTestId)
      )
      .slice(0, 10);
  });
  console.log(`[autoInstall ${label}] install-related elements:`, JSON.stringify(info));
}

export async function autoInstall(page: Page) {
  // Click Install ở landing + Install trong modal Polaris, loop tối đa 4 lần.
  for (let i = 0; i < 4; i++) {
    await page
      .waitForLoadState('domcontentloaded', { timeout: 20_000 })
      .catch(() => {});
    await page.waitForTimeout(2500);

    await dumpInstallButtons(page, `attempt ${i}`);
    await page.screenshot({ path: `test-results/autoInstall-attempt${i}.png`, fullPage: true }).catch(() => {});

    // Modal Polaris
    const modal = page.locator('[role="dialog"].Polaris-Modal-Dialog').first();
    if (await modal.isVisible({ timeout: 1500 }).catch(() => false)) {
      const modalBtn = modal
        .locator('button')
        .filter({ hasText: /^\s*Install\s*$/ })
        .first();
      if (await modalBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        console.log('[autoInstall] Click Install trong Polaris modal');
        await modalBtn.click({ timeout: 10_000 }).catch(() => {});
        await page.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => {});
        continue;
      }
    }

    // Landing: thử 4 selector strategies
    const strategies = [
      { name: 'button:has-text exact', loc: page.locator('button', { hasText: /^\s*Install\s*$/i }).first() },
      { name: 'role button Install', loc: page.getByRole('button', { name: /^\s*Install\s*$/i }).first() },
      { name: 'text Install in link', loc: page.locator('a[role="button"]', { hasText: /^\s*Install\s*$/i }).first() },
      { name: 'aria-label install app', loc: page.locator('[aria-label="Install app" i]').first() },
    ];
    let clicked = false;
    for (const s of strategies) {
      if (await s.loc.isVisible({ timeout: 1500 }).catch(() => false)) {
        console.log(`[autoInstall] Click Install bằng strategy: ${s.name}`);
        await s.loc.click({ timeout: 10_000 }).catch((e) => {
          console.log(`[autoInstall] Click fail: ${e.message}`);
        });
        await page.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => {});
        clicked = true;
        break;
      }
    }
    if (clicked) continue;

    console.log('[autoInstall] Không tìm thấy button Install ở iteration', i);
    return;
  }
}

async function readInstallState(page: Page) {
  return await page.evaluate(() => {
    const body = (document.body && document.body.innerText) || '';
    // Landing page "You don't have this app installed" - còn Install button = chưa cài xong
    const onLanding = /you don'?t have this app installed/i.test(body);
    if (onLanding) return 'landing';
    // Modal permission install của Shopify - còn đang prompt
    const hasInstallBtn = Array.from(document.querySelectorAll('button')).some((b) => {
      const t = (b.textContent || '').trim().toLowerCase();
      return t === 'install' || t === 'install app';
    });
    if (hasInstallBtn) return 'install-btn';
    if (body.length < 200) return 'loading';
    return 'ok';
  });
}

export async function assertAppInstalled(page: Page) {
  await expect(page).toHaveURL(/\/apps\/feed-data-by-omega/, { timeout: 30_000 });
  await expect
    .poll(readInstallState.bind(null, page), {
      timeout: 60_000,
      intervals: [1000, 1500, 2000, 3000],
    })
    .toBe('ok');
}

/**
 * Thử 1 lượt install: goto + autoInstall + đợi + check state.
 * Trả về true nếu state ok (không còn landing / install button).
 */
async function tryInstallOnce(page: Page) {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await autoInstall(page);
  await page.waitForTimeout(3000);
  const state = await readInstallState(page);
  return state === 'ok';
}

/**
 * Đảm bảo app ở trạng thái vừa install, popup onboard sẵn sàng hiện:
 * - Nếu app đã cài: uninstall + 30s + install lại.
 * - Nếu chưa cài: install lần đầu.
 * Popup onboard CHỈ hiện sau khi vừa install mới, nên mỗi spec pre-setup
 * phải force uninstall+reinstall — không được skip kể cả khi spec trước
 * đã reset trong cùng session.
 * Có retry: Shopify đôi khi throttle install ngay sau uninstall, cần retry.
 */
export async function ensureFreshInstall(page: Page) {
  await page.goto(INSTALLED_APPS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  if (await isAppInstalled(page)) {
    await uninstallApp(page);
    await page.waitForTimeout(30_000);
  }

  const MAX_ATTEMPTS = 3;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (await tryInstallOnce(page)) {
      return;
    }
    if (i < MAX_ATTEMPTS - 1) {
      console.log(
        `[ensureFreshInstall] Install attempt ${i + 1} chưa thành công, chờ 15s và retry...`
      );
      await page.waitForTimeout(15_000);
    }
  }

  // Nếu tới đây mà vẫn chưa ok, assertAppInstalled sẽ throw để test fail rõ ràng.
  await assertAppInstalled(page);
}
