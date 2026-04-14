import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import getCreateReportRoute, {getReportsRootRoute, navigateToCreateReportWorkspaceSelection, navigateToReportsRoot} from '@src/libs/Navigation/helpers/getCreateReportRoute';
import isSearchTopmostFullScreenRoute from '@src/libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
}));

jest.mock('@src/libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

describe('getCreateReportRoute', () => {
    const mockNavigate = Navigation.navigate as jest.MockedFunction<typeof Navigation.navigate>;
    const mockGetActiveRoute = Navigation.getActiveRoute as jest.MockedFunction<typeof Navigation.getActiveRoute>;
    const mockSetNavigationActionToMicrotaskQueue = Navigation.setNavigationActionToMicrotaskQueue as jest.MockedFunction<typeof Navigation.setNavigationActionToMicrotaskQueue>;
    const mockIsSearchTopmostFullScreenRoute = isSearchTopmostFullScreenRoute as jest.MockedFunction<typeof isSearchTopmostFullScreenRoute>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRoute.mockReturnValue('workspace/123');
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
    });

    it('returns the Reports search root route', () => {
        expect(getReportsRootRoute()).toBe(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}),
            }),
        );
    });

    it('returns the search money request report route when Search is the topmost fullscreen route', () => {
        mockGetActiveRoute.mockReturnValue('search?q=type:expense');
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

        expect(getCreateReportRoute({reportID: '42'})).toBe(
            ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({
                reportID: '42',
                backTo: 'search?q=type:expense',
            }),
        );
    });

    it('returns the default report route when Search is not the topmost fullscreen route', () => {
        expect(getCreateReportRoute({reportID: '42'})).toBe(ROUTES.REPORT_WITH_ID.getRoute('42', undefined, undefined, 'workspace/123'));
    });

    it('navigates to the Reports search root', () => {
        navigateToReportsRoot({forceReplace: true});

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(getReportsRootRoute(), {forceReplace: true});
    });

    it('navigates to the Reports search root and then opens workspace selection in the microtask queue', () => {
        navigateToCreateReportWorkspaceSelection({forceReplace: true});

        expect(mockNavigate).toHaveBeenCalledTimes(2);
        expect(mockNavigate).toHaveBeenNthCalledWith(1, getReportsRootRoute(), {forceReplace: true});
        expect(mockSetNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenNthCalledWith(2, ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
    });
});
