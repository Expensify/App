import {useSearchContext} from '@components/Search/SearchContext';
import {getSourceTransactionFromMergeTransaction, getTargetTransactionFromMergeTransaction} from '@libs/MergeTransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, Report, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

type UseMergeTransactionsProps = {
    mergeTransaction?: MergeTransaction;
    hash?: number;
};

type UseMergeTransactionsReturn = {
    targetTransaction?: Transaction;
    sourceTransaction?: Transaction;
    targetTransactionReport?: Report;
    sourceTransactionReport?: Report;
};

function useMergeTransactions({mergeTransaction}: UseMergeTransactionsProps): UseMergeTransactionsReturn {
    // eslint-disable-next-line rulesdir/no-default-id-values
    const searchContext = useSearchContext();
    const searchHash = searchContext?.currentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`, {canBeMissing: true});

    const [onyxTargetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`, {
        canBeMissing: true,
    });
    const [onyxSourceTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`, {
        canBeMissing: true,
    });

    let targetTransaction = getTargetTransactionFromMergeTransaction(mergeTransaction);
    let sourceTransaction = getSourceTransactionFromMergeTransaction(mergeTransaction);
    let targetTransactionReport;
    let sourceTransactionReport;

    // Always use transactions from the search snapshot if we're coming from the Reports page
    if (searchHash) {
        targetTransaction = targetTransaction ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`];
        sourceTransaction = sourceTransaction ?? currentSearchResults?.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`];
        targetTransactionReport = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${targetTransaction?.reportID}`];
        sourceTransactionReport = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${sourceTransaction?.reportID}`];
    } else {
        targetTransaction = targetTransaction ?? onyxTargetTransaction;
        sourceTransaction = sourceTransaction ?? onyxSourceTransaction;
    }

    const [onyxTargetTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransaction?.reportID}`, {
        canBeMissing: true,
    });
    const [onyxSourceTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${sourceTransaction?.reportID}`, {
        canBeMissing: true,
    });

    return {
        targetTransaction: targetTransaction ?? onyxTargetTransaction,
        sourceTransaction: sourceTransaction ?? onyxSourceTransaction,
        targetTransactionReport: targetTransactionReport ?? onyxTargetTransactionReport,
        sourceTransactionReport: sourceTransactionReport ?? onyxSourceTransactionReport,
    };
}

export default useMergeTransactions;
