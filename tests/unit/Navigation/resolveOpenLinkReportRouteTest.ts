import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import resolveOpenLinkReportRoute from '@libs/Navigation/helpers/resolveOpenLinkReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getReportIDFromLink, isMoneyRequestReport} from '@libs/ReportUtils';

import ROUTES from '@src/ROUTES';

jest.mock('@libs/getIsNarrowLayout', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
}));
jest.mock('@libs/ReportUtils', () => {
    const actual = jest.requireActual<typeof import('@libs/ReportUtils')>('@libs/ReportUtils');
    return {
        ...actual,
        getReportIDFromLink: jest.fn(),
        isMoneyRequestReport: jest.fn(),
    };
});

describe('resolveOpenLinkReportRoute', () => {
    const mockGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
    const mockIsReportTopmostSplitNavigator = isReportTopmostSplitNavigator as jest.MockedFunction<typeof isReportTopmostSplitNavigator>;
    const mockIsSearchTopmostFullScreenRoute = isSearchTopmostFullScreenRoute as jest.MockedFunction<typeof isSearchTopmostFullScreenRoute>;
    const mockGetActiveRoute = Navigation.getActiveRoute as jest.MockedFunction<typeof Navigation.getActiveRoute>;
    const mockGetTopmostReportId = Navigation.getTopmostReportId as jest.MockedFunction<typeof Navigation.getTopmostReportId>;
    const mockGetReportIDFromLink = getReportIDFromLink as jest.MockedFunction<typeof getReportIDFromLink>;
    const mockIsMoneyRequestReport = isMoneyRequestReport as jest.MockedFunction<typeof isMoneyRequestReport>;

    const activeChatRoute = 'r/999';
    const reportID = '12345';

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRoute.mockReturnValue(activeChatRoute);
        mockGetTopmostReportId.mockReturnValue('999');
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetReportIDFromLink.mockReturnValue(reportID);
        mockIsMoneyRequestReport.mockReturnValue(false);
    });

    it('returns EXPENSE_REPORT_RHP for wide inbox expense report links', () => {
        mockIsMoneyRequestReport.mockReturnValue(true);

        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/r/${reportID}`, `r/${reportID}`)).toBe(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: activeChatRoute}));
    });

    it('returns SEARCH_REPORT for wide inbox non-expense report links', () => {
        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/r/${reportID}`, `r/${reportID}`)).toBe(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: activeChatRoute}));
    });

    it('returns SEARCH_MONEY_REQUEST_REPORT for wide search expense report links', () => {
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsMoneyRequestReport.mockReturnValue(true);

        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/r/${reportID}`, `r/${reportID}`)).toBe(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: activeChatRoute}));
    });

    it('returns SEARCH_REPORT for wide search non-expense report links', () => {
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);

        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/r/${reportID}`, `r/${reportID}`)).toBe(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: activeChatRoute}));
    });

    it('returns REPORT_WITH_ID with backTo for narrow inbox report links', () => {
        mockGetIsNarrowLayout.mockReturnValue(true);

        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/r/${reportID}`, `r/${reportID}`)).toBe(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, activeChatRoute));
    });

    it('returns null when not in inbox or search chat context', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);

        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/r/${reportID}`, `r/${reportID}`)).toBeNull();
    });

    it('resolves legacy newdotreport Concierge links in inbox chat context', () => {
        mockGetReportIDFromLink.mockReturnValue('');
        mockIsMoneyRequestReport.mockReturnValue(true);

        expect(resolveOpenLinkReportRoute(`https://www.expensify.com/newdotreport?reportID=${reportID}`, '')).toBe(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: activeChatRoute}));
    });

    it('returns null for sub-report deep links', () => {
        mockGetReportIDFromLink.mockReturnValue('');

        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/r/${reportID}/details`, `r/${reportID}/details`)).toBeNull();
    });

    it('returns null for paths that are already RHP routes', () => {
        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/e/${reportID}`, `e/${reportID}`)).toBeNull();
        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/search/r/${reportID}`, `search/r/${reportID}`)).toBeNull();
        expect(resolveOpenLinkReportRoute(`https://new.expensify.com/search/view/${reportID}`, `search/view/${reportID}`)).toBeNull();
    });

    it('returns null when the linked report is already open in the inbox central pane', () => {
        mockGetTopmostReportId.mockReturnValue(reportID);
        const reportActionID = '67890';
        const href = `https://new.expensify.com/r/${reportID}/${reportActionID}`;

        expect(resolveOpenLinkReportRoute(href, `r/${reportID}/${reportActionID}`)).toBeNull();
    });

    it('includes reportActionID when rewriting top-level report action links to a different report', () => {
        const reportActionID = '67890';
        const href = `https://new.expensify.com/r/${reportID}/${reportActionID}`;

        expect(resolveOpenLinkReportRoute(href, `r/${reportID}/${reportActionID}`)).toBe(ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo: activeChatRoute}));
    });
});
