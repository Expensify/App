import type {submitWithDismissFirst as SubmitWithDismissFirstFn} from '@libs/Navigation/helpers/submitWithDismissFirst';
import type Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

type DismissModal = typeof Navigation.dismissModal;
type RevealRouteBeforeDismissingModal = typeof Navigation.revealRouteBeforeDismissingModal;

const mockIsSearchTopmostFullScreenRoute = jest.fn<boolean, []>();
const mockGetReportOrDraftReport = jest.fn();
const mockDismissModal = jest.fn<ReturnType<DismissModal>, Parameters<DismissModal>>();
const mockRevealRouteBeforeDismissingModal = jest.fn<ReturnType<RevealRouteBeforeDismissingModal>, Parameters<RevealRouteBeforeDismissingModal>>();
const mockGetIsFullscreenPreInsertedUnderRHP = jest.fn<boolean, []>();
const mockGetIsNarrowLayout = jest.fn<boolean, []>();
const mockReserveDeferredWriteChannel = jest.fn();
const mockStartTracking = jest.fn();
const mockSetFastPath = jest.fn();
const mockSetPendingSubmitFollowUpAction = jest.fn();

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute());
jest.mock('@libs/getIsNarrowLayout', () => () => mockGetIsNarrowLayout());
jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: mockDismissModal,
    revealRouteBeforeDismissingModal: mockRevealRouteBeforeDismissingModal,
    getIsFullscreenPreInsertedUnderRHP: () => mockGetIsFullscreenPreInsertedUnderRHP() as unknown,
    clearFullscreenPreInsertedFlag: jest.fn(),
}));
jest.mock('@libs/ReportUtils', () => ({
    getReportOrDraftReport: (id: string) => mockGetReportOrDraftReport(id) as unknown,
}));
jest.mock('@libs/deferredLayoutWrite', () => ({
    reserveDeferredWriteChannel: (...args: unknown[]) => mockReserveDeferredWriteChannel(...args) as unknown,
}));
jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    startTracking: (...args: unknown[]) => mockStartTracking(...args) as unknown,
    setFastPath: (...args: unknown[]) => mockSetFastPath(...args) as unknown,
    setPendingSubmitFollowUpAction: (...args: unknown[]) => mockSetPendingSubmitFollowUpAction(...args) as unknown,
}));

const submitModule = jest.requireActual<{submitWithDismissFirst: typeof SubmitWithDismissFirstFn}>('@libs/Navigation/helpers/submitWithDismissFirst');
const {submitWithDismissFirst} = submitModule;

const TELEMETRY_CONTEXT = {
    scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.REQUEST_MONEY_MANUAL,
    iouType: CONST.IOU.TYPE.SUBMIT,
    requestType: CONST.IOU.REQUEST_TYPE.MANUAL,
    isFromGlobalCreate: true,
    hasReceipt: false,
};

