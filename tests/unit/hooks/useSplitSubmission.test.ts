import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import {markPendingSearchWrite} from '@libs/pendingSearchWrite';
import type * as PendingSearchWrite from '@libs/pendingSearchWrite';

import useSplitSubmission from '@pages/iou/request/step/confirmation/submission/useSplitSubmission';

import {resolveOptimisticSplitChatReportID, splitBill, splitBillAndOpenReport, startSplitBill} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import {
    buildChatReport,
    buildTransaction,
    CURRENT_USER_ACCOUNT_ID,
    CURRENT_USER_PERSONAL_DETAILS,
    NO_TAX_VALUES,
    OTHER_USER_PARTICIPANT,
    renderAndSubmit,
    REPORT_ID,
    TRANSACTION_ID,
} from '../../utils/expenseSubmissionTestUtils';

jest.mock('@userActions/IOU/Split', () => ({
    splitBill: jest.fn(),
    splitBillAndOpenReport: jest.fn(),
    resolveOptimisticSplitChatReportID: jest.fn(),
    startSplitBill: jest.fn(),
}));
jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/pendingSearchWrite', () => ({
    ...jest.requireActual<typeof PendingSearchWrite>('@libs/pendingSearchWrite'),
    markPendingSearchWrite: jest.fn(),
}));

const mockSplitBillAction = jest.mocked(splitBill);
const mockSplitBillAndOpenReportAction = jest.mocked(splitBillAndOpenReport);
const mockStartSplitBillAction = jest.mocked(startSplitBill);
const mockResolveOptimisticSplitChatReportID = jest.mocked(resolveOptimisticSplitChatReportID);
const mockCleanupAfterExpenseCreate = jest.mocked(cleanupAfterExpenseCreate);
const mockDismissModalAndOpenReportInInboxTab = jest.mocked(dismissModalAndOpenReportInInboxTab);
const mockMarkPendingSearchWrite = jest.mocked(markPendingSearchWrite);
const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);
const mockReleaseSubmitLock = jest.fn();

const STALE_TRANSACTION_ID = 'stale-transaction';

type UseSplitSubmissionParams = Parameters<typeof useSplitSubmission>[0];

function buildParams(overrides: Partial<UseSplitSubmissionParams> = {}): UseSplitSubmissionParams {
    const transaction = buildTransaction();
    return {
        transaction,
        transactions: [transaction],
        receiptFiles: {},
        canEnterScanFieldsManually: false,
        isPolicyExpenseChat: false,
        report: buildChatReport(),
        policyID: 'policy-1',
        personalDetails: {},
        currentUserPersonalDetails: CURRENT_USER_PERSONAL_DETAILS,
        selectedParticipants: [OTHER_USER_PARTICIPANT],
        iouType: CONST.IOU.TYPE.SPLIT,
        releaseSubmitLock: mockReleaseSubmitLock,
        ...NO_TAX_VALUES,
        ...overrides,
    };
}

function buildSplitParams(transactionOverrides: Partial<Transaction> = {}) {
    const transaction = buildTransaction(transactionOverrides);
    return buildParams({transaction, transactions: [transaction]});
}

function buildScanSplitParams(transactions: Transaction[], receiptFiles: Record<string, Receipt>) {
    return buildParams({transaction: transactions.at(0), transactions, receiptFiles});
}

function submit(params: UseSplitSubmissionParams, shouldHandleNavigation: boolean) {
    return renderAndSubmit(() => useSplitSubmission(params), shouldHandleNavigation);
}

