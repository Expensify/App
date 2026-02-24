import getStateForDynamicRoute from '@libs/Navigation/helpers/getStateForDynamicRoute';
import type {DYNAMIC_ROUTES} from '@src/ROUTES';

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    normalizedConfigs: {
        TestNavigator: {
            path: 'test-path',
            routeNames: ['Wrapper', 'TargetScreen'],
        },
        SingleNavigator: {
            path: 'single-path',
            routeNames: ['Root'],
        },
    },
}));

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        TEST_ROUTE: {
            path: 'test-path',
        },
        SINGLE_ROUTE: {
            path: 'single-path',
        },
        UNKNOWN_ROUTE: {
            path: 'unknown-path',
        },
    },
}));

type LeafRoute = {
    name: string;
    path: string;
};

type NestedRoute = {
    name: string;
    state: {
        routes: [RouteNode];
        index: 0;
    };
};

type RouteNode = LeafRoute | NestedRoute;

const KEY_TEST = 'TEST_ROUTE';
const KEY_SINGLE = 'SINGLE_ROUTE';
const KEY_UNKNOWN = 'UNKNOWN_ROUTE';

describe('getStateForDynamicRoute', () => {
    it('should build correctly nested state for multi-level route', () => {
        const path = '/some/path/test-path';

        const result = getStateForDynamicRoute(path, KEY_TEST as unknown as keyof typeof DYNAMIC_ROUTES);

        expect(result).toEqual({
            routes: [
                {
                    name: 'Wrapper',
                    state: {
                        index: 0,
                        routes: [
                            {
                                name: 'TargetScreen',
                                path,
                            },
                        ],
                    },
                },
            ],
        });
    });

    it('should build flat state for single-level route', () => {
        const path = '/some/path/single-path';
        const result = getStateForDynamicRoute(path, KEY_SINGLE as unknown as keyof typeof DYNAMIC_ROUTES);

        expect(result).toEqual({
            routes: [
                {
                    name: 'Root',
                    path,
                },
            ],
        });
    });

    it('should throw error when route configuration is not found', () => {
        const path = '/some/path/unknown';

        expect(() => getStateForDynamicRoute(path, KEY_UNKNOWN as unknown as keyof typeof DYNAMIC_ROUTES)).toThrow("No route configuration found for dynamic route 'UNKNOWN_ROUTE'");
    });

    it('should handle different path format but same structure', () => {
        const path = '/another/different/path/test-path';
        const result = getStateForDynamicRoute(path, KEY_TEST as unknown as keyof typeof DYNAMIC_ROUTES);

        const rootRoute = result.routes.at(0) as NestedRoute | undefined;
        const leafRoute = rootRoute?.state.routes.at(0) as LeafRoute | undefined;
        expect(leafRoute?.path).toBe(path);
    });

    it('should correctly structure state property in parent nodes', () => {
        const path = '/test-path';
        const result = getStateForDynamicRoute(path, KEY_TEST as unknown as keyof typeof DYNAMIC_ROUTES);

        const parentNode = result.routes.at(0);
        expect(parentNode).toHaveProperty('state');

        const state = (parentNode as NestedRoute).state;
        expect(state?.index).toBe(0);
        expect(Array.isArray(state?.routes)).toBe(true);
    });
});
