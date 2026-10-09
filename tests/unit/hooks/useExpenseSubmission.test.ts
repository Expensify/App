/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, renderHook} from '@testing-library/react-native';

import * as IOUUtils from '@libs/IOUUtils';
// eslint-disable-next-line no-restricted-imports -- Namespace import is required to spy on getChatByParticipants without replacing the production module.
import * as ReportUtils from '@libs/ReportUtils';

import useSubmitLock from '@pages/iou/request/step/confirmation/submission/useSubmitLock';
import useExpenseSubmissionWithLock from '@pages/iou/request/step/confirmation/useExpenseSubmission';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

/** The page owns the submit lock, so mount a fresh one next to the hook the same way the page does. */
function useExpenseSubmission(params: Omit<Parameters<typeof useExpenseSubmissionWithLock>[0], 'submitLock'>) {
    return useExpenseSubmissionWithLock({...params, submitLock: useSubmitLock()});
}

const mockRequestMoneyAction = jest.fn();
const mockTrackExpenseAction = jest.fn();
const mockSubmitPerDiemExpenseAction = jest.fn();
const mockSubmitPerDiemExpenseForSelfDMAction = jest.fn();
const mockHasCompletePerDiemCustomUnit = jest.fn();
const mockCleanupAfterExpenseCreate = jest.fn();
const mockCleanupAndNavigateAfterExpenseCreate = jest.fn();
const mockResolveChatTargetForSubmitCleanup = jest.fn();
const mockDismissModalAndOpenReportInInboxTab = jest.fn();
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

