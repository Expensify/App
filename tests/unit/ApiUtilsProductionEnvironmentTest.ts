/**
 * Covers how ApiUtils resolves the staging server toggle when the environment resolves to PRODUCTION.
 *
 * This lives in its own file because ApiUtils captures the environment once at module load, so a single test file can
 * only exercise one environment. ApiUtilsTest.ts covers ADHOC and ApiUtilsStagingEnvironmentTest.ts covers STAGING.
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
    // The literal value matches CONST.ENVIRONMENT.PRODUCTION. Hardcoded so the factory doesn't depend
    // on any `mock*`-prefixed module-scope binding (which would require a let-and-mutate dance).
    default: () => Promise.resolve('production'),
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
    // and the ApiUtils subscription never re-runs with the updated CONFIG flags.
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('ApiUtils in a production environment', () => {
    it('routes to production when the toggle was never set', async () => {
        await setStagingToggle(null);

        expect(ApiUtils.getApiRoot()).toBe(PRODUCTION_API_ROOT);
        expect(ApiUtils.isUsingStagingApi()).toBe(false);
    });

    it('routes to production when the toggle is off', async () => {
        await setStagingToggle(false);

        expect(ApiUtils.getApiRoot()).toBe(PRODUCTION_API_ROOT);
    });

    it('honors the toggle when it is on', async () => {
        // A production build defaults to production, but a deliberate choice still wins: support hands staging
        // to customers on store builds, and testers on a Play testing track have no other way in.
        await setStagingToggle(true);

        expect(ApiUtils.getApiRoot()).toBe(STAGING_API_ROOT);
        expect(ApiUtils.isUsingStagingApi()).toBe(true);
    });

    it('ignores the toggle on the internal dev environment', async () => {
        await setStagingToggle(true);
        mockConfig.IS_USING_LOCAL_WEB = true;

        expect(ApiUtils.getApiRoot()).toBe(PRODUCTION_API_ROOT);
    });
});
