import performPostBatchCleanup from '@pages/iou/request/step/confirmation/submission/utils/performPostBatchCleanup';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';

import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';

const mockCleanupAfterExpenseCreate = jest.fn();
const mockCleanupAndNavigateAfterExpenseCreate = jest.fn();
const mockResolveChatTargetForSubmitCleanup = jest.fn();

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockCleanupAfterExpenseCreate(...args) as unknown,
}));

jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockCleanupAndNavigateAfterExpenseCreate(...args) as unknown,
}));

jest.mock('@pages/iou/request/step/resolveChatTarget', () => ({
    resolveChatTargetForSubmitCleanup: (...args: unknown[]) => mockResolveChatTargetForSubmitCleanup(...args) as unknown,
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const PARTICIPANT_REPORT_ID = 'participantReport';
const RESOLVED_CHAT_REPORT_ID = 'resolvedChat';
const FALLBACK_CHAT_REPORT_ID = 'fallbackChat';
const LAST_OPTIMISTIC_TRANSACTION_ID = 'optimistic2';
const TRACKED_TRANSACTION_ID = 'tracked1';
const DRAFT_TRANSACTION_IDS = ['1', '2'];

const REPORT: Report = {reportID: 'currentReport'};
const RESOLVED_REPORT: Report = {reportID: RESOLVED_CHAT_REPORT_ID};
const PARTICIPANT_REPORT_DRAFT: Report = {reportID: PARTICIPANT_REPORT_ID, reportName: 'Draft'};
const PARTICIPANT: Participant = {accountID: 2, reportID: PARTICIPANT_REPORT_ID};

const LINKED_TRACKED_EXPENSE_ACTION = createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>({
    reportActionID: 'trackedAction1',
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '',
    originalMessage: {
        IOUTransactionID: TRACKED_TRANSACTION_ID,
        type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
    },
});

function buildTransaction(index: number, overrides: Partial<Transaction> = {}): Transaction {
    return {...createRandomTransaction(index), isFromGlobalCreate: false, linkedTrackedExpenseReportAction: undefined, ...overrides};
}

type Params = Parameters<typeof performPostBatchCleanup>[0];

function buildParams(overrides: Partial<Params> = {}): Params {
    return {
        transactions: [buildTransaction(1), buildTransaction(2, {isFromGlobalCreate: true})],
        report: REPORT,
        reportDrafts: {[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${PARTICIPANT_REPORT_ID}`]: PARTICIPANT_REPORT_DRAFT},
        action: CONST.IOU.ACTION.CREATE,
        draftTransactionIDs: DRAFT_TRANSACTION_IDS,
        currentUserPersonalDetails: {accountID: CURRENT_USER_ACCOUNT_ID, login: 'me@test.com', email: 'me@test.com'},
        isLookingAroundUser: false,
        isSelfDMDestination: false,
        participant: PARTICIPANT,
        shouldHandleNavigation: true,
        allTransactionsCreated: true,
        fallbackOptimisticChatReportID: FALLBACK_CHAT_REPORT_ID,
        navigateBackToReport: undefined,
        lastOptimisticTransactionID: LAST_OPTIMISTIC_TRANSACTION_ID,
        ...overrides,
    };
}

describe('performPostBatchCleanup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockResolveChatTargetForSubmitCleanup.mockReturnValue({report: RESOLVED_REPORT, chatReportID: RESOLVED_CHAT_REPORT_ID});
    });

    it('does nothing when the batch stopped before every expense was created', () => {
        // Given a batch where an expense failed to be written
        const params = buildParams({allTransactionsCreated: false});

        // When the post-batch cleanup runs
        performPostBatchCleanup(params);

        // Then neither cleanup nor navigation runs, so the drafts stay around for a retry
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
        expect(mockResolveChatTargetForSubmitCleanup).not.toHaveBeenCalled();
    });

    it('only cleans up the drafts when navigation is handled elsewhere', () => {
        // Given a completed batch whose caller handles navigation itself
        const params = buildParams({shouldHandleNavigation: false});

        // When the post-batch cleanup runs
        performPostBatchCleanup(params);

        // Then the drafts are cleaned up without resolving a chat or navigating
        expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: DRAFT_TRANSACTION_IDS, linkedTrackedExpenseReportAction: undefined});
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
        expect(mockResolveChatTargetForSubmitCleanup).not.toHaveBeenCalled();
    });

    it('resolves the chat target and navigates to it using the last expense of the batch', () => {
        // Given a completed batch of two expenses where only the last one was started from global create
        const params = buildParams({navigateBackToReport: 'backToReport'});

        // When the post-batch cleanup runs
        performPostBatchCleanup(params);

        // Then the chat target is resolved with the participant's report draft
        expect(mockResolveChatTargetForSubmitCleanup).toHaveBeenCalledWith({
            participant: PARTICIPANT,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report: REPORT,
            fallbackOptimisticChatReportID: FALLBACK_CHAT_REPORT_ID,
            action: CONST.IOU.ACTION.CREATE,
            participantReportDraft: PARTICIPANT_REPORT_DRAFT,
        });

        // And navigation goes to that chat, with the global create flag taken from the last expense and the last optimistic transaction ID
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith({
            report: RESOLVED_REPORT,
            action: CONST.IOU.ACTION.CREATE,
            draftTransactionIDs: DRAFT_TRANSACTION_IDS,
            transactionID: LAST_OPTIMISTIC_TRANSACTION_ID,
            isFromGlobalCreate: true,
            backToReport: 'backToReport',
            optimisticChatReportID: RESOLVED_CHAT_REPORT_ID,
            linkedTrackedExpenseReportAction: undefined,
            isLookingAroundUser: false,
            isSelfDMDestination: false,
        });
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
    });

    it('navigates to the chat the caller already wrote to without resolving it again', () => {
        // Given a completed batch where the caller passes the chat it wrote the expense to
        const preResolvedReport: Report = {reportID: 'preResolvedChat'};
        const params = buildParams({preResolvedChatTarget: {report: preResolvedReport, chatReportID: 'preResolvedChat'}});

        // When the post-batch cleanup runs
        performPostBatchCleanup(params);

        // Then that chat is used as is, so navigation lands where the expense was actually written
        expect(mockResolveChatTargetForSubmitCleanup).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({report: preResolvedReport, optimisticChatReportID: 'preResolvedChat'}));
    });

    it('navigates to the tracked transaction when a tracked expense is moved', () => {
        // Given a completed batch where a plain expense is followed by a tracked expense being moved
        const params = buildParams({
            action: CONST.IOU.ACTION.SUBMIT,
            transactions: [buildTransaction(1), buildTransaction(2, {linkedTrackedExpenseReportAction: LINKED_TRACKED_EXPENSE_ACTION})],
        });

        // When the post-batch cleanup runs
        performPostBatchCleanup(params);

        // Then navigation uses the tracked transaction's ID, since moving a tracked expense reuses it instead of the optimistic one
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(
            expect.objectContaining({transactionID: TRACKED_TRANSACTION_ID, linkedTrackedExpenseReportAction: LINKED_TRACKED_EXPENSE_ACTION}),
        );
    });
});
