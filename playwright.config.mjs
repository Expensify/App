import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    workers: 1,
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://dev.new.expensify.com:8082',
        browserName: 'chromium',
        channel: 'chrome',
        ignoreHTTPSErrors: true,
        trace: 'retain-on-failure',
    },
});
