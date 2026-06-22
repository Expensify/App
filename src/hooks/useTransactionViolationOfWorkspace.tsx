import type {OnyxCollection} from 'react-native-onyx';
import {extractCollectionItemID} from '@libs/CollectionUtils';
import {isChatRoom, isPolicyExpenseChat, isPolicyRelatedReport, isTaskReport} from '@libs/ReportUtils';
import type {OnyxCollectionKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import {transactionsByReportIDSelector} from '@src/selectors/Transaction';
import type {Report, TransactionViolations} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useStableArrayReference from './useStableArrayReference';

function useTransactionViolationOfWorkspace(policyID?: string) {
    const [allReports, reportsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [transactionsByReportID, transactionsResult] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: transactionsByReportIDSelector});
    const reportsToArchive = Object.values(allReports ?? {}).filter(
        (report): report is Report => report != null && isPolicyRelatedReport(report, policyID) && (isChatRoom(report) || isPolicyExpenseChat(report) || isTaskReport(report)),
    );
    const transactionIDSet = new Set<string>();
    for (const report of reportsToArchive) {
        if (!report?.iouReportID) {
            continue;
        }
        const reportTransactions = transactionsByReportID?.[report.iouReportID] ?? [];
        for (const transaction of reportTransactions) {
            transactionIDSet.add(transaction.transactionID);
        }
    }

    // `transactionIDSet` is rebuilt fresh on every render, so project it to a stable, order-independent
    // ID array and have the selector depend on that — otherwise the selector identity changes each
    // render and defeats useOnyx's memoization, re-subscribing endlessly under the store-based engine.
    const transactionIDList = useStableArrayReference(Array.from(transactionIDSet).sort());

    const [transactionViolations, transactionViolationsResult] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: (violations: OnyxCollection<TransactionViolations>) => {
            if (!violations) {
                return {};
            }

            const eligibleTransactionIDs = new Set(transactionIDList);
            const filteredViolationKeys = Object.keys(violations).filter((violationKey) => {
                const transactionID = extractCollectionItemID(violationKey as `${OnyxCollectionKey}${string}`);
                return eligibleTransactionIDs.has(transactionID);
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
    });

    return {
        reportsToArchive,
        transactionViolations,
        reportsResult,
        transactionsResult,
        transactionViolationsResult,
    };
}

export default useTransactionViolationOfWorkspace;
