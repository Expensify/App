import type {OnyxEntry} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTransactionFromMergeTransaction} from '@libs/MergeTransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

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
    const searchContext = useSearchContext();
    const searchHash = searchContext?.currentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`, {canBeMissing: true});

    const [onyxTargetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(mergeTransaction?.targetTransactionID)}`, {
        canBeMissing: true,
    });
    const [onyxSourceTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(mergeTransaction?.sourceTransactionID)}`, {
        canBeMissing: true,
    });

    const targetTransaction = getTransaction(mergeTransaction, mergeTransaction?.targetTransactionID, onyxTargetTransaction, currentSearchResults);
    const sourceTransaction = getTransaction(mergeTransaction, mergeTransaction?.sourceTransactionID, onyxSourceTransaction, currentSearchResults);

    let [targetTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(targetTransaction?.reportID)}`, {
        canBeMissing: true,
    });
    let [sourceTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(sourceTransaction?.reportID)}`, {
        canBeMissing: true,
    });
    let [targetTransactionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(targetTransactionReport?.policyID)}`, {
        canBeMissing: true,
    });
    let [sourceTransactionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(sourceTransactionReport?.policyID)}`, {
        canBeMissing: true,
    });

    if (searchHash && currentSearchResults?.data) {
        // If we're on search and main collection reports are not available, get them from the search snapshot
        targetTransactionReport = targetTransactionReport ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${targetTransaction?.reportID}`];
        sourceTransactionReport = sourceTransactionReport ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${sourceTransaction?.reportID}`];
        // If we're on search, search snapshot policies are more up to date
        targetTransactionPolicy = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.POLICY}${targetTransactionReport?.policyID}`];
        sourceTransactionPolicy = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.POLICY}${sourceTransactionReport?.policyID}`];
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
