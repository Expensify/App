import type {NavigationState, PartialState} from '@react-navigation/native';
import getDynamicRouteAdaptedState from '@libs/Navigation/helpers/dynamicRoutesUtils/getDynamicRouteAdaptedState';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

jest.mock('@react-navigation/native', () => ({
    getStateFromPath: jest.fn(),
}));

jest.mock('@libs/Navigation/linkingConfig', () => ({
    linkingConfig: {
        config: {},
    },
}));

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    normalizedConfigs: {
        DynScreenA: {path: 'suffix-a'},
        DynScreenB: {path: 'suffix-b'},
        DynScreenC: {path: 'suffix-c'},
        DynMultiSeg: {path: 'deep/suffix-a'},
        DynCrossStack: {path: 'suffix-cross'},
    },
    screensWithOnyxTabNavigator: new Set(),
}));

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        SUFFIX_A: {path: 'suffix-a', entryScreens: ['StaticScreen']},
        SUFFIX_B: {path: 'suffix-b', entryScreens: ['DynScreenA']},
        SUFFIX_C: {path: 'suffix-c', entryScreens: ['DynScreenB']},
        MULTI_SEG: {path: 'deep/suffix-a', entryScreens: ['StaticScreen']},
        SUFFIX_CROSS: {path: 'suffix-cross', entryScreens: ['DynScreenA']},
    },
}));

jest.mock('@libs/Log', () => ({
    warn: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/getMatchingNewRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/getStateForDynamicRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getStateFromPath', () => jest.fn());

describe('getDynamicRouteAdaptedState', () => {
    const mockGetStateFromPath = getStateFromPath as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function makeRhpState(modalStackName: string, screenName: string, path?: string): PartialState<NavigationState> {
        return {
            routes: [
                {
                    name: 'RightModalNavigator',
                    state: {
                        routes: [
                            {
                                name: modalStackName,
                                state: {
                                    routes: [{name: screenName, path}],
                                    index: 0,
                                },
                            },
                        ],
                        index: 0,
                    },
                },
            ],
            index: 0,
        };
    }

    it('should add one screen behind for a single dynamic suffix', () => {
        const initialState = makeRhpState('ModalStack', 'DynScreenA', '/base/suffix-a');
        const staticState = makeRhpState('ModalStack', 'StaticScreen', '/base');

        mockGetStateFromPath.mockReturnValue(staticState);

        const result = getDynamicRouteAdaptedState(initialState, '/base/suffix-a');

        const innerRoutes = result.routes.at(0)?.state?.routes.at(0)?.state?.routes ?? [];
        expect(innerRoutes).toHaveLength(2);
        expect(innerRoutes.at(0)?.name).toBe('StaticScreen');
        expect(innerRoutes.at(1)?.name).toBe('DynScreenA');
    });

    it('should build full chain for 3 dynamic suffixes', () => {
        const initialState = makeRhpState('ModalStack', 'DynScreenC', '/base/suffix-a/suffix-b/suffix-c');

        mockGetStateFromPath.mockImplementation((path: string) => {
            if (path === '/base/suffix-a/suffix-b') {
                return makeRhpState('ModalStack', 'DynScreenB', '/base/suffix-a/suffix-b');
            }
            if (path === '/base/suffix-a') {
                return makeRhpState('ModalStack', 'DynScreenA', '/base/suffix-a');
            }
            if (path === '/base') {
                return makeRhpState('ModalStack', 'StaticScreen', '/base');
            }
            return {routes: [{name: 'NotFound'}], index: 0};
        });

        const result = getDynamicRouteAdaptedState(initialState, '/base/suffix-a/suffix-b/suffix-c');

        const innerRoutes = result.routes.at(0)?.state?.routes.at(0)?.state?.routes ?? [];
        expect(innerRoutes).toHaveLength(4);
        expect(innerRoutes.map((r) => r.name)).toEqual(['StaticScreen', 'DynScreenA', 'DynScreenB', 'DynScreenC']);
    });

    it('should handle single dynamic suffix above a non-RHP base', () => {
        const initialState = makeRhpState('ModalStack', 'DynScreenA', '/base/suffix-a');

        const nonRhpState: PartialState<NavigationState> = {
            routes: [{name: 'FullscreenHome', path: '/base'}],
            index: 0,
        };
        mockGetStateFromPath.mockReturnValue(nonRhpState);

        const result = getDynamicRouteAdaptedState(initialState, '/base/suffix-a');

        const rootRoutes = result.routes;
        expect(rootRoutes).toHaveLength(2);
        expect(rootRoutes.at(0)?.name).toBe('FullscreenHome');
        expect(rootRoutes.at(1)?.name).toBe('RightModalNavigator');
    });

    it('should handle cross-modal-stack chain correctly', () => {
        const initialState = makeRhpState('ModalStackB', 'DynCrossStack', '/base/suffix-a/suffix-cross');

        mockGetStateFromPath.mockImplementation((path: string) => {
            if (path === '/base/suffix-a') {
                return makeRhpState('ModalStackA', 'DynScreenA', '/base/suffix-a');
            }
            if (path === '/base') {
                return makeRhpState('ModalStackA', 'StaticScreen', '/base');
            }
            return {routes: [{name: 'NotFound'}], index: 0};
        });

        const result = getDynamicRouteAdaptedState(initialState, '/base/suffix-a/suffix-cross');

        const rhp = result.routes.at(0);
        const modalStacks = rhp?.state?.routes ?? [];

        expect(modalStacks).toHaveLength(2);
        expect(modalStacks.at(0)?.name).toBe('ModalStackA');
        expect(modalStacks.at(1)?.name).toBe('ModalStackB');

        const stackARoutes = modalStacks.at(0)?.state?.routes ?? [];
        expect(stackARoutes.map((r) => r.name)).toEqual(['StaticScreen', 'DynScreenA']);

        const stackBRoutes = modalStacks.at(1)?.state?.routes ?? [];
        expect(stackBRoutes.map((r) => r.name)).toEqual(['DynCrossStack']);
    });

    it('should handle multi-segment dynamic suffix', () => {
        const initialState = makeRhpState('ModalStack', 'DynMultiSeg', '/base/deep/suffix-a');
        const staticState = makeRhpState('ModalStack', 'StaticScreen', '/base');

        mockGetStateFromPath.mockReturnValue(staticState);

        const result = getDynamicRouteAdaptedState(initialState, '/base/deep/suffix-a');

        const innerRoutes = result.routes.at(0)?.state?.routes.at(0)?.state?.routes ?? [];
        expect(innerRoutes).toHaveLength(2);
        expect(innerRoutes.at(0)?.name).toBe('StaticScreen');
        expect(innerRoutes.at(1)?.name).toBe('DynMultiSeg');
    });

    it('should return state unchanged when suffix match fails', () => {
        const initialState = makeRhpState('ModalStack', 'DynScreenA', '/no-match-path');

        const result = getDynamicRouteAdaptedState(initialState, '/no-match-path');

        expect(result).toBe(initialState);
        expect(mockGetStateFromPath).not.toHaveBeenCalled();
    });

    it('should return state unchanged when getStateFromPath returns undefined for base path', () => {
        const initialState = makeRhpState('ModalStack', 'DynScreenA', '/base/suffix-a');

        mockGetStateFromPath.mockReturnValue(undefined);

        const result = getDynamicRouteAdaptedState(initialState, '/base/suffix-a');

        expect(result).toBe(initialState);
    });
});
