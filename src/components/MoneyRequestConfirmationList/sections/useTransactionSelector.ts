import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

/**
 * Subscribes to the active transaction sources and applies `selector` to whichever
 * is present. In split-bill edit mode the source of truth is `SPLIT_TRANSACTION_DRAFT`;
 * otherwise it's `TRANSACTION_DRAFT` (creation) with a fallback to `TRANSACTION` (existing).
 *
 * TODO: the `isEditingSplitBill` argument (and the same prop on the leaves that pass it
 * through) will be dropped once `ConfirmationFieldsProvider` lands — the hook will read
 * the flag from `useConfirmationFields()` instead of having each caller thread it in.
 */
function useTransactionSelector<TReturn>(transactionID: string | undefined, selector: (t: OnyxEntry<OnyxTypes.Transaction>) => TReturn, isEditingSplitBill = false): TReturn | undefined {
    const [splitDraft] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {selector});
    const [draft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {selector});
    const [existing] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector});
    return isEditingSplitBill ? (splitDraft ?? existing) : (draft ?? existing);
}

export default useTransactionSelector;
