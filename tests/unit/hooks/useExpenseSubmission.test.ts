/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, renderHook} from '@testing-library/react-native';

import Log from '@libs/Log';

import useExpenseSubmission from '@pages/iou/request/step/confirmation/useExpenseSubmission';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report, ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type * as Split from '../../../src/libs/actions/IOU/Split';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockRequestMoneyAction = jest.fn();
const mockTrackExpenseAction = jest.fn();
const mockSubmitPerDiemExpenseAction = jest.fn();
const mockSubmitPerDiemExpenseForSelfDMAction = jest.fn();
const mockHasCompletePerDiemCustomUnit = jest.fn();
type CreateDistanceRequest = typeof Split.createDistanceRequest;
const mockCreateDistanceRequestAction = jest.fn<ReturnType<CreateDistanceRequest>, Parameters<CreateDistanceRequest>>();
const mockCleanupAfterExpenseCreate = jest.fn();
const mockCleanupAndNavigateAfterExpenseCreate = jest.fn();
const mockResolveChatTargetForSubmitCleanup = jest.fn();
const mockSendInvoiceAction = jest.fn();
const mockSplitBillAction = jest.fn();
const mockSplitBillAndOpenReportAction = jest.fn();
const mockResolveOptimisticSplitChatReportID = jest.fn();
const mockDismissModalAndOpenReportInInboxTab = jest.fn();
const mockReserveDeferredWriteChannel = jest.fn();
const mockIsSearchTopmostFullScreenRoute = jest.fn();

jest.mock('@userActions/IOU/TrackExpense', () => ({
    requestMoney: (...args: unknown[]) => mockRequestMoneyAction(...args),
    trackExpense: (...args: unknown[]) => mockTrackExpenseAction(...args),
}));

jest.mock('@userActions/IOU/PerDiem', () => ({
    submitPerDiemExpense: (...args: unknown[]) => mockSubmitPerDiemExpenseAction(...args),
    submitPerDiemExpenseForSelfDM: (...args: unknown[]) => mockSubmitPerDiemExpenseForSelfDMAction(...args),
    hasCompletePerDiemCustomUnit: (...args: unknown[]) => mockHasCompletePerDiemCustomUnit(...args),
    getPerDiemExpensePolicyID: jest.fn(),
}));

jest.mock('@userActions/IOU/Split', () => ({
    createDistanceRequest: (...args: Parameters<CreateDistanceRequest>) => mockCreateDistanceRequestAction(...args),
    splitBill: (...args: unknown[]) => mockSplitBillAction(...args),
    splitBillAndOpenReport: (...args: unknown[]) => mockSplitBillAndOpenReportAction(...args),
    resolveOptimisticSplitChatReportID: (...args: unknown[]) => mockResolveOptimisticSplitChatReportID(...args),
    startSplitBill: jest.fn(),
}));

jest.mock('@userActions/IOU/SendInvoice', () => ({
    sendInvoice: (...args: unknown[]) => mockSendInvoiceAction(...args),
    getReceiverType: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockDismissModalAndOpenReportInInboxTab(...args),
}));

jest.mock('@libs/deferredLayoutWrite', () => ({
    ...jest.requireActual('@libs/deferredLayoutWrite'),
    reserveDeferredWriteChannel: (...args: unknown[]) => mockReserveDeferredWriteChannel(...args),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockIsSearchTopmostFullScreenRoute(...args),
}));

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockCleanupAfterExpenseCreate(...args),
}));

jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockCleanupAndNavigateAfterExpenseCreate(...args),
}));

jest.mock('@pages/iou/request/step/resolveChatTarget', () => ({
    resolveChatTargetForSubmitCleanup: (...args: unknown[]) => mockResolveChatTargetForSubmitCleanup(...args),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: jest.fn((key: string) => key), toLocaleDigit: jest.fn((digit: string) => digit)}),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false}),
}));

jest.mock('@hooks/useLastWorkspaceNumber', () => ({
    __esModule: true,
    default: () => 1,
}));

jest.mock('@hooks/useOnboardingTaskInformation', () => ({
    __esModule: true,
    default: () => ({
        taskReport: undefined,
        taskParentReport: undefined,
        isOnboardingTaskParentReportArchived: false,
        hasOutstandingChildTask: false,
    }),
}));

jest.mock('@hooks/useParentReportAction', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useParticipantsInvoiceReport', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useParticipantsPolicyTags', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useReportTransactions', () => ({
    __esModule: true,
    default: () => [],
}));

