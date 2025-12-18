import type {OnyxEntry} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import {getTransactionFromMergeTransaction} from '@libs/MergeTransactionUtils';
import CONST from '@src/CONST';
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

    const targetTransaction = getTransaction(mergeTransaction, mergeTransaction?.targetTransactionID, onyxTargetTransaction, currentSearchResults);
    const sourceTransaction = getTransaction(mergeTransaction, mergeTransaction?.sourceTransactionID, onyxSourceTransaction, currentSearchResults);

    const [onyxTargetTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransaction?.reportID}`, {
        canBeMissing: true,
    });
    const [onyxSourceTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${sourceTransaction?.reportID}`, {
        canBeMissing: true,
    });

    // Always use transactions from the search snapshot if we're coming from the Reports page
    let targetTransactionReport = onyxTargetTransactionReport;
    let sourceTransactionReport = onyxSourceTransactionReport;
    if (searchHash && currentSearchResults?.data) {
        targetTransactionReport = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${targetTransaction?.reportID}`] ?? onyxTargetTransactionReport;
        sourceTransactionReport = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${sourceTransaction?.reportID}`] ?? onyxSourceTransactionReport;
    }

    return {
        targetTransaction,
        sourceTransaction,
        targetTransactionReport,
        sourceTransactionReport,
    };
}

export default useMergeTransactions;
