/**
 * Covers how ApiUtils resolves the staging server toggle when the environment resolves to STAGING.
 *
 * This lives in its own file because ApiUtils captures the environment once at module load, so a single test file can
 * only exercise one environment. ApiUtilsTest.ts covers ADHOC and ApiUtilsProductionEnvironmentTest.ts covers PRODUCTION.
 */
import type * as ApiUtilsModule from '@libs/ApiUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const PRODUCTION_API_ROOT = 'https://www.expensify.com/';
const STAGING_API_ROOT = 'https://staging.expensify.com/';

const mockConfig = {
    IS_USING_LOCAL_WEB: false,
    IS_USING_WEB_PROXY: false,
    EXPENSIFY: {
        DEFAULT_API_ROOT: PRODUCTION_API_ROOT,
        DEFAULT_SECURE_API_ROOT: 'https://secure.expensify.com/',
        STAGING_API_ROOT,
        STAGING_SECURE_API_ROOT: 'https://staging-secure.expensify.com/',
        EXPENSIFY_URL: PRODUCTION_API_ROOT,
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
    // Drain the initial getEnvironment().then(...) so ENV_NAME is set
    await waitForBatchedUpdates();
});

beforeEach(async () => {
    mockConfig.IS_USING_LOCAL_WEB = false;
    // Clear so every test starts from the same Onyx state — otherwise same-value writes are deduped
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('ApiUtils in a staging environment', () => {
    it('defaults to staging when the toggle was never set', async () => {
        await setStagingToggle(null);

        expect(ApiUtils.getApiRoot()).toBe(STAGING_API_ROOT);
        expect(ApiUtils.isUsingStagingApi()).toBe(true);
    });

    it('honours a deliberate opt-out', async () => {
        // A stored false must not be overridden by the staging default
        await setStagingToggle(false);

        expect(ApiUtils.getApiRoot()).toBe(PRODUCTION_API_ROOT);
        expect(ApiUtils.isUsingStagingApi()).toBe(false);
    });

    it('keeps the toggle on when it is explicitly set', async () => {
        await setStagingToggle(true);

        expect(ApiUtils.getApiRoot()).toBe(STAGING_API_ROOT);
    });

    it('ignores the toggle on the internal dev environment', async () => {
        await setStagingToggle(true);
        mockConfig.IS_USING_LOCAL_WEB = true;

        expect(ApiUtils.getApiRoot()).toBe(PRODUCTION_API_ROOT);
    });
});
