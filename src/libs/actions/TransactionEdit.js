import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

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
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, newTransaction);
}

/**
 * Removes a transaction from Onyx that was only used temporary in the edit flow
 * @param {String} transactionID
 */
function removeBackupTransaction(transactionID) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, null);
}

function restoreOriginalTransactionFromBackup(transactionID) {
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
