/** The document CSP must allow the requests that exports and third-party SDKs make, without allowing scripts from those hosts. */
import assert from 'node:assert/strict';
import {after, before, describe, test} from 'node:test';

import createWorkerHarness from './createWorkerHarness.ts';

for (const environment of ['staging', 'production'] as const) {
    describe(`${environment} document CSP`, () => {
        const {server, cleanup} = createWorkerHarness(environment);

        before(async () => {
            await server.listen();
        });

        after(async () => {
            await cleanup();
        });

        test('allows uploaded-avatar fetches without allowing every CloudFront origin', async () => {
            // Given a browser opening the app in this environment
            // When the Worker serves the document's policy
            const response = await server.fetch('/', {headers: {'MF-Sec-Fetch-Mode': 'navigate'}});
            const csp = response.headers.get('Content-Security-Policy') ?? '';
            const connectSources = csp
                .split('; ')
                .find((directive) => directive.startsWith('connect-src '))
                ?.split(' ')
                .slice(1);
            const scriptSources = csp
                .split('; ')
                .find((directive) => directive.startsWith('script-src '))
                ?.split(' ')
                .slice(1);

            // Then exports can fetch uploaded avatars without allowing unrelated CloudFront hosts, local mocks or scripts
            assert.ok(connectSources);
            assert.ok(connectSources.includes('https://d1wpcgnaa73g0y.cloudfront.net'));
            assert.ok(!connectSources.includes('https://*.cloudfront.net'));
            assert.ok(!connectSources.includes('*'));
            assert.ok(!connectSources.includes('https://expensify.com.dev:7070'));
            assert.ok(scriptSources);
            assert.ok(!scriptSources.includes('https://d1wpcgnaa73g0y.cloudfront.net'));
        });

        test('lets the fraud SDK reach the Burp Suite probe host without allowing scripts from it', async () => {
            // Given a browser opening the app in this environment
            // When the Worker serves the document's policy
            const response = await server.fetch('/', {headers: {'MF-Sec-Fetch-Mode': 'navigate'}});
            const csp = response.headers.get('Content-Security-Policy') ?? '';
            const connectSources = csp
                .split('; ')
                .find((directive) => directive.startsWith('connect-src '))
                ?.split(' ')
                .slice(1);
            const scriptSources = csp
                .split('; ')
                .find((directive) => directive.startsWith('script-src '))
                ?.split(' ')
                .slice(1);

            // Then the Group-IB Burp Suite check can make its request, and no script can load from that host
            assert.ok(connectSources);
            assert.ok(connectSources.includes('https://burp'));
            assert.ok(scriptSources);
            assert.ok(!scriptSources.includes('https://burp'));
        });
    });
}
