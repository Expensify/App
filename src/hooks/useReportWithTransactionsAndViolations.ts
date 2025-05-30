import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';
import useOnyx from './useOnyx';

const DEFAULT_TRANSACTIONS: Transaction[] = [];
const DEFAULT_VIOLATIONS: Record<string, TransactionViolation[]> = {};

function useReportWithTransactionsAndViolations(reportID?: string): [OnyxEntry<Report>, Transaction[], OnyxCollection<TransactionViolation[]>] {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [reportTransactions] = useOnyx(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS, {canBeMissing: true});
    const transactions = reportTransactions?.[reportID ?? CONST.DEFAULT_NUMBER_ID];
    const [violations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: (allViolations) => {
            if (!transactions?.length) {
                return {};
            }

            const transactionIDs = new Set(transactions.map((t) => t.transactionID));
            return Object.fromEntries(Object.entries(allViolations ?? {}).filter(([key]) => transactionIDs.has(key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ''))));
        },
    });
    return [report, transactions ?? DEFAULT_TRANSACTIONS, violations ?? DEFAULT_VIOLATIONS];
}

export default useReportWithTransactionsAndViolations;