describe('submitWithDismissFirst', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetReportOrDraftReport.mockReturnValue(undefined);
        mockGetIsFullscreenPreInsertedUnderRHP.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(false);
    });

    describe('Search-topmost branch', () => {
        it('reserves deferred write channel and dismisses modal when Search is topmost', () => {
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'report123',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(mockReserveDeferredWriteChannel).toHaveBeenCalledWith(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            expect(mockDismissModal).toHaveBeenCalledTimes(1);
            expect(executeWrite).not.toHaveBeenCalled();
        });

        it('starts tracking with DISMISS_MODAL_ONLY follow-up action', () => {
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: undefined,
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(mockStartTracking).toHaveBeenCalledWith(TELEMETRY_CONTEXT, {skipSubmitExpenseSpan: true});
            expect(mockSetPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, undefined);
        });

        it('calls executeWrite with shouldHandleNavigation=false in afterTransition (Search deferral rides the reserved channel)', () => {
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'report123',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            const [dismissOptions] = mockDismissModal.mock.calls.at(0) ?? [];
            if (!dismissOptions?.afterTransition) {
                throw new Error('Expected dismissModal afterTransition callback');
            }
            dismissOptions.afterTransition();

            expect(executeWrite).toHaveBeenCalledWith({shouldHandleNavigation: false});
        });
    });

    describe('Destination-report branch', () => {
        it('reveals the report route when destination is loaded', () => {
            const executeWrite = jest.fn();
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'report123'});

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'report123',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(mockRevealRouteBeforeDismissingModal).toHaveBeenCalledTimes(1);
            expect(executeWrite).not.toHaveBeenCalled();
        });

        it('calls executeWrite in afterTransition when destination is loaded', () => {
            const executeWrite = jest.fn();
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'report123'});

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'report123',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            const [, revealOptions] = mockRevealRouteBeforeDismissingModal.mock.calls.at(0) ?? [];
            if (!revealOptions?.afterTransition) {
                throw new Error('Expected revealRouteBeforeDismissingModal afterTransition callback');
            }
            revealOptions.afterTransition();

            expect(executeWrite).toHaveBeenCalledWith({shouldHandleNavigation: false});
        });

        it('calls executeWrite immediately when destination is NOT loaded', () => {
            const executeWrite = jest.fn();
            mockGetReportOrDraftReport.mockReturnValue(undefined);

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'report123',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(executeWrite).toHaveBeenCalledWith({shouldHandleNavigation: false});
            expect(mockRevealRouteBeforeDismissingModal).toHaveBeenCalledTimes(1);
        });

        it('starts tracking with DISMISS_MODAL_AND_OPEN_REPORT and passes reportID', () => {
            const executeWrite = jest.fn();
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'report123'});

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'report123',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(mockStartTracking).toHaveBeenCalledWith(TELEMETRY_CONTEXT, {skipSubmitExpenseSpan: true});
            expect(mockSetPendingSubmitFollowUpAction).toHaveBeenCalledWith(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, 'report123');
        });
    });

    describe('Fallback branch', () => {
        it('calls executeWrite with defaults when no fast path applies', () => {
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: undefined,
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(executeWrite).toHaveBeenCalledTimes(1);
            expect(executeWrite).toHaveBeenCalledWith({shouldHandleNavigation: true});
        });

        it('starts tracking even in the fallback path', () => {
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: undefined,
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(mockStartTracking).toHaveBeenCalledWith(TELEMETRY_CONTEXT, {skipSubmitExpenseSpan: true});
        });
    });

    describe('Looking-Around self-DM branch', () => {
        const LOOKING_AROUND_SELF_DM = {
            isFromGlobalCreate: true,
            isLookingAroundUser: true,
            isSelfDMDestination: true,
        };

        it('on wide layout hands navigation to the write instead of revealing the self-DM report', () => {
            // Without this branch the destination-report fast path reveals the self-DM and calls executeWrite with
            // shouldHandleNavigation: false, which makes cleanupAfterSkipConfirmSubmit drop the routing flags before
            // navigateAfterExpenseCreate can route these users to Spend > Expenses. On wide layout navigateAfterExpenseCreate
            // reveals Search (which dismisses the modal itself), so no explicit dismiss happens here.
            mockGetIsNarrowLayout.mockReturnValue(false);
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'selfDM1'});
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'selfDM1',
                telemetryContext: TELEMETRY_CONTEXT,
                ...LOOKING_AROUND_SELF_DM,
            });

            expect(executeWrite).toHaveBeenCalledWith({shouldHandleNavigation: true});
            expect(mockRevealRouteBeforeDismissingModal).not.toHaveBeenCalled();
            expect(mockDismissModal).not.toHaveBeenCalled();
        });

        it('on narrow layout dismisses the modal first, then hands navigation to the write in afterTransition', () => {
            // Regression guard for https://github.com/Expensify/App/pull/97883: on narrow layout navigateAfterExpenseCreate
            // only switches the tab beneath the RHP, so the Create Expense modal must be dismissed here or the user is
            // stranded on an empty "Create Expense" page after a skip-confirmation (e.g. QAB scan) submit.
            mockGetIsNarrowLayout.mockReturnValue(true);
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'selfDM1'});
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'selfDM1',
                telemetryContext: TELEMETRY_CONTEXT,
                ...LOOKING_AROUND_SELF_DM,
            });

            expect(mockDismissModal).toHaveBeenCalledTimes(1);
            expect(mockRevealRouteBeforeDismissingModal).not.toHaveBeenCalled();
            // The write is deferred until the modal transition completes.
            expect(executeWrite).not.toHaveBeenCalled();

            const [dismissOptions] = mockDismissModal.mock.calls.at(0) ?? [];
            if (!dismissOptions?.afterTransition) {
                throw new Error('Expected dismissModal afterTransition callback');
            }
            dismissOptions.afterTransition();
            expect(executeWrite).toHaveBeenCalledWith({shouldHandleNavigation: true});
        });

        it('still starts tracking so telemetry is not skipped', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'selfDM1'});

            submitWithDismissFirst({
                executeWrite: jest.fn(),
                destinationReportID: 'selfDM1',
                telemetryContext: TELEMETRY_CONTEXT,
                ...LOOKING_AROUND_SELF_DM,
            });

            expect(mockStartTracking).toHaveBeenCalledWith(TELEMETRY_CONTEXT, {skipSubmitExpenseSpan: true});
            expect(mockSetFastPath).toHaveBeenCalledWith(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
        });

        it('does not divert when the destination is not the self-DM', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'r1'});
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'r1',
                telemetryContext: TELEMETRY_CONTEXT,
                ...LOOKING_AROUND_SELF_DM,
                isSelfDMDestination: false,
            });

            expect(mockRevealRouteBeforeDismissingModal).toHaveBeenCalled();
            expect(executeWrite).not.toHaveBeenCalledWith({shouldHandleNavigation: true});
        });

        it('does not divert when the expense is not from global create', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'selfDM1'});

            submitWithDismissFirst({
                executeWrite: jest.fn(),
                destinationReportID: 'selfDM1',
                telemetryContext: TELEMETRY_CONTEXT,
                ...LOOKING_AROUND_SELF_DM,
                isFromGlobalCreate: false,
            });

            expect(mockRevealRouteBeforeDismissingModal).toHaveBeenCalled();
        });

        it('does not divert for a non-Looking-Around user', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'selfDM1'});

            submitWithDismissFirst({
                executeWrite: jest.fn(),
                destinationReportID: 'selfDM1',
                telemetryContext: TELEMETRY_CONTEXT,
                ...LOOKING_AROUND_SELF_DM,
                isLookingAroundUser: false,
            });

            expect(mockRevealRouteBeforeDismissingModal).toHaveBeenCalled();
        });

        it('yields to the Search-topmost branch, which already leaves the user on Search', () => {
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'selfDM1',
                telemetryContext: TELEMETRY_CONTEXT,
                ...LOOKING_AROUND_SELF_DM,
            });

            expect(mockDismissModal).toHaveBeenCalledTimes(1);
            expect(executeWrite).not.toHaveBeenCalled();
        });
    });

    describe('Priority', () => {
        it('Search-topmost takes priority over destination report', () => {
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'report123'});
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'report123',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(mockDismissModal).toHaveBeenCalledTimes(1);
            expect(mockRevealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('treats empty-string destinationReportID as falsy (falls through to fallback)', () => {
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: '',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(executeWrite).toHaveBeenCalledWith({shouldHandleNavigation: true});
            expect(mockRevealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        });

        it('does not swallow errors thrown by executeWrite in the fallback path', () => {
            const executeWrite = jest.fn(() => {
                throw new Error('write failed');
            });

            expect(() =>
                submitWithDismissFirst({
                    executeWrite,
                    destinationReportID: undefined,
                    telemetryContext: TELEMETRY_CONTEXT,
                }),
            ).toThrow('write failed');
        });

        it('calls afterTransition when destination is loaded', () => {
            mockGetReportOrDraftReport.mockReturnValue({reportID: '999'});
            const executeWrite = jest.fn();

            submitWithDismissFirst({
                executeWrite,
                destinationReportID: '999',
                telemetryContext: TELEMETRY_CONTEXT,
            });

            expect(mockRevealRouteBeforeDismissingModal).toHaveBeenCalledTimes(1);
            expect(executeWrite).not.toHaveBeenCalled();

            const [, revealOptions] = mockRevealRouteBeforeDismissingModal.mock.calls.at(0) ?? [];
            if (!revealOptions?.afterTransition) {
                throw new Error('Expected revealRouteBeforeDismissingModal afterTransition callback');
            }
            revealOptions.afterTransition();
            expect(executeWrite).toHaveBeenCalledWith({shouldHandleNavigation: false});
        });

        it('all branches start telemetry tracking', () => {
            const executeWrite = jest.fn();

            // Fallback branch
            submitWithDismissFirst({
                executeWrite,
                destinationReportID: undefined,
                telemetryContext: TELEMETRY_CONTEXT,
            });
            expect(mockStartTracking).toHaveBeenCalledTimes(1);

            jest.clearAllMocks();

            // Search branch
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            submitWithDismissFirst({
                executeWrite,
                destinationReportID: undefined,
                telemetryContext: TELEMETRY_CONTEXT,
            });
            expect(mockStartTracking).toHaveBeenCalledTimes(1);

            jest.clearAllMocks();
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);

            // Destination-report branch
            mockGetReportOrDraftReport.mockReturnValue({reportID: 'r1'});
            submitWithDismissFirst({
                executeWrite,
                destinationReportID: 'r1',
                telemetryContext: TELEMETRY_CONTEXT,
            });
            expect(mockStartTracking).toHaveBeenCalledTimes(1);
        });
    });
});
