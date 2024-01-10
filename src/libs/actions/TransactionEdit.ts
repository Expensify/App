import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

/**
 * Makes a backup copy of a transaction object that can be restored when the user cancels editing a transaction.
 */
function createBackupTransaction(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return;
    }

    const newTransaction = {
        ...transaction,
    };

    // Use set so that it will always fully overwrite any backup transaction that could have existed before
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, newTransaction);
}

/**
 * Removes a transaction from Onyx that was only used temporary in the edit flow
 */
function removeBackupTransaction(transactionID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, null);
}

function restoreOriginalTransactionFromBackup(transactionID: string) {
    const connectionID = Onyx.connect({
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
        callback: (backupTransaction) => {
            Onyx.disconnect(connectionID);

            // Use set to completely overwrite the original transaction
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, backupTransaction);
            removeBackupTransaction(transactionID);
        },
    });
}

export {createBackupTransaction, removeBackupTransaction, restoreOriginalTransactionFromBackup};
