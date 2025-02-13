import {useOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {reportTransactionsSelector} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';

function useReportWithTransactionsAndViolations(reportID?: string): [OnyxEntry<Report>, Transaction[], OnyxCollection<TransactionViolation[]>] {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID ?? '-1'}`);
    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => reportTransactionsSelector(_transactions, reportID),
    });
    const [violations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: (allViolations) =>
            Object.fromEntries(
                Object.entries(allViolations ?? {}).filter(([key]) =>
                    transactions.some((transaction) => transaction.transactionID === key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '')),
                ),
            ),
    });
    return [report, transactions, violations];
}

export default useReportWithTransactionsAndViolations;
