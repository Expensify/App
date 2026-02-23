import ONYXKEYS from '@src/ONYXKEYS';
import type {Receipt} from '@src/types/onyx/Transaction';
import useOnyx from './useOnyx';

type ReceiptWithTransactionID = Receipt & {transactionID: string};

function useTransactionDraftReceipts(): ReceiptWithTransactionID[] {
    const [drafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});

    if (!drafts) {
        return [];
    }

    return Object.values(drafts).reduce<ReceiptWithTransactionID[]>((acc, transaction) => {
        if (transaction?.receipt) {
            acc.push({...transaction.receipt, transactionID: transaction.transactionID});
        }
        return acc;
    }, []);
}

export default useTransactionDraftReceipts;
