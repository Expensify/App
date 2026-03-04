import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {DynamicRouteSuffix} from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRoute: jest.fn(),
}));

jest.mock('@libs/Log', () => ({
    warn: jest.fn(),
}));

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        VERIFY_ACCOUNT: {path: 'verify-account'},
        CUSTOM_FLOW: {path: 'custom-flow'},
        DETAILS: {path: 'details'},
        INVITE: {path: 'invite'},
        FILTERS: {path: 'filters'},
        ADDRESS_COUNTRY: {path: 'country', getRoute: (country: string) => `country?country=${country}`},
    },
}));

describe('createDynamicRoute', () => {
    const mockGetActiveRoute = Navigation.getActiveRoute as jest.Mock;
    const mockLogWarn = jest.spyOn(Log, 'warn');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should append suffix to a simple path', () => {
        const activeRoute = 'settings/profile';
        const suffix = 'verify-account';
        const expectedPath = 'settings/profile/verify-account';

        mockGetActiveRoute.mockReturnValue(activeRoute);

        const result = createDynamicRoute(suffix);

        expect(result).toBe(expectedPath);
        expect(mockGetActiveRoute).toHaveBeenCalled();
    });

    it('should append suffix and preserve query parameters at the end', () => {
        const activeRoute = 'report/123?sortBy=date';
        const suffix = 'details';
        const expectedPath = 'report/123/details?sortBy=date';

        mockGetActiveRoute.mockReturnValue(activeRoute);

        const result = createDynamicRoute(suffix as unknown as DynamicRouteSuffix);

        expect(result).toBe(expectedPath);
    });

    it('should throw an error if the suffix is invalid', () => {
        const suffix = 'invalid-suffix';

        expect(() => createDynamicRoute(suffix as unknown as DynamicRouteSuffix)).toThrow(`The route name ${suffix} is not supported in createDynamicRoute`);
        expect(mockGetActiveRoute).not.toHaveBeenCalled();
    });

    it('should handle paths with trailing slashes if splitPathAndQuery normalizes them', () => {
        const activeRoute = 'workspace/100/';
        const suffix = 'invite';
        const expectedPath = 'workspace/100/invite';

        mockGetActiveRoute.mockReturnValue(activeRoute);

        const result = createDynamicRoute(suffix as unknown as DynamicRouteSuffix);

        expect(result).toBe(expectedPath);
    });

    it('should correctly construct path when multiple query parameters exist', () => {
        const activeRoute = 'search?q=test&type=expense';
        const suffix = 'filters';
        const expectedPath = 'search/filters?q=test&type=expense';

        mockGetActiveRoute.mockReturnValue(activeRoute);

        const result = createDynamicRoute(suffix as unknown as DynamicRouteSuffix);

        expect(result).toBe(expectedPath);
    });

    it('should append suffix with its own query params to a simple path', () => {
        const activeRoute = 'settings/profile/address';
        const suffixWithQuery = 'country?country=US';
        const expectedPath = 'settings/profile/address/country?country=US';

        mockGetActiveRoute.mockReturnValue(activeRoute);

        const result = createDynamicRoute(suffixWithQuery);

        expect(result).toBe(expectedPath);
    });

    it('should merge suffix query params with base path query params', () => {
        const activeRoute = 'settings/profile/address?existingParam=1';
        const suffixWithQuery = 'country?country=US';
        const expectedPath = 'settings/profile/address/country?existingParam=1&country=US';

        mockGetActiveRoute.mockReturnValue(activeRoute);

        const result = createDynamicRoute(suffixWithQuery);

        expect(result).toBe(expectedPath);
    });

    it('should log warning when suffix query param collides with base path query param', () => {
        const activeRoute = 'settings/profile/address?country=GB';
        const suffixWithQuery = 'country?country=US';

        mockGetActiveRoute.mockReturnValue(activeRoute);

        const result = createDynamicRoute(suffixWithQuery);

        expect(result).toBe('settings/profile/address/country?country=US');
        expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('Query param "country" exists in both base path and dynamic suffix'));
    });
});
