import { test as base, chromium, expect, BrowserContext, Page } from '@playwright/test';

const CDP_URL = 'http://127.0.0.1:9222';

type Fixtures = {
  context: BrowserContext;
  page: Page;
};

// Init script inject CSS hide cho các class chatbot phổ biến.
// KHÔNG dùng MutationObserver (gây chậm page + risk crash). CSS rule static áp dụng cho
// mọi element match pattern, dù xuất hiện lúc nào.
const HIDE_CHATBOT_INIT_SCRIPT = `
(() => {
  const css = \`
    [class*="kchat" i],
    [class*="crisp" i],
    [class*="intercom" i],
    [class*="freshchat" i],
    [class*="tidio" i],
    [class*="tawk" i],
    [id*="kchat" i],
    [id*="crisp" i],
    [id*="chat-widget" i] {
      display: none !important;
      visibility: hidden !important;
    }
  \`;
  const install = () => {
    try {
      const style = document.createElement('style');
      style.setAttribute('data-hide-chatbot', '1');
      style.textContent = css;
      document.head.appendChild(style);
    } catch {}
  };
  if (document.head) install();
  else document.addEventListener('DOMContentLoaded', install);
})();
`;

export const test = base.extend<Fixtures>({
  context: async ({}, use, testInfo) => {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const ctx = browser.contexts()[0];
    if (!ctx) throw new Error('Chrome CDP không có context nào. Kiểm tra globalSetup.');
    // Inject vào mọi frame mới — ẩn chatbot trước khi render
    await ctx.addInitScript(HIDE_CHATBOT_INIT_SCRIPT);
    // Context attach qua CDP nên option `trace` trong config không áp dụng -> tự ghi trace,
    // chỉ giữ lại khi test fail (xem bằng: npx playwright show-trace <trace.zip>).
    const tracing = await ctx.tracing
      .start({ screenshots: true, snapshots: true, sources: true, title: testInfo.title })
      .then(() => true)
      .catch(() => false);
    await use(ctx);
    if (tracing) {
      const failed = testInfo.status !== testInfo.expectedStatus;
      const tracePath = testInfo.outputPath('trace.zip');
      await ctx.tracing.stop(failed ? { path: tracePath } : undefined).catch(() => {});
      if (failed) {
        await testInfo.attach('trace', { path: tracePath, contentType: 'application/zip' }).catch(() => {});
      }
    }
    // Chỉ disconnect, không close — Chrome do globalSetup quản lý.
    await browser.close();
  },
  page: async ({ context }, use, testInfo) => {
    const page = context.pages()[0] ?? (await context.newPage());
    // Page hiện tại đã load -> evaluate thủ công trong main frame và các iframe đã có
    for (const frame of page.frames()) {
      await frame.evaluate(HIDE_CHATBOT_INIT_SCRIPT).catch(() => {});
    }
    await use(page);
    // Chụp ảnh màn hình lúc fail, đính kèm vào report
    if (testInfo.status !== testInfo.expectedStatus) {
      const shot = await page.screenshot({ fullPage: true, timeout: 15_000 }).catch(() => null);
      if (shot) await testInfo.attach('screenshot-on-failure', { body: shot, contentType: 'image/png' });
    }
  },
});

export { expect };
