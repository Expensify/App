import Onyx from 'react-native-onyx';
import type {NullishDeep, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type OldTransaction = Transaction & {receiptFilename?: string};
type TransactionKey = `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`;

// This migration changes the property name on a transaction from receiptFilename to filename so that it matches what is stored in the database
export default function () {
    return new Promise<void>((resolve) => {
        // Connect to the TRANSACTION collection key in Onyx to get all of the stored transactions.
        // Go through each transaction and change the property name
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            waitForCollectionCallback: true,
            callback: (transactions: OnyxCollection<OldTransaction>) => {
                Onyx.disconnect(connection);

                if (!transactions || isEmptyObject(transactions)) {
                    Log.info('[Migrate Onyx] Skipped migration RenameReceiptFilename because there are no transactions');
                    return resolve();
                }

                const transactionsWithReceipt: Array<OnyxEntry<OldTransaction>> = Object.values(transactions).filter((transaction) => transaction?.receiptFilename);
                if (!transactionsWithReceipt?.length) {
                    Log.info('[Migrate Onyx] Skipped migration RenameReceiptFilename because there were no transactions with the receiptFilename property');
                    return resolve();
                }
                Log.info('[Migrate Onyx] Running  RenameReceiptFilename migration');
                const dataToSave = transactionsWithReceipt?.reduce((acc, transaction) => {
                    if (!transaction) {
                        return acc;
                    }
                    Log.info(`[Migrate Onyx] Renaming receiptFilename ${transaction.receiptFilename} to filename`);
                    acc[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
                        filename: transaction.receiptFilename,
                        receiptFilename: null,
                    };
                    return acc;
                }, {} as Record<TransactionKey, NullishDeep<OldTransaction>>);

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, dataToSave).then(() => {
                    Log.info(`[Migrate Onyx] Ran migration RenameReceiptFilename and renamed ${Object.keys(dataToSave)?.length} properties`);
                    resolve();
                });
            },
        });
    });
}
