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
    // The literal value matches CONST.ENVIRONMENT.ADHOC. Hardcoded so the factory doesn't depend
    // on any `mock*`-prefixed module-scope binding (which would require a let-and-mutate dance).
    default: () => Promise.resolve('adhoc'),
}));

jest.mock('@src/CONFIG', () => ({__esModule: true, default: mockConfig}));

Onyx.init({keys: ONYXKEYS});

// Lazy-require so the @src/CONFIG mock factory sees an initialized mockConfig. Otherwise the
// hoisted import order would resolve CONFIG.default while mockConfig was still in the TDZ.
const ApiUtils = require<typeof ApiUtilsModule>('@libs/ApiUtils');

type CommandRequest = Parameters<typeof ApiUtils.getCommandURL>[0];

async function setActiveServer(value: ValueOf<typeof CONST.SERVER> | null) {
    await Onyx.set(ONYXKEYS.ACTIVE_SERVER, value);
    await waitForBatchedUpdates();
}

beforeAll(async () => {
    // Drain the initial getEnvironment().then(...) so ApiUtils subscribes to ACTIVE_SERVER.
    await waitForBatchedUpdates();
});

beforeEach(async () => {
    mockConfig.IS_USING_WEB_PROXY = false;
    mockConfig.IS_USING_LOCAL_WEB = false;
    mockConfig.EXPENSIFY.QA_API_ROOT = 'https://qa.exops.io/';
    // Clear so every test starts from the same Onyx state — otherwise same-value writes are deduped
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('ApiUtils', () => {
    describe('getApiRoot — URL resolution (env=ADHOC)', () => {
        describe('staging toggle', () => {
            it('toggle on → STAGING_API_ROOT', async () => {
                await setActiveServer(CONST.SERVER.STAGING);
                expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
            });

            it('toggle off → DEFAULT_API_ROOT', async () => {
                await setActiveServer(CONST.SERVER.PRODUCTION);
                expect(ApiUtils.getApiRoot()).toBe('https://www.expensify.com/');
            });

            it('toggle cleared → defaults to staging (adhoc default)', async () => {
                await setActiveServer(null);
                expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
            });
        });

        describe('web proxy', () => {
            it('proxy on + toggle on → proxyConfig.STAGING', async () => {
                mockConfig.IS_USING_WEB_PROXY = true;
                await setActiveServer(CONST.SERVER.STAGING);
                expect(ApiUtils.getApiRoot()).toBe('/staging/');
            });

            it('shouldSkipWebProxy + proxy on + toggle on → STAGING_API_ROOT (proxy bypassed)', async () => {
                mockConfig.IS_USING_WEB_PROXY = true;
                await setActiveServer(CONST.SERVER.STAGING);
                expect(ApiUtils.getApiRoot({shouldSkipWebProxy: true})).toBe('https://staging.expensify.com/');
            });

            it('shouldSkipWebProxy on non-staging path → EXPENSIFY_URL', async () => {
                await setActiveServer(CONST.SERVER.PRODUCTION);
                expect(ApiUtils.getApiRoot({shouldSkipWebProxy: true})).toBe('https://www.expensify.com/');
            });
        });

        describe('secure variants', () => {
            it('toggle off + secure → DEFAULT_SECURE_API_ROOT', async () => {
                await setActiveServer(CONST.SERVER.PRODUCTION);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true})).toBe('https://secure.expensify.com/');
            });

            it('toggle on + secure → STAGING_SECURE_API_ROOT', async () => {
                await setActiveServer(CONST.SERVER.STAGING);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true})).toBe('https://staging-secure.expensify.com/');
            });

            it('toggle on + secure + proxy → proxyConfig.STAGING_SECURE', async () => {
                mockConfig.IS_USING_WEB_PROXY = true;
                await setActiveServer(CONST.SERVER.STAGING);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true})).toBe('/staging-secure/');
            });

            it('shouldSkipWebProxy + secure (non-staging) → SECURE_EXPENSIFY_URL', async () => {
                await setActiveServer(CONST.SERVER.PRODUCTION);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true, shouldSkipWebProxy: true})).toBe('https://secure.expensify.com/');
            });
        });

        describe('forceProduction', () => {
            it('forceProduction + toggle on → DEFAULT_API_ROOT', async () => {
                await setActiveServer(CONST.SERVER.STAGING);
                expect(ApiUtils.getApiRoot(undefined, true)).toBe('https://www.expensify.com/');
            });

            it('forceProduction + toggle on + secure → DEFAULT_SECURE_API_ROOT', async () => {
                await setActiveServer(CONST.SERVER.STAGING);
                expect(ApiUtils.getApiRoot({shouldUseSecure: true}, true)).toBe('https://secure.expensify.com/');
            });
        });

        describe('env clamping (via IS_USING_LOCAL_WEB)', () => {
            it('IS_USING_LOCAL_WEB + toggle on → DEFAULT_API_ROOT (toggle force-disabled on local web)', async () => {
                mockConfig.IS_USING_LOCAL_WEB = true;
                await setActiveServer(CONST.SERVER.STAGING);
                expect(ApiUtils.getApiRoot()).toBe('https://www.expensify.com/');
            });
        });
    });

    describe('getCommandURL', () => {
        it('staging Ping → {root}api/Ping?', async () => {
            await setActiveServer(CONST.SERVER.STAGING);
            expect(ApiUtils.getCommandURL({command: 'Ping'} as CommandRequest)).toBe('https://staging.expensify.com/api/Ping?');
        });

        it('production Ping → {root}api/Ping?', async () => {
            await setActiveServer(CONST.SERVER.PRODUCTION);
            expect(ApiUtils.getCommandURL({command: 'Ping'} as CommandRequest)).toBe('https://www.expensify.com/api/Ping?');
        });

        it('omits extra ? when command already contains one', async () => {
            await setActiveServer(CONST.SERVER.PRODUCTION);
            expect(ApiUtils.getCommandURL({command: 'Ping?accountID=42'} as CommandRequest)).toBe('https://www.expensify.com/api/Ping?accountID=42');
        });

        it('routes through proxy when IS_USING_WEB_PROXY + toggle on', async () => {
            mockConfig.IS_USING_WEB_PROXY = true;
            await setActiveServer(CONST.SERVER.STAGING);
            expect(ApiUtils.getCommandURL({command: 'Ping'} as CommandRequest)).toBe('/staging/api/Ping?');
        });
    });

    describe('QA server routing', () => {
        it('is inactive by default', async () => {
            await setActiveServer(null);

            expect(ApiUtils.isQAServerActive()).toBe(false);
            expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
        });

        it('routes both roots to QA when activeServer is qa', async () => {
            await setActiveServer(CONST.SERVER.QA);

            expect(ApiUtils.isQAServerActive()).toBe(true);
            expect(ApiUtils.getActiveServer()).toBe(CONST.SERVER.QA);
            expect(ApiUtils.getApiRoot()).toBe('https://qa.exops.io/');
            expect(ApiUtils.getApiRoot({shouldUseSecure: true})).toBe('https://qa-secure.exops.io/');
        });

        it('never routes to QA when forceProduction is set', async () => {
            await setActiveServer(CONST.SERVER.QA);

            expect(ApiUtils.getApiRoot(undefined, true)).toBe('https://www.expensify.com/');
        });

        it('bypasses the web proxy for QA \u2014 Cloudflare matches CORS and the bearer against the real origin', async () => {
            mockConfig.IS_USING_WEB_PROXY = true;
            await setActiveServer(CONST.SERVER.QA);

            expect(ApiUtils.getApiRoot({shouldSkipWebProxy: false})).toBe('https://qa.exops.io/');
        });

        it('drops a stored qa once QA_EXPENSIFY_URL is cleared, rather than routing to an empty root', async () => {
            mockConfig.EXPENSIFY.QA_API_ROOT = '';
            await setActiveServer(CONST.SERVER.QA);

            expect(ApiUtils.isQAServerActive()).toBe(false);
            expect(ApiUtils.getApiRoot()).toBe('https://staging.expensify.com/');
        });

        it('stays on QA for an internal dev build \u2014 the one case IS_USING_LOCAL_WEB does not win', async () => {
            mockConfig.IS_USING_LOCAL_WEB = true;
            await setActiveServer(CONST.SERVER.QA);

            expect(ApiUtils.isQAServerActive()).toBe(true);
            expect(ApiUtils.getApiRoot()).toBe('https://qa.exops.io/');
        });
    });

    describe('server pinned on the request', () => {
        it('sends a request pinned to QA to QA while production is active', async () => {
            // Given production is the active server
            await setActiveServer(CONST.SERVER.PRODUCTION);

            // When a request is pinned to QA, like a LogOut sent while switching away from QA
            const apiRoot = ApiUtils.getApiRoot({server: CONST.SERVER.QA});

            // Then it goes to QA, whose database knows the token being signed out
            expect(apiRoot).toBe('https://qa.exops.io/');
        });

        it('sends a request pinned to production to production while QA is active', async () => {
            // Given the app has already switched to QA
            await setActiveServer(CONST.SERVER.QA);

            // When a request is pinned to production, the server the app just left
            const apiRoot = ApiUtils.getApiRoot({server: CONST.SERVER.PRODUCTION});

            // Then it still goes to production instead of following the switch
            expect(apiRoot).toBe('https://www.expensify.com/');
        });

        it('uses the secure host of the pinned server', async () => {
            // Given production is the active server
            await setActiveServer(CONST.SERVER.PRODUCTION);

            // When a secure request is pinned to QA
            const apiRoot = ApiUtils.getApiRoot({server: CONST.SERVER.QA, shouldUseSecure: true});

            // Then it goes to QA's secure host, because the pin replaces only the server, not the rest of the routing
            expect(apiRoot).toBe('https://qa-secure.exops.io/');
        });

        it('routes a request pinned to staging through the web proxy', async () => {
            // Given the web proxy is on and production is the active server
            mockConfig.IS_USING_WEB_PROXY = true;
            await setActiveServer(CONST.SERVER.PRODUCTION);

            // When a request is pinned to staging
            const apiRoot = ApiUtils.getApiRoot({server: CONST.SERVER.STAGING});

            // Then it takes the same proxy path an active staging server would
            expect(apiRoot).toBe('/staging/');
        });

        it('lets forceProduction win over a pinned server', async () => {
            // Given QA is the active server
            await setActiveServer(CONST.SERVER.QA);

            // When a request pinned to QA is resolved with forceProduction
            const apiRoot = ApiUtils.getApiRoot({server: CONST.SERVER.QA}, true);

            // Then it goes to production, because forceProduction callers must never reach another server
            expect(apiRoot).toBe('https://www.expensify.com/');
        });

        it('builds the command URL from the pinned server', async () => {
            // Given production is the active server
            await setActiveServer(CONST.SERVER.PRODUCTION);

            // When the URL for a LogOut pinned to QA is built
            const url = ApiUtils.getCommandURL({command: 'LogOut', server: CONST.SERVER.QA});

            // Then it points at QA
            expect(url).toBe('https://qa.exops.io/api/LogOut?');
        });
    });

    describe('getActiveServer', () => {
        it('returns staging when the staging server is active', async () => {
            await setActiveServer(CONST.SERVER.STAGING);
            expect(ApiUtils.getActiveServer()).toBe(CONST.SERVER.STAGING);
        });

        it('returns production when the production server is active', async () => {
            await setActiveServer(CONST.SERVER.PRODUCTION);
            expect(ApiUtils.getActiveServer()).toBe(CONST.SERVER.PRODUCTION);
        });

        it('returns qa when the QA server is active', async () => {
            await setActiveServer(CONST.SERVER.QA);
            expect(ApiUtils.getActiveServer()).toBe(CONST.SERVER.QA);
        });
    });
});
