import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {findSelfDMReportID} from '@libs/ReportUtils';
import {isDeletedTransaction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * Resolve the REPORT subset that `changeTransactionsReport` looks up — keyed like the full collection so the action
 * can do `reports?.[\`${KEY}${id}\`]`. Includes:
 * - the unreported-report sentinel, looked up for transactions moving out of personal space
 * - the self-DM report, if one exists
 * - the destination report (`newReportID`)
 * - each transaction's current report
 * - for non-deleted transactions, the old IOU action's transaction-thread report (`childReportID`)
 */
function useChangeTransactionsReportReports(transactions: Transaction[], newReportID: string | undefined): OnyxCollection<Report> {
    const ids = new Set<string>();
    ids.add(CONST.REPORT.UNREPORTED_REPORT_ID);
    const selfDMReportID = findSelfDMReportID();
    if (selfDMReportID) {
        ids.add(selfDMReportID);
    }
    if (newReportID) {
        ids.add(newReportID);
    }
    for (const transaction of transactions) {
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
