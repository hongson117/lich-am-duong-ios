import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 45000, fullyParallel: false, workers: 1,
  use: { ...devices['iPhone 13'], browserName: 'chromium', channel: 'msedge', baseURL: 'http://127.0.0.1:4318', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4318', reuseExistingServer: true, timeout: 15000 },
  reporter: [['list'], ['html', { open: 'never' }]],
});
