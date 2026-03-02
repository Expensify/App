import {findFocusedRoute, getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';
import Log from '@libs/Log';
import getStateForDynamicRoute from '@libs/Navigation/helpers/getStateForDynamicRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import type {Route} from '@src/ROUTES';

jest.mock('@react-navigation/native', () => ({
    findFocusedRoute: jest.fn(),
    getStateFromPath: jest.fn(),
}));

jest.mock('@libs/Log', () => ({
    warn: jest.fn(),
}));

jest.mock('@libs/Navigation/linkingConfig', () => ({
    linkingConfig: {
        config: {},
    },
}));

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        VERIFY_ACCOUNT: {
            path: 'verify-account',
            entryScreens: ['Settings', 'Wallet'],
        },
    },
}));

jest.mock('@libs/Navigation/helpers/getMatchingNewRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getRedirectedPath', () => jest.fn((path: string) => path));
jest.mock('@libs/Navigation/helpers/getStateForDynamicRoute', () => jest.fn());

describe('getStateFromPath', () => {
    const mockFindFocusedRoute = findFocusedRoute as jest.Mock;
    const mockRNGetStateFromPath = RNGetStateFromPath as jest.Mock;
    const mockGetStateForDynamicRoute = getStateForDynamicRoute as jest.Mock;
    const mockLogWarn = jest.spyOn(Log, 'warn');

    beforeEach(() => {
        jest.clearAllMocks();
        mockRNGetStateFromPath.mockReturnValue({});
    });

    it('should delegate to RN getStateFromPath for standard routes (non-dynamic)', () => {
        const path = '/settings/profile';

        const expectedState = {routes: [{name: 'Settings'}]};
        mockRNGetStateFromPath.mockReturnValue(expectedState);

        const result = getStateFromPath(path as unknown as Route);

        expect(result).toBe(expectedState);
    });

    it('should generate dynamic state when authorized screen is focused', () => {
        const fullPath = '/settings/wallet/verify-account';
        const baseRouteState = {routes: [{name: 'Wallet'}]};

        mockRNGetStateFromPath.mockReturnValue(baseRouteState);
        mockFindFocusedRoute.mockReturnValue({name: 'Wallet'});

        const expectedDynamicState = {routes: [{name: 'DynamicRoot'}]};
        mockGetStateForDynamicRoute.mockReturnValue(expectedDynamicState);

        const result = getStateFromPath(fullPath as unknown as Route);

        expect(result).toBe(expectedDynamicState);
        expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'VERIFY_ACCOUNT');
    });

    it('should fallback to standard RN parsing if focused screen is NOT authorized for dynamic route', () => {
        const fullPath = '/chat/verify-account';

        mockRNGetStateFromPath.mockReturnValue({});
        mockFindFocusedRoute.mockReturnValue({name: 'ChatScreen'});

        const standardState = {routes: [{name: 'Chat', params: {screen: 'verify-account'}}]};
        mockRNGetStateFromPath.mockReturnValue(standardState);

        const result = getStateFromPath(fullPath as unknown as Route);

        expect(result).toBe(standardState);
        expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('is not allowed to access dynamic route'));
    });
});
