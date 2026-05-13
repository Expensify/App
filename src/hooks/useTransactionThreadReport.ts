import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getOneTransactionThreadReportID, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useReportTransactionsCollection from './useReportTransactionsCollection';

type UseTransactionThreadReportOptions = {
    /** When set, used instead of {@link useReportTransactionsCollection}(reportID). */
    transactionsCollection?: OnyxCollection<Transaction>;
    /** Forwarded to {@link getAllNonDeletedTransactions}; expense report UIs typically use `true`. */
    includeOrphanedTransactions?: boolean;
};

/**
 * Derives the single-transaction thread report for a money request report using filtered actions and transaction IDs.
 * Does not subscribe to report actions — pass {@link useMoneyRequestReportPaginatedFilteredActions}'s `reportActions`,
 * or another filtered list computed the same way (e.g. {@link ReportActionsView}'s `allReportActions`).
 *
 * When `transactionsCollection` is omitted, transactions come from {@link useReportTransactionsCollection}(reportID).
 */
function useTransactionThreadReport(
    reportID: string | undefined,
    reportActions: ReportAction[],
    options?: UseTransactionThreadReportOptions,
): {
    transactionThreadReportID: string | undefined;
    effectiveTransactionThreadReportID: string | undefined;
    transactionThreadReport: OnyxEntry<Report>;
} {
    const {isOffline} = useNetwork();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);

    const collectionFromHook = useReportTransactionsCollection(reportID);
    const allReportTransactions = options?.transactionsCollection ?? collectionFromHook;
    const includeOrphanedTransactions = options?.includeOrphanedTransactions ?? true;

    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, includeOrphanedTransactions);
    const visibleTransactions = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);

    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const isSentMoneyReport = reportActions.some((action) => isSentMoneyReportAction(action));
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);

    return {
        transactionThreadReportID,
        effectiveTransactionThreadReportID,
        transactionThreadReport,
    };
}

export default useTransactionThreadReport;
export type {UseTransactionThreadReportOptions};
