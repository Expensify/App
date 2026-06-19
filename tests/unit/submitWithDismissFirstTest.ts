import type {submitWithDismissFirst as SubmitWithDismissFirstFn} from '@libs/Navigation/helpers/submitWithDismissFirst';
import CONST from '@src/CONST';

const mockIsSearchTopmostFullScreenRoute = jest.fn<boolean, []>();
const mockGetReportOrDraftReport = jest.fn();
const mockDismissModal = jest.fn();
const mockRevealRouteBeforeDismissingModal = jest.fn();
const mockReserveDeferredWriteChannel = jest.fn();
const mockStartTracking = jest.fn();
const mockSetFastPath = jest.fn();
const mockSetPendingSubmitFollowUpAction = jest.fn();

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute());
jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: (...args: unknown[]) => mockDismissModal(...args) as unknown,
    revealRouteBeforeDismissingModal: (...args: unknown[]) => mockRevealRouteBeforeDismissingModal(...args) as unknown,
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

            const dismissCalls = mockDismissModal.mock.calls as Array<Array<{afterTransition: () => void}>>;
            dismissCalls.at(0)?.at(0)?.afterTransition();

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

            const [, revealOptions] = (mockRevealRouteBeforeDismissingModal.mock.calls as Array<[string, {afterTransition: () => void}]>).at(0) ?? [];
            revealOptions?.afterTransition();

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

            const [, revealOptions] = (mockRevealRouteBeforeDismissingModal.mock.calls as Array<[string, {afterTransition: () => void}]>).at(0) ?? [];
            revealOptions?.afterTransition();
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
