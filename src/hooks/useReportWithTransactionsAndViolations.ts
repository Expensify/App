import type {OnyxCollection} from 'react-native-onyx';
import {reportTransactionsSelector} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation} from '@src/types/onyx';
import useOnyx from './useOnyx';

const DEFAULT_TRANSACTIONS: Transaction[] = [];
const DEFAULT_VIOLATIONS: Record<string, TransactionViolation[]> = {};

function useReportWithTransactionsAndViolations(reportID?: string): [Transaction[], OnyxCollection<TransactionViolation[]>] {
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => reportTransactionsSelector(_transactions, reportID),
        canBeMissing: true,
    });
    const [violations] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        {
            selector: (allViolations) =>
                Object.fromEntries(
                    Object.entries(allViolations ?? {}).filter(([key]) =>
                        transactions?.some((transaction) => transaction.transactionID === key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '')),
                    ),
                ),
            canBeMissing: true,
        },
        [transactions],
    );
    return [transactions ?? DEFAULT_TRANSACTIONS, violations ?? DEFAULT_VIOLATIONS];
}

export default useReportWithTransactionsAndViolations;
