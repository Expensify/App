/**
 * Reads a transaction's violations from Onyx exactly as they are stored, for handing to an expense edit.
 */
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * The expense update actions seed an optimistic recompute with these violations and write the whole key back, so the
 * seed has to carry everything that is stored. Anything missing from it is dropped from Onyx until the response lands,
 * which is why `useTransactionViolations` must not be used here: it narrows the list to what the current viewer may
 * see, and seeding with that would delete the rest. Use `useTransactionViolations` for rendering instead.
 */
function useStoredTransactionViolations(transactionID: string | undefined): OnyxEntry<TransactionViolations> {
    const [storedTransactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transactionID)}`);

    return storedTransactionViolations;
}

export default useStoredTransactionViolations;