jest.mock('@libs/telemetry/markSubmitExpenseEnd', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    getSpan: jest.fn(),
    startSpan: jest.fn(),
    endSpan: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const REPORT_ID = 'chat-1';
const TRANSACTION_ID = 'transaction-1';
const DRAFT_ID = 'draft-1';

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        amount: 100,
        currency: 'USD',
        merchant: 'Coffee shop',
        created: '2026-04-24',
        comment: {comment: ''},
        ...overrides,
    } as Transaction;
}

function buildReportAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: 'report-action-1',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        created: '2026-04-24',
        ...overrides,
    };
}

function buildPerDiemTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return buildTransaction({
        amount: 200,
        merchant: 'Per diem',
        comment: {
            comment: 'Trip per diem',
            customUnit: {
                customUnitID: 'per-diem-custom-unit',
                customUnitRateID: 'per-diem-rate',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                subRates: [{id: 'sub-rate-1', name: 'Meals', quantity: 1, rate: 200}],
                attributes: {
                    dates: {
                        start: '2026-04-24',
                        end: '2026-04-24',
                    },
                },
            },
        },
        ...overrides,
    });
}

function buildParams(overrides: Partial<Parameters<typeof useExpenseSubmission>[0]> = {}): Parameters<typeof useExpenseSubmission>[0] {
    const transaction = buildTransaction();
    return {
        transaction,
        transactions: [transaction],
        receiptFiles: {},
        report: {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT} as Report,
        reportID: REPORT_ID,
        policy: createMock<Policy>({id: 'policy-1'}),
        policyCategories: {} as PolicyCategories,
        isDraftPolicy: false,
        currentUserPersonalDetails: {accountID: CURRENT_USER_ACCOUNT_ID, login: 'me@test.com', email: 'me@test.com'},
        personalDetails: {},
        participants: [{accountID: 42, login: 'them@test.com', selected: true}],
        iouType: CONST.IOU.TYPE.REQUEST,
        action: CONST.IOU.ACTION.CREATE,
        requestType: undefined,
        isDistanceRequest: false,
        isManualDistanceRequest: false,
        isOdometerDistanceRequest: false,
        isPerDiemRequest: false,
        isTimeRequest: false,
        isMovingTransactionFromTrackExpense: false,
        isCategorizingTrackExpense: false,
        isSharingTrackExpense: false,
        isUnreported: false,
        isPolicyExpenseChat: false,
        draftTransactionIDs: [DRAFT_ID],
        privateIsArchivedMap: {},
        ...overrides,
    };
}

