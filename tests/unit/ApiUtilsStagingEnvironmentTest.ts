/**
 * Covers how ApiUtils resolves the staging server toggle when the environment resolves to STAGING.
 *
 * This is the case a native beta build lands on, and the one the toggle exists for. It lives in its own file because
 * ApiUtils captures the environment once at module load, so a single test file can only exercise one environment.
 */
import type * as ApiUtilsModule from '@libs/ApiUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockConfig = {
    IS_USING_LOCAL_WEB: false,
    IS_USING_WEB_PROXY: false,
    EXPENSIFY: {
        DEFAULT_API_ROOT: 'https://www.expensify.com/',
        DEFAULT_SECURE_API_ROOT: 'https://secure.expensify.com/',
        STAGING_API_ROOT: 'https://staging.expensify.com/',
        STAGING_SECURE_API_ROOT: 'https://staging-secure.expensify.com/',
        EXPENSIFY_URL: 'https://www.expensify.com/',
        SECURE_EXPENSIFY_URL: 'https://secure.expensify.com/',
    },
};

jest.mock('@src/libs/Environment/getEnvironment', () => ({
    __esModule: true,
    // The literal value matches CONST.ENVIRONMENT.STAGING. Hardcoded so the factory doesn't depend
    // on any `mock*`-prefixed module-scope binding (which would require a let-and-mutate dance).
    default: () => Promise.resolve('staging'),
}));

jest.mock('@src/CONFIG', () => ({__esModule: true, default: mockConfig}));

Onyx.init({keys: ONYXKEYS});

// Lazy-require so the @src/CONFIG mock factory sees an initialized mockConfig — otherwise the
// hoisted import order would resolve CONFIG.default while mockConfig was still in the TDZ.
const ApiUtils = require<typeof ApiUtilsModule>('@libs/ApiUtils');

async function setStagingToggle(value: boolean | null) {
    await Onyx.set(ONYXKEYS.SHOULD_USE_STAGING_SERVER, value);
    await waitForBatchedUpdates();
}

beforeAll(async () => {
    // Drain the initial getEnvironment().then(...) so ApiUtils subscribes to SHOULD_USE_STAGING_SERVER.
    await waitForBatchedUpdates();
});

beforeEach(async () => {
    mockConfig.IS_USING_WEB_PROXY = false;
    mockConfig.IS_USING_LOCAL_WEB = false;
    // Clear so every test starts from the same Onyx state — otherwise same-value writes are deduped
    // and the ApiUtils subscription never re-runs with the updated CONFIG flags.
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('ApiUtils (env=STAGING)', () => {
    describe('staging toggle', () => {
        it('toggle cleared → STAGING_API_ROOT, because staging builds default to the staging server', async () => {
            await setStagingToggle(null);
            expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
            expect(ApiUtils.isUsingStagingApi()).toBe(true);
        });

        it('toggle on → STAGING_API_ROOT', async () => {
            await setStagingToggle(true);
            expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
        });

        it('honors the toggle being turned off', async () => {
            await setStagingToggle(false);
            expect(ApiUtils.getApiRoot()).toBe('https://www.expensify.com/');
            expect(ApiUtils.isUsingStagingApi()).toBe(false);
        });

        it('toggle on + secure → STAGING_SECURE_API_ROOT', async () => {
            await setStagingToggle(true);
            expect(ApiUtils.getApiRoot({shouldUseSecure: true})).toBe('https://staging-secure.expensify.com/');
        });
    });

    describe('forceProduction', () => {
        it('overrides the toggle', async () => {
            await setStagingToggle(true);
            expect(ApiUtils.getApiRoot(undefined, true)).toBe('https://www.expensify.com/');
        });
    });

    describe('env clamping (via IS_USING_LOCAL_WEB)', () => {
        it('IS_USING_LOCAL_WEB + toggle on → DEFAULT_API_ROOT (toggle force-disabled on local web)', async () => {
            mockConfig.IS_USING_LOCAL_WEB = true;
            await setStagingToggle(true);
            expect(ApiUtils.getApiRoot()).toBe('https://www.expensify.com/');
        });
    });
});
