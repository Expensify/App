import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type * as SearchQueryUtils from '@libs/SearchQueryUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';

import getSubmitExpensePreMountDestinationRoute from '@pages/iou/request/step/confirmation/getSubmitExpensePreMountDestinationRoute';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/getIsNarrowLayout');
jest.mock('@libs/Navigation/helpers/isReportOpenInRHP');
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator');
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute');
jest.mock('@libs/Navigation/Navigation', () => ({
    getTopmostReportId: jest.fn(),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(),
    navigationRef: {getRootState: jest.fn()},
}));
jest.mock('@libs/SearchQueryUtils', () => ({
    buildCannedSearchQuery: jest.fn(({type}: {type: string}) => `type:${type}`),
    getCurrentSearchQueryJSON: jest.fn(() => undefined),
}));

const mockGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockIsReportOpenInRHP = jest.mocked(isReportOpenInRHP);
const mockIsReportTopmostSplitNavigator = jest.mocked(isReportTopmostSplitNavigator);
const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);

describe('getSubmitExpensePreMountDestinationRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(false);
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(false);
    });

    it('returns undefined on wide layout', () => {
        // Given a wide layout where the RHP does not cover fullscreen content
        mockGetIsNarrowLayout.mockReturnValue(false);

        // When submission evaluates speculative navigation
        // Then no route is returned because wide layouts do not need pre-mounting
        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: true,
                canPreInsertSearch: true,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isOptimisticNewChatDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('returns undefined when the transaction is not ready', () => {
        // Given a transaction that is not ready to submit
        // When submission evaluates its speculative destination
        // Then no route is returned because navigation must wait for stable transaction data
        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: false,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: true,
                canPreInsertSearch: true,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isOptimisticNewChatDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('returns Search route for global create expense flows', () => {
        // Given a global create flow that will finish in expense Search
        // When submission selects a destination to pre-mount
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: undefined,
            destinationReport: undefined,
            isFromGlobalCreate: true,
            canPreInsertSearch: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then expense Search is prepared so the post-submit transition is immediate
        expect(route).toEqual(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}));
    });

    it('returns report route when the destination is not the report the user is looking at', () => {
        // Given submission targets a loaded report different from the visible report
        // When submission selects a destination to pre-mount
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: false,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then the destination report is prepared because navigation must move there
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns undefined when relocating a tracked expense over a different visible report', () => {
        // Given relocation would replace another report in the same tab
        // The single-workspace "Submit to my employer" shape: the user is reading their self-DM while the expense is
        // bound to the workspace chat. Both are reports, so there is no tab to switch to and the pre-insert would
        // replace the report on screen - leaving the cancel path to rebuild it from a snapshot (#97437).
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('456');

        // When submission evaluates whether to pre-mount the workspace destination
        // Then it declines because cancellation could not safely restore the visible report
        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: false,
                canPreInsertSearch: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isOptimisticNewChatDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: true,
            }),
        ).toBeUndefined();
    });

    it('keeps the pre-insert for an in-place expense whose destination is a different visible report', () => {
        // Given an in-place expense targets another report without relocating existing data
        // Same navigation topology as the case above, but the expense is created in place rather than relocated (e.g. the
        // per-diem chat-report destination), so it keeps the pre-mount instead of being caught by the track-expense guard.
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('456');

        // When submission evaluates whether to pre-mount the destination
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: false,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then pre-mounting remains safe because cancellation does not need a report snapshot
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('stays eligible once it has pre-inserted, so the hook does not tear down its own insert', () => {
        // Given a relocation destination that has already been pre-inserted
        // After the pre-insert the visible report *is* the destination, so the same-tab check reads as safe on its own.
        // Assert it through the explicit pre-inserted flag too, since that is what keeps the result stable.
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('456');
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);

        // When eligibility is recomputed against the updated navigation state
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: false,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: true,
        });

        // Then the route stays stable so the hook does not undo its own transition
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns the report route for a global-create track expense (self-DM target)', () => {
        // Given global track expense creation will finish in its self-DM report
        // When submission selects a destination to pre-mount
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.TRACK,
            isCreatingTrackExpense: true,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then the self-DM is prepared because tracked expenses are report-bound
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns the report route when the sole recipient is the self-DM (CREATE routed through track)', () => {
        // Given a create flow that becomes tracking because the user is the sole recipient
        // When submission selects a destination to pre-mount
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.CREATE,
            isCreatingTrackExpense: false,
            isSelfDMDestination: true,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then the self-DM report is prepared because it owns the tracked expense
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('does NOT pre-insert the self-DM report for a LOOKING_AROUND user (they are routed to Search after submit)', () => {
        // Given a restricted user whose self-DM submission will finish in Search
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        // When submission evaluates the self-DM as a speculative destination
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.CREATE,
            isCreatingTrackExpense: false,
            isSelfDMDestination: true,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: true,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then it skips the report because pre-mounting would conflict with final navigation
        expect(route).toBeUndefined();
    });

    it('returns the report route for a report-bound global create (PAY)', () => {
        // Given a global pay flow bound to a concrete destination report
        // When submission selects a destination to pre-mount
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.PAY,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then the report is prepared because the payment will land there
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('still pre-inserts the report for a LOOKING_AROUND user when the destination is a real report, not the self-DM (PAY)', () => {
        // Given a restricted user paying into a real report rather than the self-DM
        // A LOOKING_AROUND user who later has a workspace and submits to a real report/friend must keep the report
        // pre-insert - the LOOKING_AROUND gate is scoped to isSelfDMDestination, so it does not fire here.
        // When submission evaluates the destination for speculative navigation
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.PAY,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: true,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then the report remains eligible because only self-DM routing is restricted
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns undefined when the destination report is not loaded in Onyx', () => {
        // Given a destination ID without a local report or optimistic-chat guarantee
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        // When submission evaluates whether the report can be pre-mounted
        // Then it declines because fetching an unknown report could latch a not-found state
        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: undefined,
                isFromGlobalCreate: false,
                canPreInsertSearch: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isOptimisticNewChatDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('returns a pending-creation route for an unloaded optimistic chat destination', () => {
        // Given a new optimistic chat whose report row does not exist locally yet
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        // When submission chooses a route to pre-mount before chat creation completes
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: undefined,
            isFromGlobalCreate: false,
            canPreInsertSearch: false,
            iouType: CONST.IOU.TYPE.CREATE,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: true,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then the route carries a creation guard so fetching waits for the local report
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123', undefined, undefined, undefined, undefined, true));
    });

    it('returns undefined when report is already topmost', () => {
        // Given the final destination report is already visible
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('123');

        // When submission evaluates speculative navigation
        // Then no route is returned because navigation is already at the destination
        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: false,
                canPreInsertSearch: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isOptimisticNewChatDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('keeps returning the report route once it has been pre-inserted, even though it is now the topmost report', () => {
        // Given a destination report made topmost by the current pre-insert transaction
        // After this route is pre-inserted under the RHP, getTopmostReportId() reports the pre-inserted
        // destination. Without the pre-insert guard this flips hasValidDestination to false and the route
        // recomputes to undefined, tearing down the just-inserted route. The result must stay stable instead.
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('123');
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);

        // When eligibility is recomputed after navigation state changes
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: '123',
            destinationReport: {reportID: '123'},
            isFromGlobalCreate: true,
            canPreInsertSearch: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then the route remains stable so the active pre-insert is not torn down
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns undefined when report is open in RHP', () => {
        // Given the destination report is already open inside the RHP
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);

        // When submission evaluates speculative fullscreen navigation
        // Then no route is returned because duplicating the open report would be redundant
        expect(
            getSubmitExpensePreMountDestinationRoute({
                isTransactionReady: true,
                destinationReportID: '123',
                destinationReport: {reportID: '123'},
                isFromGlobalCreate: false,
                canPreInsertSearch: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                isCreatingTrackExpense: false,
                isSelfDMDestination: false,
                isOptimisticNewChatDestination: false,
                isLookingAroundUser: false,
                isMovingTransactionFromTrackExpense: false,
            }),
        ).toBeUndefined();
    });

    it('returns Search route when Search is topmost with a different query type', () => {
        // Given Search is visible but does not show the expense query needed after submission
        const {buildSearchQueryJSON} = jest.requireActual<typeof SearchQueryUtils>('@libs/SearchQueryUtils');

        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        jest.mocked(getCurrentSearchQueryJSON).mockReturnValue(buildSearchQueryJSON('type:invoice'));

        // When submission selects the Search destination to pre-mount
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: undefined,
            destinationReport: undefined,
            isFromGlobalCreate: true,
            canPreInsertSearch: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then expense Search is prepared because the current query cannot show the result
        expect(route).toEqual(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}));
    });

    it('keeps returning the Search route once it has been pre-inserted, even though Search is now topmost with the same query type', () => {
        // Given expense Search is topmost only because the current transaction pre-inserted it
        // After the Search route is pre-inserted under the RHP, isSearchTopmostFullScreenRoute() reports the pre-inserted Search
        // as topmost with a matching query type. Without the `|| hasPreInsertedFullscreen` guard, shouldPreInsertSearch flips to
        // false and the route recomputes to undefined, tearing down the just-inserted route. The result must stay stable instead.
        const {buildSearchQueryJSON} = jest.requireActual<typeof SearchQueryUtils>('@libs/SearchQueryUtils');

        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        jest.mocked(getCurrentSearchQueryJSON).mockReturnValue(buildSearchQueryJSON('type:expense'));
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);

        // When eligibility is recomputed against the updated Search state
        const route = getSubmitExpensePreMountDestinationRoute({
            isTransactionReady: true,
            destinationReportID: undefined,
            destinationReport: undefined,
            isFromGlobalCreate: true,
            canPreInsertSearch: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
            isCreatingTrackExpense: false,
            isSelfDMDestination: false,
            isOptimisticNewChatDestination: false,
            isLookingAroundUser: false,
            isMovingTransactionFromTrackExpense: false,
        });

        // Then the route remains stable so the active pre-insert is not torn down
        expect(route).toEqual(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}));
    });
});
