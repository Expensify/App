import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Makes a backup copy of a transaction object that can be restored when the user cancels editing a transaction.
 *
 * @param {Object} transaction
 */
function createBackupTransaction(transaction) {
    const newTransaction = {
        ..._.omit(transaction, ['errorFields', 'isLoading']),
    };
    // Use set so that it will always fully overwrite any backup transaction that could have existed before
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}-backup`, newTransaction);
}

/**
 * Replaces the original transaction with the backup copy, then deletes the backup
 *
 * @param {String} transactionID of the original transaction to restore
 */
function restoreOriginalTransactionFromBackup(transactionID) {
    const connectionID = Onyx.connect({
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}-backup`,
        callback: (backupTransaction) => {
            Onyx.disconnect(connectionID);

            // Use set to completely overwrite the original transaction
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: backupTransaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}-backup`]: null,
            });
        },
    });
}

/**
 * Removes a transaction from Onyx that was only used temporary in the edit flow
 * @param {String} transactionID
 */
function removeBackupOrRestoreOriginalIfErrors(transactionID) {
    const connectionID = Onyx.connect({
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        callback: (originalTransaction) => {
            Onyx.disconnect(connectionID);

            if (_.size(originalTransaction.errorFields)) {
                // There were errors, so we need to restore the original transaction
                restoreOriginalTransactionFromBackup(transactionID);
                return;
            }

            // Since there were no errors on the original transaction, the backup transaction can be safely removed
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}-backup`, null);
        },
    });
}

export {createBackupTransaction, removeBackupOrRestoreOriginalIfErrors, restoreOriginalTransactionFromBackup};
