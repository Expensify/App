import Onyx from 'react-native-onyx';
import type {Connection, OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

let connection: Connection;

/**
 * Makes a backup copy of a transaction object that can be restored when the user cancels editing a transaction.
 */
function createBackupTransaction(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return;
    }

    // In Strict Mode, the backup logic useEffect is triggered twice on mount. The restore logic is delayed because we need to connect to the onyx first,
    // so it's possible that the restore logic is executed after creating the backup for the 2nd time which will completely clear the backup.
    // To avoid that, we need to cancel the pending connection.
    Onyx.disconnect(connection);
    const newTransaction = {
        ...transaction,
    };

    // Use set so that it will always fully overwrite any backup transaction that could have existed before
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transaction.transactionID}`, newTransaction);
}

/**
 * Removes a transaction from Onyx that was only used temporary in the edit flow
 */
function removeBackupTransaction(transactionID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionID}`, null);
}

function restoreOriginalTransactionFromBackup(transactionID: string, isDraft: boolean) {
    connection = Onyx.connect({
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionID}`,
        callback: (backupTransaction) => {
            Onyx.disconnect(connection);

            // Use set to completely overwrite the original transaction
            Onyx.set(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, backupTransaction ?? null);
            removeBackupTransaction(transactionID);
        },
    });
}

function createDraftTransaction(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return;
    }

    const newTransaction = {
        ...transaction,
    };

    // Use set so that it will always fully overwrite any backup transaction that could have existed before
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, newTransaction);
}

function removeDraftTransaction(transactionID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, null);
}

export {createBackupTransaction, removeBackupTransaction, restoreOriginalTransactionFromBackup, createDraftTransaction, removeDraftTransaction};
