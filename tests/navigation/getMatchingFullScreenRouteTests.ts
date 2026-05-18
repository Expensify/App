import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import {getMatchingFullScreenRoute} from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    normalizedConfigs: {
        DynamicScreen: {path: 'suffix-a'},
    },
    screensWithOnyxTabNavigator: new Set(),
}));

jest.mock('@libs/ReportUtils', () => ({
    getReportOrDraftReport: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/getStateFromPath', () => jest.fn());
jest.mock('@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard', () => jest.fn());

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
        SUFFIX_A: {path: 'suffix-a', entryScreens: []},
        SUFFIX_B: {path: 'suffix-b', entryScreens: []},
        MULTI_SEG: {path: 'deep/suffix-a', entryScreens: []},
    },
    HOME: 'home',
}));

describe('getMatchingFullScreenRoute - dynamic suffix', () => {
    const mockGetStateFromPath = getStateFromPath as jest.Mock;
    const mockFindFocusedRouteWithOnyxTabGuard = findFocusedRouteWithOnyxTabGuard as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return last route when path has a single dynamic suffix and base path state has full screen as last route', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/base/suffix-a',
        };
        const fullScreenRoute = {name: SCREENS.HOME};
        const basePathState = {
            routes: [{name: 'BaseScreen'}, fullScreenRoute],
            index: 1,
        };

        mockGetStateFromPath.mockImplementation((path: string) => (path === '/base' ? basePathState : undefined));

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/base');
        expect(result).toEqual(fullScreenRoute);
    });

    it('should strip the outermost suffix from a layered path before resolving the matching full screen route', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/base/suffix-a/suffix-b',
        };
        const fullScreenRoute = {name: SCREENS.HOME};
        const basePathState = {
            routes: [{name: 'BaseScreen'}, fullScreenRoute],
            index: 1,
        };

        mockGetStateFromPath.mockImplementation((path: string) => (path === '/base/suffix-a' ? basePathState : undefined));

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledTimes(1);
        expect(mockGetStateFromPath).toHaveBeenCalledWith('/base/suffix-a');
        expect(result).toEqual(fullScreenRoute);
    });

    it('should strip the outermost suffix when the inner suffix is multi-segment', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/base/deep/suffix-a/suffix-b',
        };
        const fullScreenRoute = {name: SCREENS.HOME};
        const basePathState = {
            routes: [{name: 'BaseScreen'}, fullScreenRoute],
            index: 1,
        };

        mockGetStateFromPath.mockImplementation((path: string) => (path === '/base/deep/suffix-a' ? basePathState : undefined));

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledTimes(1);
        expect(mockGetStateFromPath).toHaveBeenCalledWith('/base/deep/suffix-a');
        expect(result).toEqual(fullScreenRoute);
    });

    it('should recursively find full screen route when the stripped base path has nested state with non-full-screen last route', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/base/suffix-a',
        };
        const nestedFocusedRoute = {name: SCREENS.HOME};
        const basePathState = {
            routes: [
                {
                    name: 'BaseNavigator',
                    state: {
                        routes: [{name: 'SomeNestedScreen', path: '/base'}],
                        index: 0,
                    },
                },
            ],
            index: 0,
        };

        mockGetStateFromPath.mockImplementation((path: string) => (path === '/base' ? basePathState : undefined));
        mockFindFocusedRouteWithOnyxTabGuard.mockReturnValue(nestedFocusedRoute);

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/base');
        expect(mockFindFocusedRouteWithOnyxTabGuard).toHaveBeenCalledWith(basePathState);
        expect(result).toBeDefined();
        expect(result?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
    });

    it('should return undefined when path has dynamic suffix but base path resolves to NOT_FOUND', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/invalid/base/suffix-a/suffix-b',
        };
        const invalidRouteState = {
            routes: [{name: SCREENS.NOT_FOUND, path: '/invalid/base/suffix-a'}],
            index: 0,
        };

        mockGetStateFromPath.mockImplementation((path: string) => (path === '/invalid/base/suffix-a' ? invalidRouteState : undefined));

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/invalid/base/suffix-a');
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
            path: '/broken/path/suffix-a/suffix-b',
        };

        mockGetStateFromPath.mockReturnValue(undefined);

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/broken/path/suffix-a');
        expect(result).toBeUndefined();
    });

    it('should ignore backTo for a dynamic screen and resolve full screen route via dynamic suffix instead', () => {
        const route = {
            name: 'DynamicScreen',
            path: '/base/suffix-a',
            params: {backTo: '/some/other/path'},
        };
        const fullScreenRoute = {name: SCREENS.HOME};
        const basePathState = {
            routes: [{name: 'BaseScreen'}, fullScreenRoute],
            index: 1,
        };

        mockGetStateFromPath.mockImplementation((path: string) => {
            if (path === '/base') {
                return basePathState;
            }
            return {routes: [{name: 'WrongScreen'}], index: 0};
        });

        const result = getMatchingFullScreenRoute(route);

        expect(mockGetStateFromPath).toHaveBeenCalledWith('/base');
        expect(mockGetStateFromPath).not.toHaveBeenCalledWith('/some/other/path');
        expect(result).toEqual(fullScreenRoute);
    });
});
