import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

/**
 * Subscribes to both `TRANSACTION_DRAFT_${id}` and `TRANSACTION_${id}` and applies
 * the same selector to whichever is present, preferring the draft.
 */
function useTransactionSelector<TReturn>(transactionID: string | undefined, selector: (t: OnyxEntry<OnyxTypes.Transaction>) => TReturn): TReturn | undefined {
    const [draft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {selector});
    const [existing] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector});
    return draft ?? existing;
}

export default useTransactionSelector;
