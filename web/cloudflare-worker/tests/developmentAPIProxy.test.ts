/** The Worker must pass through exactly the paths Rsbuild proxies to the API, or API responses get SPA handling. */
import assert from 'node:assert/strict';
import {describe, test} from 'node:test';

import {API_PROXY_PATHS, isAPIRequest} from '../src/developmentAPIProxy.ts';

describe('live development API passthrough', () => {
    test('passes through every path Rsbuild proxies to the API', () => {
        // Given the shared list Rsbuild also proxies
        for (const prefix of API_PROXY_PATHS) {
            // When the Worker classifies the prefix and paths beneath it
            // Then they bypass the SPA fallback and HTML handling
            assert.ok(isAPIRequest(prefix), prefix);
            assert.ok(isAPIRequest(`${prefix}/Command?x=1`), prefix);
        }
    });

    test('does not treat app routes that only share a prefix as API requests', () => {
        // Given app paths that start with the same letters
        // When the Worker classifies them
        // Then they still get the app shell
        for (const prefix of API_PROXY_PATHS) {
            assert.equal(isAPIRequest(`${prefix}x`), false, prefix);
        }
        assert.equal(isAPIRequest('/settings'), false);
    });
});
