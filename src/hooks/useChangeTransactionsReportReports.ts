import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {findSelfDMReportID} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

/** Resolve the REPORT subset that `changeTransactionsReport` looks up — keyed like the full collection so the action can do `reports?.[\`${KEY}${id}\`]`. */
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
        const sources = [transaction.reportID, selfDMReportID].filter((id): id is string => !!id);
        for (const source of sources) {
            const iouAction = getIOUActionForReportID(source, transaction.transactionID);
            if (iouAction?.childReportID) {
                ids.add(iouAction.childReportID);
            }
            if (iouAction?.reportActionID) {
                ids.add(iouAction.reportActionID);
            }
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
