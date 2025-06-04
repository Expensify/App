import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';
import useOnyx from './useOnyx';

const DEFAULT_VIOLATIONS: Record<string, TransactionViolation[]> = {};

function useReportTransactionViolations(reportID?: string, reportTransactions?: Transaction[]): [OnyxEntry<Report>, OnyxCollection<TransactionViolation[]>] {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const [violations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: (allViolations) =>
            Object.fromEntries(
                Object.entries(allViolations ?? {}).filter(([key]) =>
                    reportTransactions?.some((transaction) => transaction.transactionID === key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '')),
                ),
            ),
    });
    return [report, violations ?? DEFAULT_VIOLATIONS];
}

export default useReportTransactionViolations;
