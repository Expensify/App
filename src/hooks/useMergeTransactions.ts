import type {OnyxEntry} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTransactionFromMergeTransaction} from '@libs/MergeTransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Report, SearchResults, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

type UseMergeTransactionsProps = {
    mergeTransaction?: MergeTransaction;
};

type UseMergeTransactionsReturn = {
    targetTransaction?: Transaction;
    sourceTransaction?: Transaction;
    targetTransactionReport?: Report;
    sourceTransactionReport?: Report;
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

    // If we're on search and main collection reports are not available, get them from the search snapshot
    if (currentSearchHash && currentSearchResults?.data) {
        targetTransactionReport = targetTransactionReport ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${targetTransaction?.reportID}`];
        sourceTransactionReport = sourceTransactionReport ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${sourceTransaction?.reportID}`];
    }

    return {
        targetTransaction,
        sourceTransaction,
        targetTransactionReport,
        sourceTransactionReport,
    };
}

export default useMergeTransactions;
