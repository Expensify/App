import {flushDeferredWrite} from '@libs/deferredLayoutWrite';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports -- Testing submitDismissStrategies which uses TransitionTracker directly
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {endSubmitFollowUpActionSpan, setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import {dismissOnly, dismissRHPToReport, dismissSuperWideRHP, dismissWideToNewSearchType, executeDismissModalStrategy} from '@pages/iou/request/step/confirmation/submitDismissStrategies';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

const mockGetIsNarrowLayout = jest.fn<boolean, []>();
const mockGetTopmostReportParams = jest.fn<{reportID: string} | undefined, [unknown]>();
const mockGetReportOrDraftReport = jest.fn();
const mockIsMoneyRequestReport = jest.fn<boolean, [unknown]>();

jest.mock('@libs/deferredLayoutWrite', () => ({
    flushDeferredWrite: jest.fn(),
}));
jest.mock('@libs/getIsNarrowLayout', () => () => mockGetIsNarrowLayout());
jest.mock('@libs/Navigation/helpers/getTopmostReportParams', () => (state: unknown) => mockGetTopmostReportParams(state));
jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
    navigate: jest.fn(),
    pop: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    navigationRef: {getRootState: jest.fn(() => ({routes: []}))},
}));
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(() => ({cancel: jest.fn()})),
}));
jest.mock('@libs/ReportUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getReportOrDraftReport: (id: string) => mockGetReportOrDraftReport(id),
    isMoneyRequestReport: (report: unknown) => mockIsMoneyRequestReport(report),
}));
jest.mock('@libs/SearchQueryUtils', () => ({
    buildCannedSearchQuery: jest.fn(() => 'type:expense'),
}));
jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    setPendingSubmitFollowUpAction: jest.fn(),
    endSubmitFollowUpActionSpan: jest.fn(),
}));

