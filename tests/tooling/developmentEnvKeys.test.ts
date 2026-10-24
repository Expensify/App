/** The app and the Worker CSP must see the same local backends, so the backend keys are defined once. */
import {describe, expect, test} from 'bun:test';

import {FORWARDED_DEVELOPMENT_ENV_KEYS, LOCAL_BACKEND_URL_KEYS, QA_ACCESS_TEAM_DOMAIN_KEY} from '../../config/rsbuild/developmentEnvKeys';
import {getDevelopmentConnectOrigins} from '../../scripts/utils/webDevConfig';

describe('development env keys', () => {
    test('forwards every backend the CSP allows to the app', () => {
        // Given the backend keys the launcher adds to the Worker CSP
        // When Rsbuild forwards development settings to the app
        // Then the app sees every one of those backends, and the QA Access issuer
        for (const key of [...LOCAL_BACKEND_URL_KEYS, QA_ACCESS_TEAM_DOMAIN_KEY]) {
            expect(FORWARDED_DEVELOPMENT_ENV_KEYS).toContain(key);
        }
    });

    test('allows each backend key in the CSP', () => {
        // Given a distinct origin for every backend key
        const env = Object.fromEntries(LOCAL_BACKEND_URL_KEYS.map((key, index) => [key, `https://backend-${index}.test/`]));
        // When the launcher resolves the CSP origins
        // Then none is missing
        expect(getDevelopmentConnectOrigins(env)).toHaveLength(LOCAL_BACKEND_URL_KEYS.length);
    });
});