jest.mock('@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockDismissModalAndOpenReportInInboxTab(...args),
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
    default: () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}),
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
        canEnterScanFieldsManually: false,
        report: {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT} as Report,
        reportID: REPORT_ID,
        reportDrafts: {},
        policy: createMock<Policy>({id: 'policy-1'}),
        policyCategories: {} as PolicyCategories,
        isDraftPolicy: false,
        currentUserPersonalDetails: {accountID: CURRENT_USER_ACCOUNT_ID, login: 'me@test.com', email: 'me@test.com'},
        personalDetails: {},
        participants: [{accountID: 42, login: 'them@test.com', selected: true}],
        iouType: CONST.IOU.TYPE.REQUEST,
        action: CONST.IOU.ACTION.CREATE,
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
        mockHasCompletePerDiemCustomUnit.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
    });

    describe('requestMoney path', () => {
        it('uses the transaction report ID for a brand-new P2P recipient optimistic chat', async () => {
            // Given a new P2P recipient whose transaction already reserved a report ID
            const optimisticP2PReportID = 'reused-p2p-report-1';
            const transaction = buildTransaction({reportID: optimisticP2PReportID});
            const getChatByParticipantsSpy = jest.spyOn(ReportUtils, 'getChatByParticipants').mockReturnValue(undefined);
            const getReusableP2PReportIDSpy = jest.spyOn(IOUUtils, 'getReusableP2PReportID').mockReturnValue(optimisticP2PReportID);

            try {
                const {result} = renderHook(() =>
                    useExpenseSubmission(
                        buildParams({
                            transaction,
                            transactions: [transaction],
                            report: undefined,
                            reportID: optimisticP2PReportID,
                        }),
                    ),
                );
                await waitForBatchedUpdatesWithAct();

                // When the request is created before a persisted chat can be resolved
                await act(async () => {
                    result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: false});
                });
                await waitForBatchedUpdatesWithAct();

                // Then the reserved ID is forwarded so optimistic transaction and chat data align
                expect(getChatByParticipantsSpy).toHaveBeenCalled();
                expect(getReusableP2PReportIDSpy).toHaveBeenCalledWith(expect.objectContaining({accountID: 42}), optimisticP2PReportID);
                expect(mockRequestMoneyAction).toHaveBeenCalledWith(expect.objectContaining({optimisticChatReportID: optimisticP2PReportID}));
            } finally {
                getChatByParticipantsSpy.mockRestore();
                getReusableP2PReportIDSpy.mockRestore();
            }
        });

        describe('receipt state on a Scan the user filled in', () => {
            function buildScanParams(transactionOverrides: Partial<Transaction>, cachedReceiptState: Receipt['state']) {
                const transaction = buildTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN, ...transactionOverrides});
                return buildParams({
                    transaction,
                    transactions: [transaction],
                    canEnterScanFieldsManually: true,
                    receiptFiles: {[TRANSACTION_ID]: createMock<Receipt>({state: cachedReceiptState})},
                });
            }

            async function submit(params: Parameters<typeof useExpenseSubmission>[0]) {
                const {result} = renderHook(() => useExpenseSubmission(params));
                await waitForBatchedUpdatesWithAct();
                await act(async () => {
                    result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: false});
                });
                await waitForBatchedUpdatesWithAct();
            }

            it('submits `open` when all three fields are entered, even while the cached receipt still says SCAN_READY', async () => {
                // Given a scan the user filled in whose receipt was validated before the last field was entered
                await submit(buildScanParams({isAmountSet: true, isMerchantSet: true, isCreatedSet: true}, CONST.IOU.RECEIPT_STATE.SCAN_READY));

                // Then SmartScan is told to leave the receipt alone rather than overwriting what the user typed
                expect(mockRequestMoneyAction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        transactionParams: expect.objectContaining({receiptState: CONST.IOU.RECEIPT_STATE.OPEN}),
                    }),
                );
            });

            it('submits `scanready` once a field is cleared again, even while the cached receipt still says OPEN', async () => {
                // Given a scan whose merchant the user cleared after having filled all three fields
                await submit(buildScanParams({isAmountSet: true, isMerchantSet: false, isCreatedSet: true}, CONST.IOU.RECEIPT_STATE.OPEN));

                // Then SmartScan is asked to read the receipt so the cleared field still gets filled in
                expect(mockRequestMoneyAction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        transactionParams: expect.objectContaining({receiptState: CONST.IOU.RECEIPT_STATE.SCAN_READY}),
                    }),
                );
            });

            it('sends no override on surfaces that do not expose the scan fields, leaving the validated receipt state alone', async () => {
                // Given a manual expense with an attached receipt, which the validator already marked `open`
                const transaction = buildTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL});
                await submit(
                    buildParams({
                        transaction,
                        transactions: [transaction],
                        canEnterScanFieldsManually: false,
                        receiptFiles: {[TRANSACTION_ID]: createMock<Receipt>({state: CONST.IOU.RECEIPT_STATE.OPEN})},
                    }),
                );

                // Then no override is sent and the action keeps using the state the validator wrote onto the receipt
                expect(mockRequestMoneyAction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        transactionParams: expect.objectContaining({
                            receiptState: undefined,
                            receipt: expect.objectContaining({state: CONST.IOU.RECEIPT_STATE.OPEN}),
                        }),
                    }),
                );
            });
        });

        it('calls cleanupAfterExpenseCreate and skips cleanupAndNavigateAfterExpenseCreate when shouldHandleNavigation=false (orchestrator pre-navigated)', async () => {
            const {result} = renderHook(() => useExpenseSubmission(buildParams()));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: false});
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
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
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
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
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
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
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
                        isPerDiemRequest: true,
                        transaction: perDiemTransaction,
                        transactions: [perDiemTransaction],
                    }),
                ),
            );
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
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
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: false});
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
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
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
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
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
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockTrackExpenseAction).toHaveBeenCalledTimes(1);
            expect(mockRequestMoneyAction).not.toHaveBeenCalled();
            // The self-DM is forced as the chat target (route report is cleared) so the action defaults to the self-DM.
            expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({report: undefined}));
        });

        // A self-DM destination clears the route report, so trackExpense resolves the chat to the self-DM. Reporting
        // the route report's draft state would make getTrackExpenseInformation build a workspace whose expense chat
        // overwrites the self-DM's report, so the flag has to follow the chat that is actually used.
        it('reports isDraftChatReport=false for a self-DM destination even when the route report is a draft', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${REPORT_ID}`, {reportID: REPORT_ID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT} as Report);

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
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({report: undefined, isDraftChatReport: false}));
        });

        it('reports isDraftChatReport=true when the draft route report is the chat the expense is tracked against', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${REPORT_ID}`, {reportID: REPORT_ID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT} as Report);

            const {result} = renderHook(() => useExpenseSubmission(buildParams({iouType: CONST.IOU.TYPE.TRACK})));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
            });
            await waitForBatchedUpdatesWithAct();

            expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({isDraftChatReport: true}));
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
            result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
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
            result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
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
            result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: true});
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockTrackExpenseAction).not.toHaveBeenCalled();
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });
});
