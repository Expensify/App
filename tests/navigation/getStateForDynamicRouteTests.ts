import getStateForDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/getStateForDynamicRoute';

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
        VERIFY_ACCOUNT: {
            path: 'test-path',
        },
        TWO_FACTOR_AUTH_ROOT: {
            path: 'single-path',
        },
        TWO_FACTOR_AUTH_VERIFY: {
            path: 'unknown-path',
        },
    },
}));

const KEY_TEST = 'VERIFY_ACCOUNT';
const KEY_SINGLE = 'TWO_FACTOR_AUTH_ROOT';
const KEY_UNKNOWN = 'TWO_FACTOR_AUTH_VERIFY';

describe('getStateForDynamicRoute', () => {
    it('should build correctly nested state for multi-level route', () => {
        const path = '/some/path/test-path';

        const result = getStateForDynamicRoute(path, KEY_TEST);

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
        const result = getStateForDynamicRoute(path, KEY_SINGLE);

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

        expect(() => getStateForDynamicRoute(path, KEY_UNKNOWN)).toThrow("No route configuration found for dynamic route 'TWO_FACTOR_AUTH_VERIFY'");
    });

    it('should handle different path format but same structure', () => {
        const path = '/another/different/path/test-path';
        const result = getStateForDynamicRoute(path, KEY_TEST);

        const rootRoute = result.routes.at(0);
        const leafRoute = rootRoute && 'state' in rootRoute && rootRoute.state ? rootRoute.state.routes.at(0) : undefined;
        expect(leafRoute && 'path' in leafRoute ? leafRoute.path : undefined).toBe(path);
    });

    it('should correctly structure state property in parent nodes', () => {
        const path = '/test-path';
        const result = getStateForDynamicRoute(path, KEY_TEST);

        const parentNode = result.routes.at(0);
        expect(parentNode).toHaveProperty('state');

        const state = parentNode && 'state' in parentNode ? parentNode.state : undefined;
        expect(state?.index).toBe(0);
        expect(Array.isArray(state?.routes)).toBe(true);
    });

    it('should inherit parent route params on the leaf node', () => {
        const path = '/r/12345/settings/test-path';
        const parentParams = {reportID: '12345'};
        const result = getStateForDynamicRoute(path, KEY_TEST, parentParams);

        const rootRoute = result.routes.at(0);
        const leafRoute = rootRoute && 'state' in rootRoute && rootRoute.state ? rootRoute.state.routes.at(0) : undefined;
        expect(leafRoute && 'params' in leafRoute ? leafRoute.params : undefined).toEqual(parentParams);
    });

    it('should not include params on the leaf node when neither parentRouteParams nor query params are provided', () => {
        const path = '/some/path/test-path';
        const result = getStateForDynamicRoute(path, KEY_TEST);

        const rootRoute = result.routes.at(0);
        const leafRoute = rootRoute && 'state' in rootRoute && rootRoute.state ? rootRoute.state.routes.at(0) : undefined;
        expect(leafRoute && 'params' in leafRoute ? leafRoute.params : undefined).toBeUndefined();
    });

    it('should merge parent route params with query params', () => {
        const path = '/r/12345/settings/test-path?country=US';
        const parentParams = {reportID: '12345'};
        const result = getStateForDynamicRoute(path, KEY_TEST, parentParams);

        const rootRoute = result.routes.at(0);
        const leafRoute = rootRoute && 'state' in rootRoute && rootRoute.state ? rootRoute.state.routes.at(0) : undefined;
        expect(leafRoute && 'params' in leafRoute ? leafRoute.params : undefined).toEqual({reportID: '12345', country: 'US'});
    });

    describe('undefined params are filtered out (optional path params absent)', () => {
        it('does not include the key when an optional path param is undefined', () => {
            const path = '/r/12345/test-path';
            const parentParams = {reportID: '12345', accountID: undefined};
            const result = getStateForDynamicRoute(path, KEY_TEST, parentParams);

            const rootRoute = result.routes.at(0);
            const leafRoute = rootRoute && 'state' in rootRoute && rootRoute.state ? rootRoute.state.routes.at(0) : undefined;
            const leafParams = leafRoute && 'params' in leafRoute ? leafRoute.params : undefined;
            expect(leafParams).toEqual({reportID: '12345'});
            expect(leafParams).not.toHaveProperty('accountID');
        });

        it('returns no params when all parent params are undefined and there are no query params', () => {
            const path = '/r/12345/test-path';
            const parentParams = {accountID: undefined};
            const result = getStateForDynamicRoute(path, KEY_TEST, parentParams);

            const rootRoute = result.routes.at(0);
            const leafRoute = rootRoute && 'state' in rootRoute && rootRoute.state ? rootRoute.state.routes.at(0) : undefined;
            expect(leafRoute && 'params' in leafRoute ? leafRoute.params : undefined).toBeUndefined();
        });

        it('keeps defined params and drops undefined ones in mixed scenario', () => {
            const path = '/r/12345/test-path?country=US';
            const parentParams = {reportID: '12345', extraneous: undefined};
            const result = getStateForDynamicRoute(path, KEY_TEST, parentParams);

            const rootRoute = result.routes.at(0);
            const leafRoute = rootRoute && 'state' in rootRoute && rootRoute.state ? rootRoute.state.routes.at(0) : undefined;
            expect(leafRoute && 'params' in leafRoute ? leafRoute.params : undefined).toEqual({reportID: '12345', country: 'US'});
        });
    });
});
