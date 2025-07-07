import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {reportTransactionsSelector} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

const DEFAULT_TRANSACTIONS: Transaction[] = [];
const DEFAULT_VIOLATIONS: Record<string, TransactionViolation[]> = {};

function useReportWithTransactionsAndViolations(reportID?: string): [OnyxEntry<Report>, Transaction[], OnyxCollection<TransactionViolation[]>] {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => reportTransactionsSelector(_transactions, reportID),
        canBeMissing: true,
    });
    const {isOffline} = useNetwork();
    const filteredTransactions = transactions?.filter((transaction) => isOffline || transaction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const [violations] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        {
            selector: (allViolations) =>
                Object.fromEntries(
                    Object.entries(allViolations ?? {}).filter(([key]) =>
                        filteredTransactions?.some((transaction) => transaction.transactionID === key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '')),
                    ),
                ),
            canBeMissing: true,
        },
        [filteredTransactions],
    );
    return [report, filteredTransactions ?? DEFAULT_TRANSACTIONS, violations ?? DEFAULT_VIOLATIONS];
}

export default useReportWithTransactionsAndViolations;
