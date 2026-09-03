import type * as ApiUtilsModule from '@libs/ApiUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

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
        QA_API_ROOT: 'https://qa.exops.io/',
        QA_SECURE_API_ROOT: 'https://qa-secure.exops.io/',
        EXPENSIFY_URL: 'https://www.expensify.com/',
        SECURE_EXPENSIFY_URL: 'https://secure.expensify.com/',
    },
};

jest.mock('@src/libs/Environment/getEnvironment', () => ({
    __esModule: true,
    // The literal value matches CONST.ENVIRONMENT.QA. Hardcoded so the factory doesn't depend
    // on any `mock*`-prefixed module-scope binding (which would require a let-and-mutate dance).
    default: () => Promise.resolve('qa'),
}));

jest.mock('@src/CONFIG', () => ({__esModule: true, default: mockConfig}));

Onyx.init({keys: ONYXKEYS});

// Lazy-require so the @src/CONFIG mock factory sees an initialized mockConfig — otherwise the
// hoisted import order would resolve CONFIG.default while mockConfig was still in the TDZ.
const ApiUtils = require<typeof ApiUtilsModule>('@libs/ApiUtils');

async function setActiveServer(value: ValueOf<typeof CONST.SERVER> | null) {
    await Onyx.set(ONYXKEYS.ACTIVE_SERVER, value);
    await waitForBatchedUpdates();
}

beforeAll(async () => {
    // Drain the initial getEnvironment().then(...) so ApiUtils subscribes to ACTIVE_SERVER.
    await waitForBatchedUpdates();
});

beforeEach(async () => {
    mockConfig.EXPENSIFY.QA_API_ROOT = 'https://qa.exops.io/';
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('a QA build', () => {
    it.each([CONST.SERVER.PRODUCTION, CONST.SERVER.STAGING])('ignores a stored %s and stays on QA', async (storedServer) => {
        await setActiveServer(storedServer);

        expect(ApiUtils.getActiveServer()).toBe(CONST.SERVER.QA);
        expect(ApiUtils.isQAServerActive()).toBe(true);
        expect(ApiUtils.getApiRoot()).toBe('https://qa.exops.io/');
    });

    it('falls back to the environment default when QA_EXPENSIFY_URL is unset, rather than routing to an empty root', async () => {
        mockConfig.EXPENSIFY.QA_API_ROOT = '';
        await setActiveServer(CONST.SERVER.STAGING);

        expect(ApiUtils.isQAServerActive()).toBe(false);
        expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
    });
});
