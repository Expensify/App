import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

/**
 * Subscribes to both `TRANSACTION_DRAFT_${id}` and `TRANSACTION_${id}` and applies
 * the same selector to whichever is present.
 *
 * The confirmation flow is shared between creation (transaction lives in DRAFT) and
 * editing (transaction lives in regular TRANSACTION). The orchestrator resolves
 * `optimisticTransaction ?? existingTransaction`; this hook applies that same fallback
 * inside individual leaves so each leaf can narrow with its own selector while
 * remaining correct in both lifecycle stages.
 *
 * Each `useOnyx` call narrows independently through its selector, so the deep-equality
 * semantics of selector-based subscriptions are preserved.
 */
function useTransactionSelector<TReturn>(transactionID: string | undefined, selector: (t: OnyxEntry<OnyxTypes.Transaction>) => TReturn): TReturn | undefined {
    const [draft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {selector});
    const [existing] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector});
    return draft ?? existing;
}

export default useTransactionSelector;
