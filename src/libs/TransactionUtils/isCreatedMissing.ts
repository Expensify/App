import type {OnyxEntry} from 'react-native-onyx';
import type {Transaction} from '@src/types/onyx';

// Kept in its own file so `index.ts` stays inside the 4000-line `max-lines` cap, which it already sat on.
function isCreatedMissing(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return true;
    }
    return transaction?.created === '' && (!transaction.created || transaction.modifiedCreated === '');
}

export default isCreatedMissing;
