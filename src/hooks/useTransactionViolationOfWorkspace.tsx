import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {extractCollectionItemID} from '@libs/CollectionUtils';
import {isChatRoom, isPolicyExpenseChat, isPolicyRelatedReport, isTaskReport} from '@libs/ReportUtils';
import type {OnyxCollectionKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import {transactionsByReportIDSelector} from '@src/selectors/Transaction';
import type {Report, TransactionViolations} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useTransactionViolationOfWorkspace(policyID?: string) {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [transactionsByReportID] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: transactionsByReportIDSelector});
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

    // `transactionIDSet` is rebuilt fresh on every render, so key the memoized selector on its
    // contents (a stable, order-independent string) rather than the Set reference — otherwise the
    // selector identity changes each render and defeats useOnyx's memoization, re-subscribing
    // endlessly under the store-based engine.
    const transactionIDsKey = Array.from(transactionIDSet).sort().join(',');
    const transactionViolationSelector = useCallback(
        (violations: OnyxCollection<TransactionViolations>) => {
            if (!violations) {
                return {};
            }

            const filteredViolationKeys = Object.keys(violations).filter((violationKey) => {
                const transactionID = extractCollectionItemID(violationKey as `${OnyxCollectionKey}${string}`);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [transactionIDsKey],
    );

    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: transactionViolationSelector,
    });

    return {
        reportsToArchive,
        transactionViolations,
    };
}

export default useTransactionViolationOfWorkspace;
