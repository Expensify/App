/**
 * ApiUtils derives the staging flag on demand rather than caching it, so that what is known before the
 * environment resolves is not discarded once it does.
 *
 * The other ApiUtils suites drain the environment promise before their first assertion, so none of them can
 * exercise this. Here the mocked getEnvironment is deliberately left unsettled until the test resolves it.
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

// Held open so the test controls exactly when the environment becomes known.
let mockResolveEnvironment: (environment: string) => void = () => {};
const mockEnvironmentPromise = new Promise<string>((resolve) => {
    mockResolveEnvironment = resolve;
});

jest.mock('@src/libs/Environment/getEnvironment', () => ({
    __esModule: true,
    default: () => mockEnvironmentPromise,
}));

jest.mock('@src/CONFIG', () => ({__esModule: true, default: mockConfig}));

Onyx.init({keys: ONYXKEYS});

const ApiUtils = require<typeof ApiUtilsModule>('@libs/ApiUtils');

describe('ApiUtils when the stored preference arrives before the environment', () => {
    it('keeps a preference stored before the environment resolves', async () => {
        // Stored first, while ENV_NAME is still the PRODUCTION default
        await Onyx.set(ONYXKEYS.SHOULD_USE_STAGING_SERVER, true);
        await waitForBatchedUpdates();

        // A deliberate choice needs no environment to interpret it, so it applies straight away
        expect(ApiUtils.getApiRoot()).toBe(STAGING_API_ROOT);

        // The literal matches CONST.ENVIRONMENT.STAGING; hardcoded so the mock factory stays self-contained
        mockResolveEnvironment('staging');
        await waitForBatchedUpdates();

        // The preference was stored before anyone could interpret it, and must not have been discarded
        expect(ApiUtils.getApiRoot()).toBe(STAGING_API_ROOT);
        expect(ApiUtils.isUsingStagingApi()).toBe(true);
    });
});
