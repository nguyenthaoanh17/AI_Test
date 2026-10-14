import { defineConfig } from '@playwright/test';
import * as path from 'path';

export default defineConfig({
  // Spawn Chrome ngoài (với --user-data-dir=.auth-profile đã login) + expose CDP 9222.
  // Test attach vào Chrome đó qua fixture, nên không có footprint automation của Playwright
  // và Shopify coi gần như user thật.
  globalSetup: path.join(__dirname, 'globalSetup.ts'),
  globalTeardown: path.join(__dirname, 'globalTeardown.ts'),
  // CDP attach chỉ có 1 persistent context -> chạy 1 worker để tránh xung đột.
  workers: 1,
  fullyParallel: false,
  // HTML report: test fail có kèm screenshot + trace (mở bằng: npx playwright show-report)
  // json để scripts/make-report.js đối chiếu kết quả với file test case
  reporter: [['list'], ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }]],
  projects: [
    {
      name: 'setup',
      testMatch: /auth.setup.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
    },
  ],
});
