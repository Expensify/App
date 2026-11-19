import type getEnvironmentModule from '@libs/Environment/getEnvironment/index.native';
/**
 * Native bundles evaluate this helper lazily on its first call, which happens while a report action renders.
 * The URL it builds has to carry the real environment origin on that very first call.
 */
import type getReportURLForCurrentContextModule from '@libs/Navigation/helpers/getReportURLForCurrentContext';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const mockIsBetaBuild = jest.fn<Promise<boolean>, []>();
const mockConfig = {ENVIRONMENT: CONST.ENVIRONMENT.DEV as string};

jest.mock('@libs/Environment/betaChecker', () => ({
    __esModule: true,
    default: {isBetaBuild: () => mockIsBetaBuild()},
}));

jest.mock('react-native-config', () => ({
    __esModule: true,
    default: mockConfig,
}));

// jest-expo resolves the platform-agnostic specifier to the web implementation, so point it at the native one.
jest.mock('@libs/Environment/getEnvironment', () => jest.requireActual<typeof getEnvironmentModule>('@libs/Environment/getEnvironment/index.native'));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => false));

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRoute: jest.fn(() => ''),
}));

function loadFreshModules() {
    const getReportURLForCurrentContext = require<{default: typeof getReportURLForCurrentContextModule}>('@libs/Navigation/helpers/getReportURLForCurrentContext').default;
    const getEnvironment = require<{default: typeof getEnvironmentModule}>('@libs/Environment/getEnvironment').default;
    return {getReportURLForCurrentContext, getEnvironment};
}

describe('getReportURLForCurrentContext first call (native)', () => {
    beforeEach(() => {
        jest.resetModules();
        mockIsBetaBuild.mockReset();
    });

    it('builds a dev URL on the first call of a freshly evaluated module', () => {
        // Given a dev build where nothing has evaluated the helper yet, like a cold start onto the held expense report
        mockConfig.ENVIRONMENT = CONST.ENVIRONMENT.DEV;
        const {getReportURLForCurrentContext} = loadFreshModules();

        // When the report action builds its link synchronously during the first render
        const url = getReportURLForCurrentContext('123');

        // Then the link has the real origin instead of "undefined/r/123", so the anchor renderer can parse it
        expect(url).toBe(`${CONST.DEV_NEW_EXPENSIFY_URL}${CONFIG.DEV_PORT}/${ROUTES.REPORT_WITH_ID.getRoute('123')}`);
    });

    it('uses the environment already resolved by the beta check', async () => {
        // Given a release build whose beta check resolved to staging at startup, before any report rendered
        mockConfig.ENVIRONMENT = CONST.ENVIRONMENT.PRODUCTION;
        mockIsBetaBuild.mockResolvedValue(true);
        const {getReportURLForCurrentContext, getEnvironment} = loadFreshModules();
        await getEnvironment();

        // When the helper is called for the first time
        const url = getReportURLForCurrentContext('123');

        // Then it reads the cached staging environment synchronously rather than waiting on its own promise
        expect(url).toBe(`${CONST.STAGING_NEW_EXPENSIFY_URL}/${ROUTES.REPORT_WITH_ID.getRoute('123')}`);
    });
});
