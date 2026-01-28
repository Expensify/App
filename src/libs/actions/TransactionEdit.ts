import {format} from 'date-fns';
import Onyx from 'react-native-onyx';
import type {Connection, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {formatCurrentUserToAttendee} from '@libs/IOUUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Transaction} from '@src/types/onyx';
import {generateTransactionID, getDraftTransactions} from './Transaction';

let connection: Connection;

/**
 * Makes a backup copy of a transaction object that can be restored when the user cancels editing a transaction.
 */
function createBackupTransaction(transaction: OnyxEntry<Transaction>, isDraft: boolean) {
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
    // We need to read the old transaction backup first before writing a new one, otherwise we might overwrite an existing backup. It does not update impact UI rendering since this function is called on page mount.
    const conn = Onyx.connectWithoutView({
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transaction.transactionID}`,
        callback: (transactionBackup) => {
            Onyx.disconnect(conn);
            if (transactionBackup) {
                // If the transactionBackup exists it means we haven't properly restored original value on unmount
                // such as on page refresh, so we will just restore the transaction from the transactionBackup here.
                Onyx.set(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transactionBackup);
                return;
            }
            // Use set so that it will always fully overwrite any backup transaction that could have existed before
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transaction.transactionID}`, newTransaction);
        },
    });
}

/**
 * Removes a transaction from Onyx that was only used temporary in the edit flow
 */
function removeBackupTransaction(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionID}`, null);
}

function restoreOriginalTransactionFromBackup(transactionID: string | undefined, isDraft: boolean) {
    if (!transactionID) {
        return;
    }

    // We need to use connectWithoutView as this action is called during unmount, and we need to read the latest value from Onyx before we can restore it. As it is called during unmount, it does not impact UI rendering.
    connection = Onyx.connectWithoutView({
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

function removeDraftTransaction(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, null);
}

function removeDraftSplitTransaction(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }

    Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, null);
}

function removeDraftTransactions(shouldExcludeInitialTransaction = false, allTransactionDrafts?: OnyxCollection<Transaction>) {
    const draftTransactions = getDraftTransactions(allTransactionDrafts);
    const draftTransactionsSet = draftTransactions.reduce(
        (acc, item) => {
            if (shouldExcludeInitialTransaction && item.transactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
                return acc;
            }
            acc[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${item.transactionID}`] = null;
            return acc;
        },
        {} as Record<string, null>,
    );
    Onyx.multiSet(draftTransactionsSet);
}

function removeDraftTransactionsByIDs(transactionIDs: string[]) {
    if (!transactionIDs.length) {
        return;
    }

    const draftTransactionsSet = transactionIDs.reduce(
        (acc, transactionID) => {
            acc[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`] = null;
            return acc;
        },
        {} as Record<string, null>,
    );
    Onyx.multiSet(draftTransactionsSet);
}

function replaceDefaultDraftTransaction(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return;
    }

    Onyx.update([
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            value: {
                ...transaction,
                transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`,
            value: null,
        },
    ]);
}

function removeTransactionReceipt(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {receipt: null});
}

type BuildOptimisticTransactionParams = {
    initialTransaction: Partial<Transaction>;
    currentUserPersonalDetails: PersonalDetails;
    reportID: string;
};

function buildOptimisticTransactionAndCreateDraft({initialTransaction, currentUserPersonalDetails, reportID}: BuildOptimisticTransactionParams): Transaction {
    const newTransactionID = generateTransactionID();
    const {currency, iouRequestType, isFromGlobalCreate} = initialTransaction ?? {};
    const newTransaction = {
        amount: 0,
        created: format(new Date(), 'yyyy-MM-dd'),
        currency,
        comment: {attendees: formatCurrentUserToAttendee(currentUserPersonalDetails, reportID)},
        iouRequestType,
        reportID,
        transactionID: newTransactionID,
        isFromGlobalCreate,
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
    } as Transaction;
    createDraftTransaction(newTransaction);
    return newTransaction;
}

export {
    createBackupTransaction,
    removeBackupTransaction,
    restoreOriginalTransactionFromBackup,
    createDraftTransaction,
    removeDraftTransaction,
    removeTransactionReceipt,
    removeDraftTransactions,
    removeDraftTransactionsByIDs,
    removeDraftSplitTransaction,
    replaceDefaultDraftTransaction,
    buildOptimisticTransactionAndCreateDraft,
};
