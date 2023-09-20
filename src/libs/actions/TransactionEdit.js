import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as NumberUtils from '../NumberUtils';

/**
 * Makes a copy of a transaction object, generates a new transactionID for it, then stores that transaction in Onyx.
 * This is used when editing a transaction so that as changes are made, the changes are made to this clone and
 * not to the original transaction. This helps when the user cancels the editing flows and the changs have to be discarded.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function createTemporaryTransaction(transaction) {
    const newTransaction = {
        ...transaction,

        // Create a new random ID
        transactionID: NumberUtils.rand64(),
    };
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${newTransaction.transactionID}`, newTransaction);
    return newTransaction.transactionID;
}

/**
 * Removes a transaction from Onyx that was only used temporary in the edit flow
 * @param {String} transactionID
 */
function removeTemporaryTransaction(transactionID) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, null);
}

let syncConnectionID;
function startErrorSync(originalTransactionID, temporaryTransactionID) {
    if (syncConnectionID) {
        return;
    }

    syncConnectionID = Onyx.connect();
}

function stopErrorSync() {
    Onyx.disconnect(syncConnectionID);
    syncConnectionID = null;
}

export {createTemporaryTransaction, removeTemporaryTransaction, startErrorSync, stopErrorSync};
