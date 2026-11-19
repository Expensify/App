/**
 * getEnvironment() is awaited by ApiUtils and NetworkState at startup, so it must always settle. A beta check
 * that rejects — a missing native module, a throwing bridge call — would otherwise leave everything waiting on
 * the environment frozen, with nothing to show why.
 *
 * Required by path because jest-expo resolves the platform-agnostic specifier to the web implementation.
 */
import type getEnvironmentModule from '@libs/Environment/getEnvironment/index.native';
import type {getCachedEnvironment as getCachedEnvironmentModule} from '@libs/Environment/getEnvironment/index.native';

import CONST from '@src/CONST';

const mockIsBetaBuild = jest.fn<Promise<boolean>, []>();

jest.mock('@libs/Environment/betaChecker', () => ({
    __esModule: true,
    default: {isBetaBuild: () => mockIsBetaBuild()},
}));

jest.mock('react-native-config', () => ({
    __esModule: true,
    default: {ENVIRONMENT: 'production'},
}));

describe('getEnvironment (native)', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    it('resolves to production when the beta check rejects', async () => {
        mockIsBetaBuild.mockRejectedValue(new Error('EnvironmentChecker is not available'));
        const getEnvironment = require<{default: typeof getEnvironmentModule}>('@libs/Environment/getEnvironment/index.native').default;

        await expect(getEnvironment()).resolves.toBe(CONST.ENVIRONMENT.PRODUCTION);
    });

    it('resolves to staging when the beta check reports a beta build', async () => {
        mockIsBetaBuild.mockResolvedValue(true);
        const getEnvironment = require<{default: typeof getEnvironmentModule}>('@libs/Environment/getEnvironment/index.native').default;

        await expect(getEnvironment()).resolves.toBe(CONST.ENVIRONMENT.STAGING);
    });

    it('resolves to production when the beta check reports a production build', async () => {
        mockIsBetaBuild.mockResolvedValue(false);
        const getEnvironment = require<{default: typeof getEnvironmentModule}>('@libs/Environment/getEnvironment/index.native').default;

        await expect(getEnvironment()).resolves.toBe(CONST.ENVIRONMENT.PRODUCTION);
    });

    it('returns the environment resolved by the beta check synchronously', async () => {
        // Given a release build whose beta check reported a beta build at startup
        mockIsBetaBuild.mockResolvedValue(true);
        const {default: getEnvironment, getCachedEnvironment} = require<{
            default: typeof getEnvironmentModule;
            getCachedEnvironment: typeof getCachedEnvironmentModule;
        }>('@libs/Environment/getEnvironment/index.native');
        await getEnvironment();

        // When code that builds links while rendering reads the environment
        const environment = getCachedEnvironment();

        // Then it gets the resolved staging environment without waiting on a promise
        expect(environment).toBe(CONST.ENVIRONMENT.STAGING);
    });
});
