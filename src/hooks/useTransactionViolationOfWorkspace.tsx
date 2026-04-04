import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {extractCollectionItemID} from '@libs/CollectionUtils';
import {isChatRoom, isPolicyExpenseChat, isPolicyRelatedReport, isTaskReport} from '@libs/ReportUtils';
import type {OnyxCollectionKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolations} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useTransactionViolationOfWorkspace(policyID?: string) {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const reportsToArchive = Object.values(allReports ?? {}).filter(
        (report): report is Report => report != null && isPolicyRelatedReport(report, policyID) && (isChatRoom(report) || isPolicyExpenseChat(report) || isTaskReport(report)),
    );
    const iouReportIDs = useMemo(() => {
        const ids = new Set<string>();
        for (const report of reportsToArchive) {
            if (report?.iouReportID) {
                ids.add(report.iouReportID);
            }
        }
        return ids;
    }, [reportsToArchive]);
    const transactionIDSet = useMemo(() => {
        const ids = new Set<string>();
        for (const transaction of Object.values(allTransactions ?? {}) as Transaction[]) {
            if (transaction?.reportID && iouReportIDs.has(transaction.reportID)) {
                ids.add(transaction.transactionID);
            }
        }
        return ids;
    }, [allTransactions, iouReportIDs]);

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
        [transactionIDSet],
    );

    const [transactionViolations] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        {
            selector: transactionViolationSelector,
        },
        [transactionIDSet],
    );

    return {
        reportsToArchive,
        transactionViolations,
    };
}

export default useTransactionViolationOfWorkspace;
