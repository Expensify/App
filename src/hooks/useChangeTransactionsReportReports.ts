import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {findSelfDMReportID} from '@libs/ReportUtils';
import {isDeletedTransaction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * Resolve the REPORT subset that `changeTransactionsReport` looks up — keyed like the full collection so the action
 * can do `reports?.[\`${KEY}${id}\`]`. Includes:
 * - the self-DM report, if one exists
 * - the destination report (`newReport`)
 * - each transaction's current report
 * - for non-deleted transactions, the old IOU action's transaction-thread report (`childReportID`) and its own
 *   report-action ID (the latter is used as a REPORT key fallback for that thread's `policyID` in `Transaction.ts`)
 */
function useChangeTransactionsReportReports(transactionIDs: string[], allTransactions: OnyxCollection<Transaction>, newReport: OnyxEntry<Report>): OnyxCollection<Report> {
    const newReportID = newReport?.reportID;

    const ids = new Set<string>();
    const selfDMReportID = findSelfDMReportID();
    if (selfDMReportID) {
        ids.add(selfDMReportID);
    }
    if (newReportID) {
        ids.add(newReportID);
    }
    for (const transactionID of transactionIDs) {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            continue;
        }
        if (transaction.reportID) {
            ids.add(transaction.reportID);
        }
        if (isDeletedTransaction(transaction)) {
            continue;
        }
        const isUnreportedExpense = !transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        const source = isUnreportedExpense ? selfDMReportID : transaction.reportID;
        if (!source) {
            continue;
        }
        const iouAction = getIOUActionForReportID(source, transaction.transactionID);
        if (iouAction?.childReportID) {
            ids.add(iouAction.childReportID);
        }
        if (iouAction?.reportActionID) {
            ids.add(iouAction.reportActionID);
        }
    }
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (allReports) => {
            const result: Record<string, Report | undefined> = {};
            for (const id of ids) {
                const key = `${ONYXKEYS.COLLECTION.REPORT}${id}` as const;
                const report = allReports?.[key];
                if (report) {
                    result[key] = report;
                }
            }
            return result as OnyxCollection<Report>;
        },
    });
    return reports;
}

export default useChangeTransactionsReportReports;
