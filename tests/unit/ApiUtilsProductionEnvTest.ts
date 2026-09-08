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
    // The literal value matches CONST.ENVIRONMENT.PRODUCTION. Hardcoded so the factory doesn't depend
    // on any `mock*`-prefixed module-scope binding (which would require a let-and-mutate dance).
    default: () => Promise.resolve('production'),
}));

jest.mock('@src/CONFIG', () => ({__esModule: true, default: mockConfig}));

Onyx.init({keys: ONYXKEYS});

// Lazy-require so the @src/CONFIG mock factory sees an initialized mockConfig. Otherwise the
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
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('a production build', () => {
    it.each([CONST.SERVER.STAGING, CONST.SERVER.QA])('ignores a stored %s and stays on production', async (storedServer) => {
        await setActiveServer(storedServer);

        expect(ApiUtils.getActiveServer()).toBe(CONST.SERVER.PRODUCTION);
        expect(ApiUtils.isQAServerActive()).toBe(false);
        expect(ApiUtils.getApiRoot()).toBe('https://www.expensify.com/');
    });
});
