import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRoute: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

describe('getReportRouteForCurrentContext', () => {
    const mockGetActiveRoute = Navigation.getActiveRoute as jest.MockedFunction<typeof Navigation.getActiveRoute>;
    const mockIsSearchTopmostFullScreenRoute = isSearchTopmostFullScreenRoute as jest.MockedFunction<typeof isSearchTopmostFullScreenRoute>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRoute.mockReturnValue('search?q=type:chat');
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
    });

    it('returns the default report route when Search is not the topmost fullscreen route', () => {
        expect(getReportRouteForCurrentContext({reportID: '42'})).toBe(ROUTES.REPORT_WITH_ID.getRoute('42', undefined, undefined, 'search?q=type:chat'));
    });

    it('returns the search report route when Search is the topmost fullscreen route', () => {
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

        expect(getReportRouteForCurrentContext({reportID: '42'})).toBe(
            ROUTES.SEARCH_REPORT.getRoute({
                reportID: '42',
                backTo: 'search?q=type:chat',
            }),
        );
    });
});
