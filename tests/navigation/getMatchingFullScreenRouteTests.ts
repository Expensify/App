import {findFocusedRoute} from '@react-navigation/native';
import {getMatchingFullScreenRoute} from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    normalizedConfigs: {},
}));

jest.mock('@libs/ReportUtils', () => ({
    getReportOrDraftReport: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/getStateFromPath', () => jest.fn());
jest.mock('@react-navigation/native', () => ({
    findFocusedRoute: jest.fn(),
}));

jest.mock('@libs/Navigation/linkingConfig/RELATIONS', () => {
    const SIDEBAR_TO_SPLIT = {SETTINGS_ROOT: 'SettingsSplitNavigator'};
    const SPLIT_TO_SIDEBAR = {SettingsSplitNavigator: 'SETTINGS_ROOT'};
    return {
        RHP_TO_DOMAIN: {},
        RHP_TO_HOME: {Home: 'home'},
        RHP_TO_SEARCH: {},
        RHP_TO_SETTINGS: {},
        RHP_TO_SIDEBAR: {},
        RHP_TO_WORKSPACE: {},
        RHP_TO_WORKSPACES_LIST: {},
        SIDEBAR_TO_SPLIT,
        SPLIT_TO_SIDEBAR,
    };
});

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        VERIFY_ACCOUNT: {path: 'verify-account', entryScreens: []},
        CUSTOM_FLOW: {path: 'custom-flow', entryScreens: []},
    },
    HOME: 'home',
}));

describe('getMatchingFullScreenRoute - dynamic suffix', () => {
    const mockGetStateFromPath = getStateFromPath as jest.Mock;
    const mockFindFocusedRoute = findFocusedRoute as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return last route when path has dynamic suffix and base path state has full screen as last route', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/settings/wallet/verify-account',
        };
        const fullScreenRoute = {name: SCREENS.HOME};
        const basePathState = {
            routes: [{name: 'Settings'}, fullScreenRoute],
            index: 1,
        };

        mockGetStateFromPath.mockReturnValue(basePathState);

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/settings/wallet');
        expect(result).toEqual(fullScreenRoute);
    });

    it('should recursively find full screen route when base path has nested state with non-full-screen last route', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/workspace/123/custom-flow',
        };
        const nestedFocusedRoute = {name: SCREENS.HOME};
        const basePathState = {
            routes: [
                {
                    name: 'Workspace',
                    state: {
                        routes: [{name: 'SomeNestedScreen', path: '/workspace/123'}],
                        index: 0,
                    },
                },
            ],
            index: 0,
        };

        mockGetStateFromPath.mockReturnValue(basePathState);
        mockFindFocusedRoute.mockReturnValue(nestedFocusedRoute);

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/workspace/123');
        expect(mockFindFocusedRoute).toHaveBeenCalledWith(basePathState);
        expect(result).toBeDefined();
        expect(result?.name).toBe(SCREENS.HOME);
    });

    it('should return undefined when path has dynamic suffix but base path resolves to NOT_FOUND', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/invalid/base/verify-account',
        };
        const invalidRouteState = {
            routes: [{name: SCREENS.NOT_FOUND, path: '/invalid/base'}],
            index: 0,
        };

        mockGetStateFromPath.mockReturnValue(invalidRouteState);

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/invalid/base');
        expect(result).toBeUndefined();
    });

    it('should return undefined when path has non-dynamic suffix (suffix not in DYNAMIC_ROUTES)', () => {
        const route = {
            name: 'SomeScreen',
            path: '/settings/profile/random-suffix',
        };

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should return undefined when path has dynamic suffix but base path state is undefined', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/broken/path/verify-account',
        };

        mockGetStateFromPath.mockReturnValue(undefined);

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/broken/path');
        expect(result).toBeUndefined();
    });
});
