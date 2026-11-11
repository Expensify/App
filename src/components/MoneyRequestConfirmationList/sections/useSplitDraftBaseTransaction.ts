import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

/**
 * Resolves the transaction a split draft write should start from: the split draft when one exists, or the saved
 * transaction when the draft hasn't been created yet.
 *
 * `setDraftSplitTransaction` does not fall back to the saved transaction. When it receives `undefined` it
 * merges `null`, which clears the draft, so every caller has to resolve the base transaction first.
 */
function useSplitDraftBaseTransaction(transactionID: string | undefined) {
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    return {splitDraftTransaction, baseTransaction: !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction};
}

export default useSplitDraftBaseTransaction;
