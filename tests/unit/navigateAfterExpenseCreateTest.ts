import type isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import type isReportOpenInSuperWideRHP from '@libs/Navigation/helpers/isReportOpenInSuperWideRHP';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';
import type {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

const mockIsReportTopmostSplitNavigator = jest.fn<boolean, []>();
const mockIsSearchTopmostFullScreenRoute = jest.fn<boolean, []>();
const mockIsReportOpenInRHP = jest.fn<ReturnType<typeof isReportOpenInRHP>, Parameters<typeof isReportOpenInRHP>>();
const mockIsReportOpenInSuperWideRHP = jest.fn<ReturnType<typeof isReportOpenInSuperWideRHP>, Parameters<typeof isReportOpenInSuperWideRHP>>().mockReturnValue(false);
const mockGetIsNarrowLayout = jest.fn<boolean, []>();
const mockGetTrackingState = jest.fn<boolean, []>();
const mockGetRootState = jest.fn<{routes: Array<{name: string}>}, []>(() => ({routes: []}));
// Declared but assigned after jest.mock hoisting - use require() to access the mock in tests
let mockSetPendingSubmitFollowUpAction: jest.MockedFunction<typeof setPendingSubmitFollowUpAction>;
const mockGetCurrentSearchQueryJSON = jest.fn<ReturnType<typeof getCurrentSearchQueryJSON>, Parameters<typeof getCurrentSearchQueryJSON>>();

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => () => mockIsReportTopmostSplitNavigator());
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute());
jest.mock('@libs/Navigation/helpers/isReportOpenInRHP', () => (state: Parameters<typeof isReportOpenInRHP>[0]) => mockIsReportOpenInRHP(state));
jest.mock('@libs/Navigation/helpers/isReportOpenInSuperWideRHP', () => (state: Parameters<typeof isReportOpenInSuperWideRHP>[0]) => mockIsReportOpenInSuperWideRHP(state));
jest.mock('@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue', () => (callback: () => void) => {
    callback();
});
jest.mock('@libs/getIsNarrowLayout', () => () => mockGetIsNarrowLayout());
jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    isTracking: () => mockGetTrackingState(),
    endSubmitFollowUpActionSpan: jest.fn(),
    setPendingSubmitFollowUpAction: jest.fn(),
}));
jest.mock('@libs/SearchQueryUtils', () => ({
    buildCannedSearchQuery: jest.fn(({type}: {type: string}) => `type:${type}`),
    getCurrentSearchQueryJSON: mockGetCurrentSearchQueryJSON,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissModalWithReport: jest.fn(),
    pop: jest.fn(),
    navigate: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
    clearFullscreenPreInsertedFlag: jest.fn(),
    navigationRef: {
        getRootState: () => mockGetRootState(),
        isReady: jest.fn(() => true),
    },
}));

jest.mock('@react-navigation/native');

describe('navigateAfterExpenseCreate', () => {
    beforeAll(() => {
        const followUpMock = jest.requireMock<{setPendingSubmitFollowUpAction: typeof setPendingSubmitFollowUpAction}>('@libs/telemetry/submitFollowUpAction');
        mockSetPendingSubmitFollowUpAction = jest.mocked(followUpMock.setPendingSubmitFollowUpAction);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockIsReportOpenInRHP.mockReturnValue(false);
        mockGetTrackingState.mockReturnValue(false);
        mockGetRootState.mockReturnValue({routes: []});
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

    it('should navigate to search for a LOOKING_AROUND user whose expense lands in their self-DM, even on the inbox tab', () => {
        // A "Looking around / Something else" user creating an expense from global create while on the Inbox that lands in
        // their self-DM should end up in Spend > Expenses, not that self-DM. The gate is scoped to isSelfDMDestination.
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(true);

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
            isLookingAroundUser: true,
            isSelfDMDestination: true,
        });

        // forceReplace is deliberately false here: it makes linkTo dispatch a REPLACE against TAB_NAVIGATOR, and because
        // SEARCH.ROOT is a tab root that REPLACE is a no-op, which left these users stuck on the tab they submitted from.
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense', searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}), {forceReplace: false});
        expect(Navigation.dismissModalWithReport).not.toHaveBeenCalled();
    });

    it('should keep forceReplace for a narrow Search navigation that is not the LOOKING_AROUND self-DM flow', () => {
        // The forceReplace opt-out is scoped to the flow this fix is about, so every other caller keeps its existing
        // browser-history behaviour even though they hit the same linkTo no-op today.
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(true);

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
            isLookingAroundUser: false,
            isSelfDMDestination: false,
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense', searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}), {forceReplace: true});
    });

    it('should NOT route a LOOKING_AROUND user to search when the destination is a real report (not the self-DM)', () => {
        // A LOOKING_AROUND user who later has a workspace and submits to a real report/friend from the Inbox must open that
        // report, not always be sent to Search. isSelfDMDestination is false, so they are treated as "on inbox".
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(true);

        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
            isLookingAroundUser: true,
            isSelfDMDestination: false,
        });

        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense', searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}), {forceReplace: true});
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
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense', searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}), {forceReplace: true});
    });

    it('should reveal route before dismissing modal on wide layout when from global create', () => {
        // Given a wide layout where the confirmation RHP is still open
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockGetRootState.mockReturnValue({routes: [{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]});

        // When the expense is created
        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
        });

        // Then Search is revealed under the RHP before dismissing it
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense', searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}));
    });

    it('should reveal route on wide layout when a modal other than the RHP is on top', () => {
        // Given a wide layout where another modal navigator sits on top, which REPLACE_FULLSCREEN_UNDER_RHP can reveal under too
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockGetRootState.mockReturnValue({routes: [{name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}]});

        // When the expense is created
        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
        });

        // Then Search is still revealed instead of being skipped
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense', searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}));
    });

    it('should not reveal again on wide layout when the pre-mount fast path already dismissed the RHP', () => {
        // Given a wide layout where the RHP was already dismissed over the pre-mounted Search
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockGetRootState.mockReturnValue({routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]});

        // When the deferred write finishes and runs the post-create navigation
        navigateAfterExpenseCreate({
            activeReportID: 'report-123',
            transactionID: 'txn-1',
            isFromGlobalCreate: true,
            hasMultipleTransactions: false,
        });

        // Then nothing is dispatched, a second REPLACE would have no modal to reveal under
        expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
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
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValueOnce(true);

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
