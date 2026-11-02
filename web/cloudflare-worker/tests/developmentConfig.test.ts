/** The live Worker's launcher-provided vars should be validated once, with errors that name the bad variable. */
import assert from 'node:assert/strict';
import {describe, test} from 'node:test';

import getDevelopmentConfig from '../src/developmentConfig.ts';

const VALID_VARS = {DEV_UPSTREAM: 'http://127.0.0.1:8083', DEV_CONNECT_ORIGINS: '["https://www.expensify.com.dev","http://backend.test:8080"]'};

describe('live development Worker configuration', () => {
    test('parses the upstream and backend origins', () => {
        // Given vars from the launcher
        // When the Worker reads them
        const config = getDevelopmentConfig(VALID_VARS);
        // Then it gets a loopback upstream and exact backend origins
        assert.equal(config.upstream.href, 'http://127.0.0.1:8083/');
        assert.deepEqual(config.backendOrigins, ['https://www.expensify.com.dev', 'http://backend.test:8080']);
    });

    test('validates the vars once rather than on every request', () => {
        // Given the same vars on every request
        // When the Worker reads them repeatedly
        // Then it reuses the validated configuration
        assert.equal(getDevelopmentConfig({...VALID_VARS}), getDevelopmentConfig({...VALID_VARS}));
    });

    for (const DEV_UPSTREAM of ['not a url', 'https://127.0.0.1:8083', 'http://example.test:8083', 'http://127.0.0.1', 'http://127.0.0.1:8083/path']) {
        test(`names DEV_UPSTREAM when it is not an HTTP loopback origin: ${DEV_UPSTREAM}`, () => {
            assert.throws(() => getDevelopmentConfig({...VALID_VARS, DEV_UPSTREAM}), /DEV_UPSTREAM/);
        });
    }

    for (const DEV_CONNECT_ORIGINS of ['not json', '"https://example.test"', '[1]', '["https://example.test/path"]', '["file:///etc/hosts"]', '["https://user:pass@example.test"]']) {
        test(`names DEV_CONNECT_ORIGINS when it is not a JSON array of HTTP(S) origins: ${DEV_CONNECT_ORIGINS}`, () => {
            assert.throws(() => getDevelopmentConfig({...VALID_VARS, DEV_CONNECT_ORIGINS}), /DEV_CONNECT_ORIGINS/);
        });
    }
});