describe('useExpenseSubmission orchestrator-suppressed cleanup', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockRequestMoneyAction.mockReturnValue({iouReport: {reportID: 'iou-1'}});
        mockCreateDistanceRequestAction.mockReturnValue({iouReport: {reportID: 'distance-iou-1'}, chatReportID: 'distance-chat-1', transactionID: 'distance-transaction-1'});
        mockResolveChatTargetForSubmitCleanup.mockReturnValue({report: {reportID: REPORT_ID}, chatReportID: 'fallback-id', optimisticChatReportID: undefined});
        mockResolveOptimisticSplitChatReportID.mockReturnValue({optimisticSplitChatReportID: undefined, chatReportID: REPORT_ID});
        mockHasCompletePerDiemCustomUnit.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
    });

    describe('requestMoney path', () => {
        it('calls cleanupAfterExpenseCreate and skips cleanupAndNavigateAfterExpenseCreate when shouldHandleNavigation=false (orchestrator pre-navigated)', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildParams()));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockRequestMoneyAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftTransactionIDs: [DRAFT_ID],
                }),
            );
            expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
        });

        it('calls cleanupAndNavigateAfterExpenseCreate (which composes cleanup) when shouldHandleNavigation=true', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildParams()));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockRequestMoneyAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
            // cleanupAndNavigate is mocked here, so it never calls through to the real cleanupAfterExpenseCreate.
            expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
        });

        it('passes the existing tracked transaction ID (not a fresh optimistic id) to cleanup for a move-from-track SUBMIT', async () => {
            // Move-from-track SUBMIT: the action writes the transaction under the EXISTING tracked transaction id,
            // so cleanup must reference that same id — not a fresh rand64() optimistic one.
            const EXISTING_TRACKED_TRANSACTION_ID = 'tracked-transaction-99';
            const linkedTrackedExpenseReportAction = buildReportAction({
                reportActionID: 'linked-action-1',
                originalMessage: {
                    IOUTransactionID: EXISTING_TRACKED_TRANSACTION_ID,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            });
            const movedTransaction = buildTransaction({
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID: 'tracked-report-1',
            });

            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        action: CONST.IOU.ACTION.SUBMIT,
                        transaction: movedTransaction,
                        transactions: [movedTransaction],
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionID: EXISTING_TRACKED_TRANSACTION_ID,
                }),
            );
        });

        // F2: requestMoney returns the chat it wrote to via {iouReport}; the UI reads that instead of re-deriving it through resolveChatTargetForSubmitCleanup.
        it('uses iouReport.chatReportID for cleanup nav and does not re-derive it via resolveChatTargetForSubmitCleanup', async () => {
            mockRequestMoneyAction.mockReturnValue({iouReport: {reportID: 'iou-1', chatReportID: 'iou-chat-77'}});

            const {result} = renderHook(() => useExpenseSubmission(buildParams()));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockResolveChatTargetForSubmitCleanup).not.toHaveBeenCalled();
            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({optimisticChatReportID: 'iou-chat-77'}));
        });

        it('routes tracked per diem SUBMIT through requestMoney so the original tracked expense is moved', async () => {
            const existingTrackedTransactionID = 'tracked-per-diem-transaction-1';
            const linkedTrackedExpenseReportAction = buildReportAction({
                reportActionID: 'tracked-per-diem-action-1',
                childReportID: 'tracked-per-diem-thread-1',
                originalMessage: {
                    IOUTransactionID: existingTrackedTransactionID,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            });
            const perDiemTransaction = buildPerDiemTransaction({
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID: 'tracked-per-diem-report-1',
            });

            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        action: CONST.IOU.ACTION.SUBMIT,
                        requestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                        isPerDiemRequest: true,
                        transaction: perDiemTransaction,
                        transactions: [perDiemTransaction],
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockRequestMoneyAction).toHaveBeenCalledTimes(1);
            expect(mockRequestMoneyAction).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: CONST.IOU.ACTION.SUBMIT,
                    existingTransaction: perDiemTransaction,
                    transactionParams: expect.objectContaining({
                        linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: 'tracked-per-diem-report-1',
                    }),
                }),
            );
            expect(mockSubmitPerDiemExpenseAction).not.toHaveBeenCalled();
            expect(mockSubmitPerDiemExpenseForSelfDMAction).not.toHaveBeenCalled();
        });
    });

    describe('distance request path', () => {
        it.each([
            ['omits stale', 0, false],
            ['forwards commuter exclusion', 2, true],
        ])('%s modified fields', async (_description, commuterExclusion, shouldForwardModifiedFields) => {
            const distanceTransaction = buildTransaction({
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL,
                modifiedAmount: 80,
                modifiedMerchant: '8 mi @ $0.50 / mi',
                comment: {comment: '', customUnit: {commuterExclusion, reimbursableDistance: 8, distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}},
            });
            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        transaction: distanceTransaction,
                        transactions: [distanceTransaction],
                        requestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL,
                        isDistanceRequest: true,
                        isManualDistanceRequest: true,
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });

            const transactionParams = mockCreateDistanceRequestAction.mock.calls.at(-1)?.at(0)?.transactionParams;
            if (shouldForwardModifiedFields) {
                expect(transactionParams).toEqual(expect.objectContaining({modifiedAmount: 80, modifiedMerchant: '8 mi @ $0.50 / mi'}));
            } else {
                expect(transactionParams).not.toHaveProperty('modifiedAmount');
                expect(transactionParams).not.toHaveProperty('modifiedMerchant');
            }
        });
    });

    describe('trackExpense path', () => {
        it('calls cleanupAfterExpenseCreate and skips cleanupAndNavigateAfterExpenseCreate when shouldHandleNavigation=false (orchestrator pre-navigated)', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildParams({iouType: CONST.IOU.TYPE.TRACK})));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockTrackExpenseAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftTransactionIDs: [DRAFT_ID],
                }),
            );
            expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
        });

        it('calls cleanupAndNavigateAfterExpenseCreate when shouldHandleNavigation=true', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildParams({iouType: CONST.IOU.TYPE.TRACK})));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockTrackExpenseAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
        });

        it('forwards the per-iteration draft as existingTransaction so getTrackExpenseInformation finds it', async () => {
            const params = buildParams({iouType: CONST.IOU.TYPE.TRACK});
            const {result} = renderHook(() => useExpenseSubmission(params));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({existingTransaction: params.transactions.at(0)}));
        });

        // Regression test for #94282: an expense whose sole recipient is the current user must be a self-DM track
        // expense, even when the route iouType hasn't been converted to TRACK yet (new manual flow). Otherwise it
        // falls through to requestMoney and the backend rejects it ("you cannot request money from yourself").
        it('routes an expense whose only recipient is the current user through trackExpense, not requestMoney', async () => {
            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        iouType: CONST.IOU.TYPE.CREATE,
                        participants: [{accountID: CURRENT_USER_ACCOUNT_ID, login: 'me@test.com', selected: true}],
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockTrackExpenseAction).toHaveBeenCalledTimes(1);
            expect(mockRequestMoneyAction).not.toHaveBeenCalled();
            // The self-DM is forced as the chat target (route report is cleared) so the action defaults to the self-DM.
            expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({report: undefined}));
        });
    });

    describe('per diem path', () => {
        it('keeps initial self-DM per diem tracking on submitPerDiemExpenseForSelfDM', async () => {
            const perDiemTransaction = buildPerDiemTransaction();

            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        iouType: CONST.IOU.TYPE.TRACK,
                        requestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                        isPerDiemRequest: true,
                        transaction: perDiemTransaction,
                        transactions: [perDiemTransaction],
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockSubmitPerDiemExpenseForSelfDMAction).toHaveBeenCalledTimes(1);
            expect(mockRequestMoneyAction).not.toHaveBeenCalled();
        });

        it('removes the draft and dismisses to the self-DM when shouldHandleNavigation=true', async () => {
            const perDiemTransaction = buildPerDiemTransaction();

            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        iouType: CONST.IOU.TYPE.TRACK,
                        requestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                        isPerDiemRequest: true,
                        transaction: perDiemTransaction,
                        transactions: [perDiemTransaction],
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: true});
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledTimes(1);
        });

        it('removes the draft without dismissing when shouldHandleNavigation=false (orchestrator pre-navigated)', async () => {
            const perDiemTransaction = buildPerDiemTransaction();

            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        iouType: CONST.IOU.TYPE.TRACK,
                        requestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                        isPerDiemRequest: true,
                        transaction: perDiemTransaction,
                        transactions: [perDiemTransaction],
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]});
            expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
        });

        it('does not submit, remove the draft, or navigate when the custom unit is incomplete (the action would no-op)', async () => {
            // The UI gates on the same check the action guards on, so a submit that would bail never runs and the draft survives.
            mockHasCompletePerDiemCustomUnit.mockReturnValue(false);
            const logAlertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
            const perDiemTransaction = buildPerDiemTransaction();

            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        iouType: CONST.IOU.TYPE.TRACK,
                        requestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                        isPerDiemRequest: true,
                        transaction: perDiemTransaction,
                        transactions: [perDiemTransaction],
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockSubmitPerDiemExpenseForSelfDMAction).not.toHaveBeenCalled();
            expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
            expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
            expect(logAlertSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('split path', () => {
        function buildSplitParams(transactionOverrides: Partial<Transaction> = {}) {
            const splitTransaction = buildTransaction(transactionOverrides);
            return buildParams({
                iouType: CONST.IOU.TYPE.SPLIT,
                transaction: splitTransaction,
                transactions: [splitTransaction],
            });
        }

        it('dismisses to the report the split was posted in when shouldHandleNavigation=true', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildSplitParams()));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: true});
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith(REPORT_ID, undefined, false);
        });

        it('only removes the draft when shouldHandleNavigation=false (orchestrator pre-navigated)', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildSplitParams()));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]});
            expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
        });

        it('threads the pre-generated optimistic chat ID into splitBillAndOpenReport and dismisses to that same report', async () => {
            // Global create has no existing chat, so the UI mints the ID the action will build the chat under.
            mockResolveOptimisticSplitChatReportID.mockReturnValue({optimisticSplitChatReportID: 'optimistic-split-chat', chatReportID: 'optimistic-split-chat'});

            const {result} = renderHook(() => useExpenseSubmission(buildSplitParams({isFromGlobalCreate: true})));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockSplitBillAction).not.toHaveBeenCalled();
            expect(mockSplitBillAndOpenReportAction).toHaveBeenCalledWith(expect.objectContaining({optimisticSplitChatReportID: 'optimistic-split-chat'}));
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith('optimistic-split-chat', undefined, false);
        });

        it('dismisses to the existing chat when one already resolves, leaving the optimistic ID undefined', async () => {
            mockResolveOptimisticSplitChatReportID.mockReturnValue({optimisticSplitChatReportID: undefined, chatReportID: 'existing-group-chat'});

            const {result} = renderHook(() => useExpenseSubmission(buildSplitParams({isFromGlobalCreate: true})));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockSplitBillAndOpenReportAction).toHaveBeenCalledWith(expect.objectContaining({optimisticSplitChatReportID: undefined}));
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith('existing-group-chat', undefined, false);
        });

        it('reserves the SEARCH channel before splitBill when the split lands back on Search (the action hardcodes shouldDeferForSearch:false)', async () => {
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

            const {result} = renderHook(() => useExpenseSubmission(buildSplitParams()));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockReserveDeferredWriteChannel).toHaveBeenCalledWith(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
        });

        it('reserves the SEARCH channel before splitBillAndOpenReport when the split lands back on Search', async () => {
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

            const {result} = renderHook(() => useExpenseSubmission(buildSplitParams({isFromGlobalCreate: true})));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockReserveDeferredWriteChannel).toHaveBeenCalledWith(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            expect(mockSplitBillAndOpenReportAction).toHaveBeenCalledTimes(1);
        });

        it('does not reserve the SEARCH channel when the split is not landing on Search', async () => {
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);

            const {result} = renderHook(() => useExpenseSubmission(buildSplitParams()));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockReserveDeferredWriteChannel).not.toHaveBeenCalled();
            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
        });

        it('does not reserve the SEARCH channel (or run the split) when there is no login to submit with, even on Search', async () => {
            // The shared reservation runs before the branch's login+transaction check, so it must reuse that guard or it leaks a SEARCH channel no write ever flushes.
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            const splitTransaction = buildTransaction();

            const {result} = renderHook(() =>
                useExpenseSubmission(
                    buildParams({
                        iouType: CONST.IOU.TYPE.SPLIT,
                        transaction: splitTransaction,
                        transactions: [splitTransaction],
                        currentUserPersonalDetails: {accountID: CURRENT_USER_ACCOUNT_ID, login: undefined, email: 'me@test.com'},
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockReserveDeferredWriteChannel).not.toHaveBeenCalled();
            expect(mockSplitBillAction).not.toHaveBeenCalled();
        });
    });
});

