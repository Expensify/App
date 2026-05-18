import Onyx from 'react-native-onyx';
import type * as ApiUtilsModule from '@libs/ApiUtils';
import ONYXKEYS from '@src/ONYXKEYS';
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
    // The literal value matches CONST.ENVIRONMENT.ADHOC. Hardcoded so the factory doesn't depend
    // on any `mock*`-prefixed module-scope binding (which would require a let-and-mutate dance).
    default: () => Promise.resolve('adhoc'),
}));

jest.mock('@src/CONFIG', () => ({__esModule: true, default: mockConfig}));

Onyx.init({keys: ONYXKEYS});

// Lazy-require so the @src/CONFIG mock factory sees an initialized mockConfig — otherwise the
// hoisted import order would resolve CONFIG.default while mockConfig was still in the TDZ.
const ApiUtils = require<typeof ApiUtilsModule>('@libs/ApiUtils');

type CommandRequest = Parameters<typeof ApiUtils.getCommandURL>[0];

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

describe('ApiUtils', () => {
    describe('getApiRoot — URL resolution (env=ADHOC)', () => {
        describe('staging toggle', () => {
            it('toggle on → STAGING_API_ROOT', async () => {
                await setStagingToggle(true);
                expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
            });

            it('toggle off → DEFAULT_API_ROOT', async () => {
                await setStagingToggle(false);
                expect(ApiUtils.getApiRoot()).toBe('https://www.expensify.com/');
            });

            it('toggle cleared → defaults to staging (adhoc default)', async () => {
                await setStagingToggle(null);
                expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
            });
        });

        describe('web proxy', () => {
            it('proxy on + toggle on → proxyConfig.STAGING', async () => {
                mockConfig.IS_USING_WEB_PROXY = true;
                await setStagingToggle(true);
                expect(ApiUtils.getApiRoot()).toBe('/staging/');
            });

            it('shouldSkipWebProxy + proxy on + toggle on → STAGING_API_ROOT (proxy bypassed)', async () => {
                mockConfig.IS_USING_WEB_PROXY = true;
                await setStagingToggle(true);
                expect(ApiUtils.getApiRoot({shouldSkipWebProxy: true})).toBe('https://staging.expensify.com/');
            });

            it('shouldSkipWebProxy on non-staging path → EXPENSIFY_URL', async () => {
                await setStagingToggle(false);
                expect(ApiUtils.getApiRoot({shouldSkipWebProxy: true})).toBe('https://www.expensify.com/');
            });
        });

        describe('secure variants', () => {
            it('toggle off + secure → DEFAULT_SECURE_API_ROOT', async () => {
                await setStagingToggle(false);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true})).toBe('https://secure.expensify.com/');
            });

            it('toggle on + secure → STAGING_SECURE_API_ROOT', async () => {
                await setStagingToggle(true);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true})).toBe('https://staging-secure.expensify.com/');
            });

            it('toggle on + secure + proxy → proxyConfig.STAGING_SECURE', async () => {
                mockConfig.IS_USING_WEB_PROXY = true;
                await setStagingToggle(true);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true})).toBe('/staging-secure/');
            });

            it('shouldSkipWebProxy + secure (non-staging) → SECURE_EXPENSIFY_URL', async () => {
                await setStagingToggle(false);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true, shouldSkipWebProxy: true})).toBe('https://secure.expensify.com/');
            });
        });

        describe('forceProduction', () => {
            it('forceProduction + toggle on → DEFAULT_API_ROOT', async () => {
                await setStagingToggle(true);
                expect(ApiUtils.getApiRoot(undefined, true)).toBe('https://www.expensify.com/');
            });

            it('forceProduction + toggle on + secure → DEFAULT_SECURE_API_ROOT', async () => {
                await setStagingToggle(true);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true}, true)).toBe('https://secure.expensify.com/');
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

    describe('getCommandURL', () => {
        it('staging Ping → {root}api/Ping?', async () => {
            await setStagingToggle(true);
            expect(ApiUtils.getCommandURL({command: 'Ping'} as CommandRequest)).toBe('https://staging.expensify.com/api/Ping?');
        });

        it('production Ping → {root}api/Ping?', async () => {
            await setStagingToggle(false);
            expect(ApiUtils.getCommandURL({command: 'Ping'} as CommandRequest)).toBe('https://www.expensify.com/api/Ping?');
        });

        it('omits extra ? when command already contains one', async () => {
            await setStagingToggle(false);
            expect(ApiUtils.getCommandURL({command: 'Ping?accountID=42'} as CommandRequest)).toBe('https://www.expensify.com/api/Ping?accountID=42');
        });

        it('routes through proxy when IS_USING_WEB_PROXY + toggle on', async () => {
            mockConfig.IS_USING_WEB_PROXY = true;
            await setStagingToggle(true);
            expect(ApiUtils.getCommandURL({command: 'Ping'} as CommandRequest)).toBe('/staging/api/Ping?');
        });
    });

    describe('isUsingStagingApi', () => {
        it('returns true when toggle is on', async () => {
            await setStagingToggle(true);
            expect(ApiUtils.isUsingStagingApi()).toBe(true);
        });

        it('returns false when toggle is off', async () => {
            await setStagingToggle(false);
            expect(ApiUtils.isUsingStagingApi()).toBe(false);
        });
    });
});
