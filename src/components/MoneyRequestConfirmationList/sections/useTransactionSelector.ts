import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import useOnyx from '@hooks/useOnyx';

import {shouldUseTransactionDraft} from '@libs/IOUUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Subscribes to the active transaction sources and applies `selector` to whichever
 * is present. In split-bill edit mode the source of truth is `SPLIT_TRANSACTION_DRAFT`;
 * a saved expense being edited reads `TRANSACTION`, since a draft with its ID can be left
 * over from a flow the user backed out of; otherwise it's `TRANSACTION_DRAFT` (creation)
 * with a fallback to `TRANSACTION` (existing).
 *
 * Must be called from inside a `ConfirmationFieldsProvider`.
 */
function useTransactionSelector<TReturn>(transactionID: string | undefined, selector: (t: OnyxEntry<OnyxTypes.Transaction>) => TReturn): TReturn | undefined {
    const {isEditingSplitBill, action, iouType} = useConfirmationFields();
    const [splitDraft] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {selector});
    const [draft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {selector});
    const [existing] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector});
    if (isEditingSplitBill) {
        return splitDraft ?? existing;
    }
    return shouldUseTransactionDraft(action, iouType) ? (draft ?? existing) : existing;
}

export default useTransactionSelector;
