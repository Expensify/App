import type {OnyxEntry} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportIDForExpense, getTransactionFromMergeTransaction} from '@libs/MergeTransactionUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

type UseMergeTransactionsProps = {
    mergeTransaction?: MergeTransaction;
};

type UseMergeTransactionsReturn = {
    targetTransaction?: Transaction;
    sourceTransaction?: Transaction;
    targetTransactionReport?: Report;
    sourceTransactionReport?: Report;
    targetTransactionPolicy?: Policy;
    sourceTransactionPolicy?: Policy;
};

function getTransaction(
    mergeTransaction: MergeTransaction | undefined,
    transactionID: string | undefined,
    onyxTransaction: OnyxEntry<Transaction>,
    currentSearchResults: SearchResults | undefined,
) {
    if (!transactionID) {
        return undefined;
    }

    const transaction = getTransactionFromMergeTransaction(mergeTransaction, transactionID);
    if (transaction) {
        return transaction;
    }

    return currentSearchResults?.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? onyxTransaction;
}

function useMergeTransactions({mergeTransaction}: UseMergeTransactionsProps): UseMergeTransactionsReturn {
    const {currentSearchHash, currentSearchResults} = useSearchContext();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();

    const [onyxTargetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(mergeTransaction?.targetTransactionID)}`, {
        canBeMissing: true,
    });
    const [onyxSourceTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(mergeTransaction?.sourceTransactionID)}`, {
        canBeMissing: true,
    });

    const targetTransaction = getTransaction(mergeTransaction, mergeTransaction?.targetTransactionID, onyxTargetTransaction, currentSearchResults);
    const sourceTransaction = getTransaction(mergeTransaction, mergeTransaction?.sourceTransactionID, onyxSourceTransaction, currentSearchResults);

    const targetTransactionReportID = getReportIDForExpense(targetTransaction);
    const sourceTransactionReportID = getReportIDForExpense(sourceTransaction);
    let [targetTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(targetTransactionReportID)}`, {
        canBeMissing: true,
    });
    let [sourceTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(sourceTransactionReportID)}`, {
        canBeMissing: true,
    });

    const targetTransactionPolicyID = isExpenseUnreported(targetTransaction) ? policyForMovingExpensesID : targetTransactionReport?.policyID;
    const sourceTransactionPolicyID = isExpenseUnreported(sourceTransaction) ? policyForMovingExpensesID : sourceTransactionReport?.policyID;
    let [targetTransactionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(targetTransactionPolicyID)}`, {
        canBeMissing: true,
    });
    let [sourceTransactionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(sourceTransactionPolicyID)}`, {
        canBeMissing: true,
    });

    if (currentSearchHash && currentSearchResults?.data) {
        // If we're on search and main collection reports are not available, get them from the search snapshot
        targetTransactionReport = targetTransactionReport ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionReportID}`];
        sourceTransactionReport = sourceTransactionReport ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${sourceTransactionReportID}`];
        // If we're on search, search snapshot policies are more up to date
        targetTransactionPolicy = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.POLICY}${targetTransactionPolicyID}`];
        sourceTransactionPolicy = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.POLICY}${sourceTransactionPolicyID}`];
    }

    return {
        targetTransaction,
        sourceTransaction,
        targetTransactionReport,
        sourceTransactionReport,
        targetTransactionPolicy,
        sourceTransactionPolicy,
    };
}

export default useMergeTransactions;
