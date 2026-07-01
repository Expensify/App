import {renderHook} from '@testing-library/react-native';
import type {OnyxKey, ResultMetadata, UseOnyxResult} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useTransactionThreadReportID from '@hooks/useTransactionThreadReportID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/usePaginatedReportActions', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useReportTransactionsCollection', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockUseOnyx = jest.mocked(useOnyx);
const mockUsePaginatedReportActions = jest.mocked(usePaginatedReportActions);
const mockUseReportTransactionsCollection = jest.mocked(useReportTransactionsCollection);

const MONEY_REPORT_ID = 'money-report-test-1';
const CHAT_REPORT_ID = 'chat-report-test-1';
const THREAD_REPORT_ID = 'thread-report-test-1';

function collectionReportKey(reportId: string | undefined): string {
    return `${ONYXKEYS.COLLECTION.REPORT}${reportId}`;
}

function makeExpenseReportWithChat(overrides: Partial<Report> = {}): Report {
    return {
        reportID: MONEY_REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        chatReportID: CHAT_REPORT_ID,
        ...overrides,
    } as Report;
}

function makeDMChatReport(): Report {
    return {
        reportID: CHAT_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
    } as Report;
}

function makeIOUCreatedAction(extra: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: 'iou-created-1',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: 1,
        created: '2024-01-01 10:00:00.000',
        // Non-empty html so legacy deleted-comment detection in isDeletedAction does not treat this as deleted.
        message: [{type: 'TEXT', html: '<muted-text>n</muted-text>', text: 'n', isEdited: false, isDeletedParentAction: false}],
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            IOUTransactionID: 'txn-1',
        },
        ...extra,
    } as ReportAction;
}

function makeSentMoneyPayAction(extra: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: 'iou-pay-1',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: 2,
        created: '2024-01-01 09:00:00.000',
        message: [{type: 'TEXT', html: '<muted-text>s</muted-text>', text: 's', isEdited: false, isDeletedParentAction: false}],
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            IOUDetails: {amount: 50, currency: 'USD'},
        },
        childReportID: THREAD_REPORT_ID,
        ...extra,
    } as ReportAction;
}

const loadedReportMetadata: ResultMetadata<Report> = {status: 'loaded'};

function asReportOnyxResult(report: Report | undefined): UseOnyxResult<Report> {
    return [report, loadedReportMetadata];
}

function wireReportOnyx(moneyReport: Report | undefined, chatReport: Report | undefined, hookReportID: string | undefined): void {
    mockUseOnyx.mockImplementation((key: OnyxKey) => {
        const moneyReportKey = collectionReportKey(hookReportID);
        if (key === moneyReportKey) {
            return asReportOnyxResult(moneyReport);
        }
        const linkedChatReportID = moneyReport?.chatReportID;
        if (linkedChatReportID !== undefined && linkedChatReportID !== '' && key === collectionReportKey(linkedChatReportID)) {
            return asReportOnyxResult(chatReport);
        }

        return asReportOnyxResult(undefined);
    });
}

/**
 * Mirrors `DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS[*].transactions` — keyed by transaction id string.
 */
function transactionsRecordForReport(transactionsInput: Transaction[]): Record<string, Transaction> {
    return Object.fromEntries(transactionsInput.filter(Boolean).map((t) => [t.transactionID, t]));
}

