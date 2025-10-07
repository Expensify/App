import Navigation from '@libs/Navigation/Navigation';
import {handleUnvalidatedUserNavigation} from '@libs/SettlementButtonUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation');

describe('SettlementButtonUtils', () => {
    const mockReportID = '123456789';
    const mockChatReportID = '987654321';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // handleUnvalidatedUserNavigation navigates to the correct route
    it.each([
        {
            description: 'navigate to ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_ROOT',
            mockActiveRoute: ROUTES.SEARCH_ROOT.getRoute({query: ''}),
            expectedRouteToNavigate: ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT,
        },
        {
            description: 'navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_REPORT',
            mockActiveRoute: ROUTES.SEARCH_REPORT.getRoute({reportID: mockReportID}),
            expectedRouteToNavigate: ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_MONEY_REQUEST_REPORT',
            mockActiveRoute: ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID}),
            expectedRouteToNavigate: ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(chatReportID) when active route is ROUTES.REPORT_WITH_ID.getRoute(chatReportID)',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockChatReportID),
            expectedRouteToNavigate: ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockChatReportID),
        },
        {
            description: 'navigate to ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(reportID) when active route is ROUTES.REPORT_WITH_ID.getRoute(reportID)',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockReportID),
            expectedRouteToNavigate: ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT when active route is ROUTES.MONEY_REQUEST_STEP_CONFIRMATION',
            mockActiveRoute: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID),
            expectedRouteToNavigate: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT.getRoute(
                CONST.IOU.ACTION.CREATE,
                CONST.IOU.TYPE.PAY,
                CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                mockChatReportID,
            ),
        },
        {
            description: 'navigate to ROUTES.MONEY_REQUEST_CREATE_VERIFY_ACCOUNT when active route is ROUTES.MONEY_REQUEST_CREATE',
            mockActiveRoute: ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID),
            expectedRouteToNavigate: ROUTES.MONEY_REQUEST_CREATE_VERIFY_ACCOUNT.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID),
        },
    ])('$description', ({mockActiveRoute, expectedRouteToNavigate}) => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(expectedRouteToNavigate);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    // handleUnvalidatedUserNavigation does not navigate to the route that require reportID, when reportID is undefined
    it.each([
        {
            description: 'do not navigate to ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT when reportID is undefined',
            mockActiveRoute: ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID}),
        },
        {
            description: 'do not navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT when reportID is undefined',
            mockActiveRoute: ROUTES.SEARCH_REPORT.getRoute({reportID: mockReportID}),
        },
        {
            description: 'do not navigate when active route is ROUTES.REPORT_WITH_ID.getRoute(reportID) and reportID is undefined',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockReportID),
        },
    ])('$description', ({mockActiveRoute}) => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    // handleUnvalidatedUserNavigation matches the first applicable route when multiple conditions could match
    it('match ROUTES.SEARCH_MONEY_REQUEST_REPORT over ROUTES.REPORT_WITH_ID', () => {
        const mockActiveRoute = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
    });

    // handleUnvalidatedUserNavigation does not navigate when no route mapping matches
    it('when no route mapping matches, user should not be navigated', () => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue('/just/unmatched/route');
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
