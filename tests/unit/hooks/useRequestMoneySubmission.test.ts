import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';

import useRequestMoneySubmission from '@pages/iou/request/step/confirmation/submission/useRequestMoneySubmission';
import {resolveChatTargetForSubmitCleanup} from '@pages/iou/request/step/resolveChatTarget';

import {requestMoney} from '@userActions/IOU/TrackExpense';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import {
    buildChatReport,
    buildLinkedTrackedExpenseFields,
    buildPerDiemTransaction,
    buildTransaction,
    CURRENT_USER_PERSONAL_DETAILS,
    DRAFT_ID,
    NO_TAX_VALUES,
    OTHER_USER_PARTICIPANT,
    renderAndSubmit,
    TRANSACTION_ID,
} from '../../utils/expenseSubmissionTestUtils';

jest.mock('@userActions/IOU/TrackExpense', () => ({requestMoney: jest.fn()}));
jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@pages/iou/request/step/resolveChatTarget', () => ({resolveChatTargetForSubmitCleanup: jest.fn()}));

const mockRequestMoneyAction = jest.mocked(requestMoney);
const mockCleanupAfterExpenseCreate = jest.mocked(cleanupAfterExpenseCreate);
const mockCleanupAndNavigateAfterExpenseCreate = jest.mocked(cleanupAndNavigateAfterExpenseCreate);
const mockResolveChatTargetForSubmitCleanup = jest.mocked(resolveChatTargetForSubmitCleanup);

type UseRequestMoneySubmissionParams = Parameters<typeof useRequestMoneySubmission>[0];

function buildParams(overrides: Partial<UseRequestMoneySubmissionParams> = {}): UseRequestMoneySubmissionParams {
    const transaction = buildTransaction();
    return {
        transaction,
        transactions: [transaction],
        receiptFiles: {},
        canEnterScanFieldsManually: false,
        isPolicyExpenseChat: false,
        report: buildChatReport(),
        reportDrafts: {},
        policy: createMock<Policy>({id: 'policy-1'}),
        policyCategories: {},
        personalDetails: {},
        currentUserPersonalDetails: CURRENT_USER_PERSONAL_DETAILS,
        selectedParticipants: [OTHER_USER_PARTICIPANT],
        iouType: CONST.IOU.TYPE.REQUEST,
        action: CONST.IOU.ACTION.CREATE,
        isGPSDistanceRequest: false,
        isTimeRequest: false,
        isMovingTransactionFromTrackExpense: false,
        isCategorizingTrackExpense: false,
        isSharingTrackExpense: false,
        isSelfDMDestination: false,
        draftTransactionIDs: [DRAFT_ID],
        privateIsArchivedMap: {},
        ...NO_TAX_VALUES,
        ...overrides,
    };
}

function submit(params: UseRequestMoneySubmissionParams, shouldHandleNavigation: boolean) {
    return renderAndSubmit(() => useRequestMoneySubmission(params), shouldHandleNavigation);
}

