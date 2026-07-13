import Growl from '@libs/Growl';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const mockIsReportTopmostSplitNavigator = jest.fn();
const mockIsSearchTopmostFullScreenRoute = jest.fn();
const mockIsReportOpenInRHP = jest.fn();
const mockGetIsNarrowLayout = jest.fn();
const mockGetTrackingState = jest.fn();
// Declared but assigned after jest.mock hoisting - use require() to access the mock in tests
let mockSetPendingSubmitFollowUpAction: jest.Mock;
const mockGetCurrentSearchQueryJSON = jest.fn();

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => () => mockIsReportTopmostSplitNavigator() as boolean);
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute() as boolean);
jest.mock('@libs/Navigation/helpers/isReportOpenInRHP', () => () => mockIsReportOpenInRHP() as boolean);
jest.mock('@libs/Navigation/helpers/isReportOpenInSuperWideRHP', () => () => false as boolean);
jest.mock('@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue', () => (callback: () => void) => {
    callback();
});
jest.mock('@libs/getIsNarrowLayout', () => () => mockGetIsNarrowLayout() as boolean);
jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    isTracking: (...args: unknown[]) => mockGetTrackingState(...args) as boolean,
    endSubmitFollowUpActionSpan: jest.fn(),
    setPendingSubmitFollowUpAction: jest.fn(),
}));
jest.mock('@libs/SearchQueryUtils', () => ({
    buildCannedSearchQuery: jest.fn(({type}: {type: string}) => `type:${type}`),
    getCurrentSearchQueryJSON: () => mockGetCurrentSearchQueryJSON() as undefined,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissModalWithReport: jest.fn(),
    pop: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    revealRouteBeforeDismissingModal: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
    clearFullscreenPreInsertedFlag: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(() => ({
            routes: [],
        })),
        isReady: jest.fn(() => true),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@libs/Growl', () => ({
    __esModule: true,
    default: {success: jest.fn()},
}));

jest.mock('@libs/actions/Report', () => ({
    createTransactionThreadReport: jest.fn(),
    setOptimisticTransactionThread: jest.fn(),
}));

jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: jest.fn(() => Promise.resolve()),
}));

describe('navigateAfterExpenseCreate', () => {
    beforeAll(() => {
        const followUpMock = require('@libs/telemetry/submitFollowUpAction') as {setPendingSubmitFollowUpAction: jest.Mock};
        mockSetPendingSubmitFollowUpAction = followUpMock.setPendingSubmitFollowUpAction;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockIsReportOpenInRHP.mockReturnValue(false);
        mockGetTrackingState.mockReturnValue(null);
        mockGetCurrentSearchQueryJSON.mockReturnValue(undefined);
    });

    it('should dismiss to report when not from global create', () => {
        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
        });

        expect(Navigation.dismissModalWithReport).toHaveBeenCalledWith({reportID: 'report-123'});
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Growl.success).not.toHaveBeenCalled();
    });

    it('should show the expense added growl on the non-global path when shouldAlwaysShowFeedback is set', () => {
        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            transactionThreadReportID: 'thread-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
            shouldAlwaysShowFeedback: true,
        });

        expect(Navigation.dismissModalWithReport).toHaveBeenCalledWith({reportID: 'report-123'});
        expect(Growl.success).toHaveBeenCalledWith(expect.any(String), expect.any(Number), expect.objectContaining({label: expect.any(String), onPress: expect.any(Function)}));
    });

    it('should defer thread materialization to View press instead of growl-show time', () => {
        const {setOptimisticTransactionThread} = require('@libs/actions/Report') as {setOptimisticTransactionThread: jest.Mock};

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            transactionThreadReportID: 'thread-1',
            isFromGlobalCreate: false,
            hasMultipleTransactions: false,
            shouldAlwaysShowFeedback: true,
        });

        // Showing the growl must not touch the thread report.
        expect(setOptimisticTransactionThread).not.toHaveBeenCalled();

        const growlAction = (Growl.success as jest.Mock).mock.calls.at(0)?.at(2) as {onPress: () => void};
        growlAction.onPress();

        expect(setOptimisticTransactionThread).toHaveBeenCalledWith('thread-1', undefined, undefined, undefined);
    });

    it('should dismiss to report when user is on inbox tab', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
        });

        expect(Navigation.dismissModalWithReport).toHaveBeenCalledWith({reportID: 'report-123'});
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should dismiss to report when transactionID is missing', () => {
        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
        });

        expect(Navigation.dismissModalWithReport).toHaveBeenCalledWith({reportID: 'report-123'});
    });

    it('should navigate to search on narrow layout when from global create and not on inbox', () => {
        mockGetIsNarrowLayout.mockReturnValue(true);

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
        });

        expect(mockSetPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}), {forceReplace: true});
    });

    it('should reveal route before dismissing modal on wide layout when from global create', () => {
        mockGetIsNarrowLayout.mockReturnValue(false);

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
        });

        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}));
    });

    it('should use invoice data type when isInvoice is true', () => {
        mockGetIsNarrowLayout.mockReturnValue(true);

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            isInvoice: true,
            hasMultipleTransactions: false,
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:invoice'}), {forceReplace: true});
    });

    it('should use pre-insert fast path on narrow layout when fullscreen is pre-inserted', () => {
        mockGetIsNarrowLayout.mockReturnValue(true);
        (Navigation.getIsFullscreenPreInsertedUnderRHP as jest.Mock).mockReturnValueOnce(true);

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
        });

        expect(Navigation.clearFullscreenPreInsertedFlag).toHaveBeenCalled();
        expect(Navigation.dismissModal).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
