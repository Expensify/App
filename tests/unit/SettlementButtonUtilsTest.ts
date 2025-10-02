import Navigation from '@libs/Navigation/Navigation';
import handleUnvalidatedUserNavigation from '@libs/SettlementButtonUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation');

describe('SettlementButtonUtils', () => {
    const mockReportID = '123456789';
    const mockChatReportID = '987654321';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigate to ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_ROOT', () => {
        const mockActiveRoute = ROUTES.SEARCH_ROOT.getRoute({query: ''});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT);
    });

    it('navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_REPORT', () => {
        const mockActiveRoute = ROUTES.SEARCH_REPORT.getRoute({reportID: mockReportID});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
    });

    it('do not navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT when reportID is undefined', () => {
        const mockActiveRoute = ROUTES.SEARCH_REPORT.getRoute({reportID: mockReportID});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('navigate to ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_MONEY_REQUEST_REPORT', () => {
        const mockActiveRoute = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
    });

    it('do not navigate to ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT when reportID is undefined', () => {
        const mockActiveRoute = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('match ROUTES.SEARCH_MONEY_REQUEST_REPORT over ROUTES.REPORT_WITH_ID', () => {
        // Should match the first applicable route when multiple conditions could match
        const mockActiveRoute = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
    });

    it('navigate to ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(chatReportID) when active route is ROUTES.REPORT_WITH_ID.getRoute(chatReportID)', () => {
        const mockActiveRoute = ROUTES.REPORT_WITH_ID.getRoute(mockChatReportID);
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockChatReportID));
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
    });

    it('navigate to ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(reportID) when active route is ROUTES.REPORT_WITH_ID.getRoute(reportID)', () => {
        const mockActiveRoute = ROUTES.REPORT_WITH_ID.getRoute(mockReportID);
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockChatReportID));
    });

    it('do not navigate when active route is ROUTES.REPORT_WITH_ID.getRoute(reportID) and reportID is undefined', () => {
        const mockActiveRoute = ROUTES.REPORT_WITH_ID.getRoute(mockReportID);
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('navigate to ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT when active route is ROUTES.MONEY_REQUEST_STEP_CONFIRMATION', () => {
        const mockActiveRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID);
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID),
        );
    });

    it('navigate to ROUTES.MONEY_REQUEST_CREATE_VERIFY_ACCOUNT when active route is ROUTES.MONEY_REQUEST_CREATE', () => {
        const mockActiveRoute = ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID);
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.MONEY_REQUEST_CREATE_VERIFY_ACCOUNT.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID),
        );
    });

    it('when no route mapping matches, user should not be navigated', () => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue('/just/unmatched/route');
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
