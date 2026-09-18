import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * Returns all violations for the given transaction without any ownership or visibility calculations unlike useTransactionViolations
 */
function useAllTransactionViolations(transactionID: string | undefined): OnyxEntry<TransactionViolations> {
    const [allTransactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transactionID)}`);

    return allTransactionViolations;
}

export default useAllTransactionViolations;
