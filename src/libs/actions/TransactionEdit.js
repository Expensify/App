import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Makes a backup copy of a transaction object that can be restored when the user cancels editing a transaction.
 *
 * @param {Object} transaction
 */
function createBackupTransaction(transaction) {
    const newTransaction = {
        ...transaction,
    };
    // Use set so that it will always fully overwrite any backup transaction that could have existed before
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}-backup`, newTransaction);
}

/**
 * Removes a transaction from Onyx that was only used temporary in the edit flow
 * @param {String} transactionID
 */
function removeBackupTransaction(transactionID) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}-backup`, null);
}

function restoreOriginalTransactionFromBackup(transactionID) {
    const connectionID = Onyx.connect({
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}-backup`,
        callback: (backupTransaction) => {
            Onyx.disconnect(connectionID);

            // Use set to completely overwrite the original transaction
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, backupTransaction);
            removeBackupTransaction(transactionID);
        },
    });
}

export {createBackupTransaction, removeBackupTransaction, restoreOriginalTransactionFromBackup};