describe('useSplitSubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockResolveOptimisticSplitChatReportID.mockReturnValue({optimisticSplitChatReportID: undefined, chatReportID: REPORT_ID});
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
    });

    describe('manual split', () => {
        it('dismisses to the report the split was posted in when shouldHandleNavigation=true', async () => {
            // Given a split started from an existing chat

            // When it is submitted and the hook owns the navigation
            await submit(buildSplitParams(), true);

            // Then the draft is removed once the transition ends and the chat the split was posted in is opened
            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: true});
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith(REPORT_ID, undefined, false);
        });

        it('only removes the draft when shouldHandleNavigation=false, because the orchestrator already navigated', async () => {
            // Given a split started from an existing chat

            // When it is submitted after the orchestrator navigated away
            await submit(buildSplitParams(), false);

            // Then only the draft is removed
            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]});
            expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
        });

        it('threads the pre-generated optimistic chat ID into splitBillAndOpenReport and dismisses to that same report', async () => {
            // Given a split from global create with no existing chat, so the UI mints the ID the action builds the chat under
            mockResolveOptimisticSplitChatReportID.mockReturnValue({optimisticSplitChatReportID: 'optimistic-split-chat', chatReportID: 'optimistic-split-chat'});

            // When it is submitted
            await submit(buildSplitParams({isFromGlobalCreate: true}), true);

            // Then the action and the navigation use the same chat ID
            expect(mockSplitBillAction).not.toHaveBeenCalled();
            expect(mockSplitBillAndOpenReportAction).toHaveBeenCalledWith(expect.objectContaining({optimisticSplitChatReportID: 'optimistic-split-chat'}));
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith('optimistic-split-chat', undefined, false);
        });

        it('dismisses to the existing chat when one already resolves, leaving the optimistic ID undefined', async () => {
            // Given a split from global create to a group that already has a chat
            mockResolveOptimisticSplitChatReportID.mockReturnValue({optimisticSplitChatReportID: undefined, chatReportID: 'existing-group-chat'});

            // When it is submitted
            await submit(buildSplitParams({isFromGlobalCreate: true}), true);

            // Then no new chat is built and the existing one is opened
            expect(mockSplitBillAndOpenReportAction).toHaveBeenCalledWith(expect.objectContaining({optimisticSplitChatReportID: undefined}));
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith('existing-group-chat', undefined, false);
        });
    });

    describe('pending Search signal', () => {
        it('raises the pending Search signal before splitBill when the split lands back on Search', async () => {
            // Given a split submitted from the Search screen
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

            // When it is submitted
            await submit(buildSplitParams(), false);

            // Then Search is told a write is coming before the write is built, since the write barrier reads the signal at that point
            expect(mockMarkPendingSearchWrite).toHaveBeenCalledTimes(1);
            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
            expect(mockMarkPendingSearchWrite.mock.invocationCallOrder.at(0)).toBeLessThan(mockSplitBillAction.mock.invocationCallOrder.at(0) ?? 0);
        });

        it('raises the pending Search signal before splitBillAndOpenReport when the split lands back on Search', async () => {
            // Given a global create split submitted while Search is the topmost screen
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

            // When it is submitted
            await submit(buildSplitParams({isFromGlobalCreate: true}), false);

            // Then Search is told a write is coming before the write is built, since the write barrier reads the signal at that point
            expect(mockMarkPendingSearchWrite).toHaveBeenCalledTimes(1);
            expect(mockSplitBillAndOpenReportAction).toHaveBeenCalledTimes(1);
            expect(mockMarkPendingSearchWrite.mock.invocationCallOrder.at(0)).toBeLessThan(mockSplitBillAndOpenReportAction.mock.invocationCallOrder.at(0) ?? 0);
        });

        it('does not raise the pending Search signal when the split is not landing on Search', async () => {
            // Given a split submitted outside of Search

            // When it is submitted
            await submit(buildSplitParams(), false);

            // Then no signal is raised, since nothing on Search waits for this write
            expect(mockMarkPendingSearchWrite).not.toHaveBeenCalled();
            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
        });

        it('does not raise the pending Search signal or run the split when there is no login to submit with, even on Search', async () => {
            // Given a split from Search for a user with no login, which the split branch refuses to write.
            // The signal is raised before that branch, so it has to reuse the same guard or it would leave a signal no write ever clears.
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            const params = buildParams({currentUserPersonalDetails: {accountID: CURRENT_USER_ACCOUNT_ID, login: undefined, email: 'me@test.com'}});

            // When it is submitted
            await submit(params, false);

            // Then neither the signal nor the split runs
            expect(mockMarkPendingSearchWrite).not.toHaveBeenCalled();
            expect(mockSplitBillAction).not.toHaveBeenCalled();
        });
    });

    describe('scan split', () => {
        beforeEach(() => {
            mockResolveOptimisticSplitChatReportID.mockReturnValue({optimisticSplitChatReportID: 'optimistic-scan-chat', chatReportID: 'optimistic-scan-chat'});
        });

        it('threads the optimistic chat ID into the scan split and dismisses to that chat once after the loop', async () => {
            // Given a split with one receipt to a group that has no chat yet
            const params = buildScanSplitParams([buildTransaction()], {[TRANSACTION_ID]: {source: 'file://receipt.jpg'}});

            // When it is submitted
            await submit(params, true);

            // Then the scan is started in the optimistic chat and that chat is opened
            expect(mockStartSplitBillAction).toHaveBeenCalledTimes(1);
            expect(mockStartSplitBillAction).toHaveBeenCalledWith(expect.objectContaining({optimisticSplitChatReportID: 'optimistic-scan-chat', isFirstSplitInBatch: true}));
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith('optimistic-scan-chat', undefined, false);
        });

        it('starts the scan split without dismissing when shouldHandleNavigation=false, because the orchestrator already navigated', async () => {
            // Given a split with one receipt whose destination the orchestrator already revealed, as dismiss-first submits do
            const params = buildScanSplitParams([buildTransaction()], {[TRANSACTION_ID]: {source: 'file://receipt.jpg'}});

            // When it is submitted after the orchestrator navigated away
            await submit(params, false);

            // Then the scan is started without navigating a second time
            expect(mockStartSplitBillAction).toHaveBeenCalledTimes(1);
            expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
        });

        it('falls through to the manual split when a leftover receipt matches no transaction being submitted', async () => {
            // Given a receipt keyed to a transaction that is no longer being submitted, so there is no scan to write
            const params = buildScanSplitParams([buildTransaction()], {[STALE_TRANSACTION_ID]: {source: 'file://receipt.jpg'}});

            // When it is submitted
            await submit(params, true);

            // Then no scan is written, and the submit is not swallowed by the scan branch, which would leave the confirm page stuck
            expect(mockStartSplitBillAction).not.toHaveBeenCalled();
            expect(mockSplitBillAction).toHaveBeenCalledTimes(1);
        });

        it('writes nothing and hands the page back when a scan split has no receipt file ready', async () => {
            // Given a scan with no matching receipt yet. A scan carries no amount until SmartScan returns, so the manual split would write a $0 expense.
            const scannedTransaction = buildTransaction({amount: 0, iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN});
            const params = buildScanSplitParams([scannedTransaction], {[STALE_TRANSACTION_ID]: {source: 'file://receipt.jpg'}});

            // When it is submitted
            await submit(params, true);

            // Then nothing is written and the submit lock is released, so the next tap works once the receipt map catches up
            expect(mockStartSplitBillAction).not.toHaveBeenCalled();
            expect(mockSplitBillAction).not.toHaveBeenCalled();
            expect(mockReleaseSubmitLock).toHaveBeenCalledTimes(1);
        });

        it('resolves the chat once and dismisses once when multiple receipts split into one group chat', async () => {
            // Given two receipts split with a group that has no chat yet
            const firstSplit = buildTransaction({transactionID: 'transaction-1'});
            const secondSplit = buildTransaction({transactionID: 'transaction-2'});
            const params = buildScanSplitParams([firstSplit, secondSplit], {
                [firstSplit.transactionID]: {source: 'file://receipt-1.jpg'},
                [secondSplit.transactionID]: {source: 'file://receipt-2.jpg'},
            });

            // When they are submitted
            await submit(params, true);

            // Then both scans land in the same chat, only the first one creates it, and the chat is opened once
            expect(mockResolveOptimisticSplitChatReportID).toHaveBeenCalledTimes(1);
            expect(mockStartSplitBillAction).toHaveBeenCalledTimes(2);
            expect(mockStartSplitBillAction).toHaveBeenNthCalledWith(1, expect.objectContaining({optimisticSplitChatReportID: 'optimistic-scan-chat', isFirstSplitInBatch: true}));
            expect(mockStartSplitBillAction).toHaveBeenNthCalledWith(2, expect.objectContaining({optimisticSplitChatReportID: 'optimistic-scan-chat', isFirstSplitInBatch: false}));
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledTimes(1);
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith('optimistic-scan-chat', undefined, false);
        });

        it('marks every scan as first when the batch splits into a chat that already exists', async () => {
            // Given two receipts split into a chat that already exists, so no scan in the batch creates it
            mockResolveOptimisticSplitChatReportID.mockReturnValue({optimisticSplitChatReportID: undefined, chatReportID: REPORT_ID});
            const firstSplit = buildTransaction({transactionID: 'transaction-1'});
            const secondSplit = buildTransaction({transactionID: 'transaction-2'});
            const params = buildScanSplitParams([firstSplit, secondSplit], {
                [firstSplit.transactionID]: {source: 'file://receipt-1.jpg'},
                [secondSplit.transactionID]: {source: 'file://receipt-2.jpg'},
            });

            // When they are submitted
            await submit(params, true);

            // Then each scan is treated as the first one
            expect(mockStartSplitBillAction).toHaveBeenCalledTimes(2);
            expect(mockStartSplitBillAction).toHaveBeenNthCalledWith(1, expect.objectContaining({isFirstSplitInBatch: true}));
            expect(mockStartSplitBillAction).toHaveBeenNthCalledWith(2, expect.objectContaining({isFirstSplitInBatch: true}));
        });
    });
});
