import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as NumberUtils from '../NumberUtils';

/**
 * Makes a copy of a transaction object, generates a new transactionID for it, then stores that transaction in Onyx.
 * This is used when editing a transaction so that as changes are made, the changes are made to this clone and
 * not to the original transaction. This helps when the user cancels the editing flows and the changes have to be discarded.
 *
 * @param {Object} transaction
 * @returns {String}
 */
function createTemporaryTransaction(transaction) {
    const newTransaction = {
        ..._.omit(transaction, ['errorFields']),

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
/**
 * This method keeps error fields in sync between the transaction that exists in the database
 * and the transaction being stored only on the front-end while the transaction is being edited. This is
 * because if there are errors while trying to update the request on the server, the server returns errors
 * to the front-end based on the originalTransactionID and those errors have to be copied to the temporary
 * transaction because that's what's being shown to the user in the UI.
 *
 * The other way to do this is to tell the server what the temporaryTransactionID is so the server can return
 * errors to that specific transaction, but that's putting too much front-end logic on the server layer.
 *
 * @param {String} originalTransactionID that exists in the database
 * @param {String} temporaryTransactionID that only exists in memory while the transaction is being edited
 */
function startErrorSync(originalTransactionID, temporaryTransactionID) {
    // Only sync one transaction at a time.
    if (syncConnectionID) {
        Onyx.disconnect(syncConnectionID);
    }

    let firstOnyxReadHappened = false;
    syncConnectionID = Onyx.connect({
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
        callback: (val) => {
            if (!val) {
                return;
            }

            // Only sync changes after the transaction has been read from Onyx so that existing
            // errors aren't copied over, only new changes from here on out
            if (firstOnyxReadHappened) {
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${temporaryTransactionID}`, {
                    errorFields: val.errorFields,
                });
            }

            firstOnyxReadHappened = true;
        },
    });
}

function stopErrorSync() {
    Onyx.disconnect(syncConnectionID);
    syncConnectionID = null;
}

export {createTemporaryTransaction, removeTemporaryTransaction, startErrorSync, stopErrorSync};
