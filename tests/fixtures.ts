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
  context: async ({}, use) => {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const ctx = browser.contexts()[0];
    if (!ctx) throw new Error('Chrome CDP không có context nào. Kiểm tra globalSetup.');
    // Inject vào mọi frame mới — ẩn chatbot trước khi render
    await ctx.addInitScript(HIDE_CHATBOT_INIT_SCRIPT);
    await use(ctx);
    // Chỉ disconnect, không close — Chrome do globalSetup quản lý.
    await browser.close();
  },
  page: async ({ context }, use) => {
    const page = context.pages()[0] ?? (await context.newPage());
    // Page hiện tại đã load -> evaluate thủ công trong main frame và các iframe đã có
    for (const frame of page.frames()) {
      await frame.evaluate(HIDE_CHATBOT_INIT_SCRIPT).catch(() => {});
    }
    await use(page);
  },
});

export { expect };
