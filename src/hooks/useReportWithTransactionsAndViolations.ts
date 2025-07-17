import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

const DEFAULT_TRANSACTIONS: Record<string, Transaction> = {};
const DEFAULT_FILTERED_TRANSACTIONS: Transaction[] = [];
const DEFAULT_VIOLATIONS: Record<string, TransactionViolation[]> = {};

function useReportWithTransactionsAndViolations(reportID?: string): [OnyxEntry<Report>, Transaction[], OnyxCollection<TransactionViolation[]>] {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});

    // It connects to single Onyx instance held in OnyxListItemProvider, so it can be safely used in list items without affecting performance.
    const allReportTransactionsAndViolations = useAllReportsTransactionsAndViolations();
    const {transactions, violations} = allReportTransactionsAndViolations?.[reportID ?? CONST.DEFAULT_NUMBER_ID] ?? {transactions: DEFAULT_TRANSACTIONS, violations: DEFAULT_VIOLATIONS};
    const {isOffline} = useNetwork();
    const filteredTransactions = useMemo(
        () => Object.values(transactions).filter((transaction) => isOffline || transaction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        [transactions, isOffline],
    );

    return [report, filteredTransactions ?? DEFAULT_FILTERED_TRANSACTIONS, violations];
}

export default useReportWithTransactionsAndViolations;
