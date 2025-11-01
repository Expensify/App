import useOnyx from '@hooks/useOnyx';
import {getSourceTransactionFromMergeTransaction, getTargetTransactionFromMergeTransaction} from '@libs/MergeTransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Transaction} from '@src/types/onyx';

type UseMergeTransactionsProps = {
    mergeTransaction?: MergeTransaction;
    hash?: number;
};

type UseMergeTransactionsReturn = {
    targetTransaction?: Transaction;
    sourceTransaction?: Transaction;
};

function useMergeTransactions({mergeTransaction, hash}: UseMergeTransactionsProps): UseMergeTransactionsReturn {
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});

    const [onyxTargetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`, {
        canBeMissing: true,
    });
    const [onyxSourceTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`, {
        canBeMissing: true,
    });

    let targetTransaction;
    let sourceTransaction;

    // Always use transactions from the search snapshot if we're coming from the Reports page
    if (hash) {
        targetTransaction = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`];
        sourceTransaction = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`];
    } else {
        targetTransaction = getTargetTransactionFromMergeTransaction(mergeTransaction) ?? onyxTargetTransaction;
        sourceTransaction = getSourceTransactionFromMergeTransaction(mergeTransaction) ?? onyxSourceTransaction;
    }

    return {
        targetTransaction,
        sourceTransaction,
    };
}

export default useMergeTransactions;
