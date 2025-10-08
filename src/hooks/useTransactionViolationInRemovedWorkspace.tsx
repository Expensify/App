import {getReportTransactions, isChatRoom, isPolicyExpenseChat, isPolicyRelatedReport, isTaskReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useTransactionViolationInRemovedWorkspace(policyID?: string) {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const reportsToArchive = Object.values(allReports ?? {}).filter(
        (report): report is Report => report != null && isPolicyRelatedReport(report, policyID) && (isChatRoom(report) || isPolicyExpenseChat(report) || isTaskReport(report)),
    );
    const transactionIDSet = new Set<string>();
    reportsToArchive.forEach((report) => {
        if (!report?.iouReportID) {
            return;
        }
        const reportTransactions = getReportTransactions(report.iouReportID);
        for (const transaction of reportTransactions) {
            transactionIDSet.add(transaction.transactionID);
        }
    });
    const [transactionViolations] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        {
            selector: (violations) => {
                if (!violations) {
                    return {};
                }

                const filteredViolationKeys = Object.keys(violations).filter((violationKey) => {
                    const transactionID = violationKey.slice(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS.length);
                    return transactionIDSet.has(transactionID);
                });

                const filteredViolations = filteredViolationKeys.reduce(
                    (acc, key) => {
                        acc[key] = violations[key];
                        return acc;
                    },
                    {} as typeof violations,
                );

                return filteredViolations;
            },
            canBeMissing: true,
        },
        [transactionIDSet],
    );

    return {
        reportsToArchive,
        transactionViolations,
    };
}

export default useTransactionViolationInRemovedWorkspace;
