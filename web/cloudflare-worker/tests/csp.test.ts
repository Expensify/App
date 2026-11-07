/** PNG exports fetch avatars, so the document CSP must allow more than displaying them. */
import assert from 'node:assert/strict';
import {after, before, describe, test} from 'node:test';

import createWorkerHarness from './createWorkerHarness.ts';

for (const environment of ['staging', 'production'] as const) {
    describe(`${environment} avatar export CSP`, () => {
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
    });
}
