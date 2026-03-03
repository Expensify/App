import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import useOnyx from './useOnyx';

function useTransactionDraftValues(): Array<Transaction | null | undefined> {
    const [drafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT);

    return Object.values(drafts ?? {});
}

export default useTransactionDraftValues;