describe('submitDismissStrategies', () => {
    const runAfterDismiss = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockGetTopmostReportParams.mockReturnValue(undefined);
        mockGetReportOrDraftReport.mockReturnValue(undefined);
        mockIsMoneyRequestReport.mockReturnValue(false);
    });

    describe('dismissOnly', () => {
        it('sets pending action to DISMISS_MODAL_ONLY and calls dismissModal', () => {
            dismissOnly(runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect(Navigation.dismissModal).toHaveBeenCalledWith(expect.objectContaining({afterTransition: expect.any(Function)}));
        });

        it('ends span, flushes deferred write, and runs callback in afterTransition', () => {
            dismissOnly(runAfterDismiss);

            const opts = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0) as {afterTransition: () => void} | undefined;
            opts?.afterTransition();

            expect(endSubmitFollowUpActionSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
            expect(flushDeferredWrite).toHaveBeenCalledWith(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(runAfterDismiss).toHaveBeenCalled();
        });
    });

    describe('dismissSuperWideRHP', () => {
        it('sets pending action and calls dismissToPreviousRHP', () => {
            dismissSuperWideRHP('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, 'report-1');
            expect(Navigation.dismissToPreviousRHP).toHaveBeenCalledWith(expect.objectContaining({afterTransition: runAfterDismiss}));
        });

        it('handles undefined destinationReportID', () => {
            dismissSuperWideRHP(undefined, runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, undefined);
        });
    });

    describe('dismissRHPToReport', () => {
        it('pops RHP and runs callback after transitions when report has no existing transactions', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'report-1', transactionCount: 0});
            mockIsMoneyRequestReport.mockReturnValue(true);
            (navigationRef.getRootState as jest.Mock).mockReturnValue({
                routes: [{state: {key: 'rhp-key'}}],
            });

            dismissRHPToReport('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, 'report-1');
            expect(Navigation.pop).toHaveBeenCalledWith('rhp-key');
            expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({callback: runAfterDismiss, waitForUpcomingTransition: true}));
        });

        it('navigates to search money request report when report has existing transactions on narrow layout', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'report-1', transactionCount: 3});
            mockIsMoneyRequestReport.mockReturnValue(true);
            mockGetIsNarrowLayout.mockReturnValue(true);

            dismissRHPToReport('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, 'report-1');
            expect(Navigation.dismissModal).toHaveBeenCalled();
            expect(Navigation.navigate).toHaveBeenCalled();
        });

        it('navigates to search money request report when report has existing transactions on wide layout', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'report-1', transactionCount: 5});
            mockIsMoneyRequestReport.mockReturnValue(true);
            mockGetIsNarrowLayout.mockReturnValue(false);

            dismissRHPToReport('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, 'report-1');
            expect(Navigation.dismissToPreviousRHP).toHaveBeenCalled();
            expect(Navigation.navigate).toHaveBeenCalled();
        });

        it('pops RHP when report is not a money request report (no existing transactions)', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'report-1'});
            mockIsMoneyRequestReport.mockReturnValue(false);
            (navigationRef.getRootState as jest.Mock).mockReturnValue({
                routes: [{state: {key: 'rhp-key-2'}}],
            });

            dismissRHPToReport('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, 'report-1');
            expect(Navigation.pop).toHaveBeenCalledWith('rhp-key-2');
        });
    });

    describe('dismissWideToNewSearchType', () => {
        it('builds canned search query and reveals route before dismissing modal', () => {
            dismissWideToNewSearchType('expense' as SearchDataTypes, runAfterDismiss);

            expect(buildCannedSearchQuery).toHaveBeenCalledWith({type: 'expense'});
            expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({afterTransition: runAfterDismiss}));
        });
    });

    describe('executeDismissModalStrategy', () => {
        it('calls dismissOnly when destinationReportID is undefined', () => {
            executeDismissModalStrategy(undefined, runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
            expect(Navigation.dismissModal).toHaveBeenCalled();
        });

        it('calls dismissNarrowWithReport when on narrow layout', () => {
            mockGetIsNarrowLayout.mockReturnValue(true);

            executeDismissModalStrategy('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, 'report-1');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect(Navigation.dismissModalWithReport).toHaveBeenCalledWith({reportID: 'report-1'}, undefined, expect.objectContaining({onBeforeNavigate: expect.any(Function)}));
            expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({callback: runAfterDismiss, waitForUpcomingTransition: true}));
        });

        it('calls dismissWideToSameReport when current report matches destination on wide layout', () => {
            mockGetIsNarrowLayout.mockReturnValue(false);
            mockGetTopmostReportParams.mockReturnValue({reportID: 'report-1'});

            executeDismissModalStrategy('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, 'report-1');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect(Navigation.dismissModal).toHaveBeenCalledWith(expect.objectContaining({afterTransition: expect.any(Function)}));
        });

        it('flushes deferred write and runs callback for dismissWideToSameReport afterTransition', () => {
            mockGetIsNarrowLayout.mockReturnValue(false);
            mockGetTopmostReportParams.mockReturnValue({reportID: 'report-1'});

            executeDismissModalStrategy('report-1', runAfterDismiss);

            const opts = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0) as {afterTransition: () => void} | undefined;
            opts?.afterTransition();

            expect(endSubmitFollowUpActionSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, 'report-1');
            expect(flushDeferredWrite).toHaveBeenCalledWith(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(runAfterDismiss).toHaveBeenCalled();
        });

        it('calls dismissWideToNewReport when destination differs from current on wide layout', () => {
            mockGetIsNarrowLayout.mockReturnValue(false);
            mockGetTopmostReportParams.mockReturnValue({reportID: 'report-other'});

            executeDismissModalStrategy('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, 'report-1');
            expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalled();
        });

        it('calls dismissWideToNewReport when no current report on wide layout', () => {
            mockGetIsNarrowLayout.mockReturnValue(false);
            mockGetTopmostReportParams.mockReturnValue(undefined);

            executeDismissModalStrategy('report-1', runAfterDismiss);

            expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, 'report-1');
            expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalled();
        });

        it('flushes deferred write and runs callback for dismissWideToNewReport afterTransition', () => {
            mockGetIsNarrowLayout.mockReturnValue(false);
            mockGetTopmostReportParams.mockReturnValue(undefined);

            executeDismissModalStrategy('report-1', runAfterDismiss);

            const opts = jest.mocked(Navigation.revealRouteBeforeDismissingModal).mock.calls.at(0)?.at(1) as {afterTransition: () => void} | undefined;
            opts?.afterTransition();

            expect(flushDeferredWrite).toHaveBeenCalledWith(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            expect(runAfterDismiss).toHaveBeenCalled();
        });

        describe('dismissNarrowWithReport onBeforeNavigate callback', () => {
            it('refines to DISMISS_MODAL_AND_OPEN_REPORT when willOpenReport is true', () => {
                mockGetIsNarrowLayout.mockReturnValue(true);

                executeDismissModalStrategy('report-1', runAfterDismiss);

                const opts = jest.mocked(Navigation.dismissModalWithReport).mock.calls.at(0)?.at(2) as {onBeforeNavigate: (willOpenReport: boolean) => void} | undefined;
                jest.mocked(setPendingSubmitFollowUpAction).mockClear();
                opts?.onBeforeNavigate(true);

                expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, 'report-1');
            });

            it('stays DISMISS_MODAL_ONLY when willOpenReport is false', () => {
                mockGetIsNarrowLayout.mockReturnValue(true);

                executeDismissModalStrategy('report-1', runAfterDismiss);

                const opts = jest.mocked(Navigation.dismissModalWithReport).mock.calls.at(0)?.at(2) as {onBeforeNavigate: (willOpenReport: boolean) => void} | undefined;
                jest.mocked(setPendingSubmitFollowUpAction).mockClear();
                opts?.onBeforeNavigate(false);

                expect(setPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, 'report-1');
            });
        });
    });
});
