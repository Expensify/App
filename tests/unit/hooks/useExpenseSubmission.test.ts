/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, renderHook} from '@testing-library/react-native';

import useExpenseSubmission from '@pages/iou/request/step/confirmation/useExpenseSubmission';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report, ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockRequestMoneyAction = jest.fn();
const mockTrackExpenseAction = jest.fn();
const mockSubmitPerDiemExpenseAction = jest.fn();
const mockSubmitPerDiemExpenseForSelfDMAction = jest.fn();
const mockCleanupAfterExpenseCreate = jest.fn();
const mockCleanupAndNavigateAfterExpenseCreate = jest.fn();
const mockResolveChatTargetForSubmitCleanup = jest.fn();

jest.mock('@userActions/IOU/TrackExpense', () => ({
    requestMoney: (...args: unknown[]) => mockRequestMoneyAction(...args),
    trackExpense: (...args: unknown[]) => mockTrackExpenseAction(...args),
}));

jest.mock('@userActions/IOU/PerDiem', () => ({
    submitPerDiemExpense: (...args: unknown[]) => mockSubmitPerDiemExpenseAction(...args),
    submitPerDiemExpenseForSelfDM: (...args: unknown[]) => mockSubmitPerDiemExpenseForSelfDMAction(...args),
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
        policy: {id: 'policy-1'} as Policy,
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
        mockResolveChatTargetForSubmitCleanup.mockReturnValue({report: {reportID: REPORT_ID}, chatReportID: 'fallback-id', optimisticChatReportID: undefined});
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
});