describe('useExpenseSubmission action-bailout safety', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockResolveChatTargetForSubmitCleanup.mockReturnValue({report: {reportID: REPORT_ID}, chatReportID: 'fallback-id', optimisticChatReportID: undefined});
    });

    it('skips requestMoney entirely (including the action call) when SUBMIT batch is missing linked-track metadata', async () => {
        // UI rejects the malformed batch upfront (the action would only bail per-item).
        const {result} = renderHook(() => useExpenseSubmission(buildParams({action: CONST.IOU.ACTION.SUBMIT})));
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            result.current.createTransaction(false, true);
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockRequestMoneyAction).not.toHaveBeenCalled();
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });

    it('skips cleanup/nav when a multi-transaction SUBMIT batch has any iteration that bails (defense-in-depth — preserves the failed item draft)', async () => {
        // Cast keeps the fixture minimal — pre-validation only needs truthy presence.
        const linkedTracked = {linkedTrackedExpenseReportAction: buildReportAction({reportActionID: 'a-1'}), linkedTrackedExpenseReportID: 'r-1'};
        const transaction1 = buildTransaction({transactionID: 't-1', ...linkedTracked});
        const transaction2 = buildTransaction({transactionID: 't-2', ...linkedTracked});
        mockRequestMoneyAction.mockReturnValueOnce({iouReport: {reportID: 'iou-1'}}).mockReturnValueOnce({});

        const {result} = renderHook(() =>
            useExpenseSubmission(
                buildParams({
                    action: CONST.IOU.ACTION.SUBMIT,
                    transaction: transaction1,
                    transactions: [transaction1, transaction2],
                }),
            ),
        );
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            result.current.createTransaction(false, true);
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockRequestMoneyAction).toHaveBeenCalledTimes(2);
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });

    it('skips trackExpense entirely (including the action call) when CATEGORIZE is missing linked-track metadata', async () => {
        // UI rejects the malformed batch upfront (the action would only bail per-item).
        const {result} = renderHook(() =>
            useExpenseSubmission(
                buildParams({
                    iouType: CONST.IOU.TYPE.TRACK,
                    action: CONST.IOU.ACTION.CATEGORIZE,
                }),
            ),
        );
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            result.current.createTransaction(false, true);
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockTrackExpenseAction).not.toHaveBeenCalled();
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });

    describe('invoice path', () => {
        it('calls cleanupAndNavigateAfterExpenseCreate with isInvoice when shouldHandleNavigation=true', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildParams({iouType: CONST.IOU.TYPE.INVOICE})));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockSendInvoiceAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    isInvoice: true,
                    optimisticChatReportID: REPORT_ID,
                    transactionID: TRANSACTION_ID,
                }),
            );
        });

        it('calls cleanupAfterExpenseCreate and skips cleanupAndNavigateAfterExpenseCreate when shouldHandleNavigation=false', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildParams({iouType: CONST.IOU.TYPE.INVOICE})));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction(false, false);
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockSendInvoiceAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
            expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
        });
    });
});