describe('useRequestMoneySubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockRequestMoneyAction.mockReturnValue({iouReport: buildChatReport({reportID: 'iou-1'})});
    });

    it('uses the transaction report ID for a brand-new P2P recipient optimistic chat', async () => {
        // Given a new P2P recipient with no chat yet, whose transaction already reserved a report ID
        const optimisticP2PReportID = 'reused-p2p-report-1';
        const transaction = buildTransaction({reportID: optimisticP2PReportID});

        // When the request is created before a persisted chat can be resolved
        await submit(buildParams({transaction, transactions: [transaction], report: undefined}), false);

        // Then the reserved ID is forwarded, so the optimistic transaction and chat data line up with the chat the screen subscribes to
        expect(mockRequestMoneyAction).toHaveBeenCalledWith(expect.objectContaining({optimisticChatReportID: optimisticP2PReportID}));
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

        it('submits `open` when all three fields are entered, even while the cached receipt still says SCAN_READY', async () => {
            // Given a scan the user filled in whose receipt was validated before the last field was entered
            const params = buildScanParams({isAmountSet: true, isMerchantSet: true, isCreatedSet: true}, CONST.IOU.RECEIPT_STATE.SCAN_READY);

            // When the expense is submitted
            await submit(params, false);

            // Then SmartScan is told to leave the receipt alone rather than overwriting what the user typed
            expect(mockRequestMoneyAction).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({receiptState: CONST.IOU.RECEIPT_STATE.OPEN}),
                }),
            );
        });

        it('submits `scanready` once a field is cleared again, even while the cached receipt still says OPEN', async () => {
            // Given a scan whose date the user cleared after having filled all three fields
            const params = buildScanParams({isAmountSet: true, isMerchantSet: true, isCreatedSet: false}, CONST.IOU.RECEIPT_STATE.OPEN);

            // When the expense is submitted
            await submit(params, false);

            // Then SmartScan is asked to read the receipt so the cleared field still gets filled in
            expect(mockRequestMoneyAction).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({receiptState: CONST.IOU.RECEIPT_STATE.SCAN_READY}),
                }),
            );
        });

        it('submits `open` for a P2P scan with the amount and date entered but no merchant', async () => {
            // Given a P2P scan (not a workspace chat) whose merchant the user left blank (#101147)
            const params = buildScanParams({isAmountSet: true, isMerchantSet: false, isCreatedSet: true}, CONST.IOU.RECEIPT_STATE.SCAN_READY);

            // When the expense is submitted
            await submit(params, false);

            // Then the merchant isn't required, so SmartScan is told to leave the entered values alone
            expect(mockRequestMoneyAction).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({receiptState: CONST.IOU.RECEIPT_STATE.OPEN}),
                }),
            );
        });

        it('sends no override on surfaces that do not expose the scan fields, leaving the validated receipt state alone', async () => {
            // Given a scan on a surface that never showed the scan fields (a moved tracked expense or a test receipt), which still
            // carries all three "entered" flags, and whose receipt the validator already marked `open`
            const params = {
                ...buildScanParams({isAmountSet: true, isMerchantSet: true, isCreatedSet: true}, CONST.IOU.RECEIPT_STATE.OPEN),
                canEnterScanFieldsManually: false,
            };

            // When the expense is submitted
            await submit(params, false);

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

    it('only cleans up when shouldHandleNavigation=false, because the orchestrator already navigated', async () => {
        // Given a regular expense owed by another person

        // When it is submitted after the orchestrator navigated away
        await submit(buildParams(), false);

        // Then the drafts are cleaned up without navigating a second time
        expect(mockRequestMoneyAction).toHaveBeenCalledTimes(1);
        expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({draftTransactionIDs: [DRAFT_ID]}));
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });

    it('cleans up and navigates when shouldHandleNavigation=true', async () => {
        // Given a regular expense owed by another person

        // When it is submitted and the hook owns the navigation
        await submit(buildParams(), true);

        // Then cleanupAndNavigateAfterExpenseCreate runs, which does the cleanup itself, so the plain cleanup is not called on top of it
        expect(mockRequestMoneyAction).toHaveBeenCalledTimes(1);
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
    });

    it('passes the existing tracked transaction ID (not a fresh optimistic ID) to cleanup for a move-from-track SUBMIT', async () => {
        // Given a tracked expense being submitted, which the action writes under the existing tracked transaction ID
        const existingTrackedTransactionID = 'tracked-transaction-99';
        const movedTransaction = buildTransaction(buildLinkedTrackedExpenseFields(existingTrackedTransactionID));

        // When it is submitted
        await submit(buildParams({action: CONST.IOU.ACTION.SUBMIT, transaction: movedTransaction, transactions: [movedTransaction]}), true);

        // Then cleanup points at that same ID, otherwise it would navigate to a transaction that was never written
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({transactionID: existingTrackedTransactionID}));
    });

    it('uses iouReport.chatReportID for cleanup navigation instead of re-deriving it through resolveChatTargetForSubmitCleanup', async () => {
        // Given requestMoney reports the chat it wrote to
        mockRequestMoneyAction.mockReturnValue({iouReport: buildChatReport({reportID: 'iou-1', chatReportID: 'iou-chat-77'})});

        // When the expense is submitted
        await submit(buildParams(), true);

        // Then navigation uses that chat, since resolving it again could pick a different one
        expect(mockResolveChatTargetForSubmitCleanup).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({optimisticChatReportID: 'iou-chat-77'}));
    });

    it('sends the tracked per diem being submitted to requestMoney with its linked-track metadata, so the original tracked expense is moved', async () => {
        // Given a tracked per diem expense being submitted, which resolveSubmissionPath sends down the request money path
        const linkedTrackedExpenseFields = buildLinkedTrackedExpenseFields('tracked-per-diem-transaction-1');
        const perDiemTransaction = buildPerDiemTransaction(linkedTrackedExpenseFields);

        // When it is submitted
        await submit(buildParams({action: CONST.IOU.ACTION.SUBMIT, transaction: perDiemTransaction, transactions: [perDiemTransaction]}), true);

        // Then requestMoney gets the tracked expense to move rather than creating a new one
        expect(mockRequestMoneyAction).toHaveBeenCalledTimes(1);
        expect(mockRequestMoneyAction).toHaveBeenCalledWith(
            expect.objectContaining({
                action: CONST.IOU.ACTION.SUBMIT,
                existingTransaction: perDiemTransaction,
                transactionParams: expect.objectContaining(linkedTrackedExpenseFields),
            }),
        );
    });

    describe('action bailout', () => {
        it('skips requestMoney entirely when a SUBMIT batch is missing linked-track metadata', async () => {
            // Given a SUBMIT whose transaction has no linked tracked expense, which the action would only reject per item, too late for the UI to keep the draft
            const params = buildParams({action: CONST.IOU.ACTION.SUBMIT});

            // When it is submitted
            await submit(params, true);

            // Then the batch is rejected up front, so nothing is written and the draft is left for a retry
            expect(mockRequestMoneyAction).not.toHaveBeenCalled();
            expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
            expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
        });

        it('skips cleanup and navigation when any transaction in a multi-transaction SUBMIT batch bails', async () => {
            // Given a two-transaction SUBMIT where the action bails on the second one
            const transaction1 = buildTransaction({transactionID: 't-1', ...buildLinkedTrackedExpenseFields('tracked-1')});
            const transaction2 = buildTransaction({transactionID: 't-2', ...buildLinkedTrackedExpenseFields('tracked-2')});
            mockRequestMoneyAction.mockReturnValueOnce({iouReport: buildChatReport({reportID: 'iou-1'})}).mockReturnValueOnce({});

            // When the batch is submitted
            await submit(buildParams({action: CONST.IOU.ACTION.SUBMIT, transaction: transaction1, transactions: [transaction1, transaction2]}), true);

            // Then the drafts are kept, so the failed transaction can be retried
            expect(mockRequestMoneyAction).toHaveBeenCalledTimes(2);
            expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
            expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
        });
    });
});