describe('useTransactionThreadReportID', () => {
    beforeEach(() => {
        mockUseOnyx.mockReset();
        mockUsePaginatedReportActions.mockReset();
        mockUseReportTransactionsCollection.mockReset();

        mockUsePaginatedReportActions.mockReturnValue({
            reportActions: [],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: undefined,
            hasOlderActions: false,
            hasNewerActions: false,
            report: undefined,
        });
        mockUseReportTransactionsCollection.mockReturnValue({});
    });

    it('returns empty derived values when reportID is undefined', () => {
        wireReportOnyx(undefined, undefined, undefined);

        const {result} = renderHook(() => useTransactionThreadReportID(undefined));

        expect(result.current.transactionThreadReportID).toBeUndefined();
        expect(result.current.effectiveTransactionThreadReportID).toBeUndefined();
        expect(result.current.reportActions).toEqual([]);
    });

    it('returns undefined thread ids when the report is not an IOU, expense, or invoice report', () => {
        const chatLikeReport = {...makeExpenseReportWithChat(), type: CONST.REPORT.TYPE.CHAT} as Report;

        wireReportOnyx(chatLikeReport, makeDMChatReport(), MONEY_REPORT_ID);
        const iouCreate = makeIOUCreatedAction({childReportID: THREAD_REPORT_ID});
        mockUsePaginatedReportActions.mockReturnValue({
            reportActions: [iouCreate],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: [iouCreate],
            hasOlderActions: false,
            hasNewerActions: false,
            report: chatLikeReport,
        });
        mockUseReportTransactionsCollection.mockReturnValue(
            transactionsRecordForReport([
                {
                    transactionID: 'txn-1',
                    reportID: MONEY_REPORT_ID,
                } as Transaction,
            ]),
        );

        const {result} = renderHook(() => useTransactionThreadReportID(MONEY_REPORT_ID));

        expect(result.current.transactionThreadReportID).toBeUndefined();
        expect(result.current.effectiveTransactionThreadReportID).toBeUndefined();
    });

    it('returns childReportID when exactly one qualifying IOU CREATE exists and visible transactions resolve to one id', () => {
        const moneyReport = makeExpenseReportWithChat();

        wireReportOnyx(moneyReport, makeDMChatReport(), MONEY_REPORT_ID);
        const iouCreate = makeIOUCreatedAction({childReportID: THREAD_REPORT_ID});
        mockUsePaginatedReportActions.mockReturnValue({
            reportActions: [iouCreate],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: [iouCreate],
            hasOlderActions: false,
            hasNewerActions: false,
            report: moneyReport,
        });
        mockUseReportTransactionsCollection.mockReturnValue(
            transactionsRecordForReport([
                {
                    transactionID: 'txn-1',
                    reportID: MONEY_REPORT_ID,
                } as Transaction,
            ]),
        );

        const {result} = renderHook(() => useTransactionThreadReportID(MONEY_REPORT_ID));

        expect(result.current.transactionThreadReportID).toBe(THREAD_REPORT_ID);
        expect(result.current.effectiveTransactionThreadReportID).toBe(THREAD_REPORT_ID);
        expect(result.current.reportActions?.map((a) => a.reportActionID)).toEqual(['iou-created-1']);
    });

    it('uses CONST.FAKE_REPORT_ID when no childReportID is set on the lone IOU request action', () => {
        const moneyReport = makeExpenseReportWithChat();

        wireReportOnyx(moneyReport, makeDMChatReport(), MONEY_REPORT_ID);
        const iouCreate = makeIOUCreatedAction({});
        mockUsePaginatedReportActions.mockReturnValue({
            reportActions: [iouCreate],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: [iouCreate],
            hasOlderActions: false,
            hasNewerActions: false,
            report: moneyReport,
        });
        mockUseReportTransactionsCollection.mockReturnValue(
            transactionsRecordForReport([
                {
                    transactionID: 'txn-1',
                    reportID: MONEY_REPORT_ID,
                } as Transaction,
            ]),
        );

        const {result} = renderHook(() => useTransactionThreadReportID(MONEY_REPORT_ID));

        expect(result.current.transactionThreadReportID).toBe(CONST.FAKE_REPORT_ID);
        expect(result.current.effectiveTransactionThreadReportID).toBe(CONST.FAKE_REPORT_ID);
    });

    it('returns undefined when more than one visible transaction is associated with the report', () => {
        const moneyReport = makeExpenseReportWithChat();

        wireReportOnyx(moneyReport, makeDMChatReport(), MONEY_REPORT_ID);
        const iouCreate = makeIOUCreatedAction({childReportID: THREAD_REPORT_ID});
        mockUsePaginatedReportActions.mockReturnValue({
            reportActions: [iouCreate],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: [iouCreate],
            hasOlderActions: false,
            hasNewerActions: false,
            report: moneyReport,
        });
        mockUseReportTransactionsCollection.mockReturnValue(
            transactionsRecordForReport([{transactionID: 'txn-1', reportID: MONEY_REPORT_ID} as Transaction, {transactionID: 'txn-2', reportID: MONEY_REPORT_ID} as Transaction]),
        );

        const {result} = renderHook(() => useTransactionThreadReportID(MONEY_REPORT_ID));

        expect(result.current.transactionThreadReportID).toBeUndefined();
        expect(result.current.effectiveTransactionThreadReportID).toBeUndefined();
    });

    it('forces effectiveTransactionThreadReportID to undefined while keeping the derived id when a sent-money IOU PAY is present', () => {
        const moneyReport = makeExpenseReportWithChat({type: CONST.REPORT.TYPE.IOU});
        const chatReport = makeDMChatReport();
        const payAction = makeSentMoneyPayAction();

        wireReportOnyx(moneyReport, chatReport, MONEY_REPORT_ID);
        mockUsePaginatedReportActions.mockReturnValue({
            reportActions: [payAction],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: [payAction],
            hasOlderActions: false,
            hasNewerActions: false,
            report: moneyReport,
        });
        mockUseReportTransactionsCollection.mockReturnValue({});

        const {result} = renderHook(() => useTransactionThreadReportID(MONEY_REPORT_ID));

        expect(result.current.transactionThreadReportID).toBe(THREAD_REPORT_ID);
        expect(result.current.effectiveTransactionThreadReportID).toBeUndefined();
    });
});
