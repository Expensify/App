import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

function restoreOriginalTransactionFromBackup(transactionID: string, backupTransaction: OnyxEntry<Transaction>) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, backupTransaction);
}

export default {restoreOriginalTransactionFromBackup};
