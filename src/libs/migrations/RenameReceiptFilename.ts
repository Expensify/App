import Onyx from 'react-native-onyx';
import {NullishDeep, OnyxCollection} from 'react-native-onyx/lib/types';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type OldTransaction = Transaction & {receiptFilename?: string};

// This migration changes the property name on a transaction from receiptFilename to filename so that it matches what is stored in the database
export default function () {
    return new Promise<void>((resolve) => {
        // Connect to the TRANSACTION collection key in Onyx to get all of the stored transactions.
        // Go through each transaction and change the property name
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            waitForCollectionCallback: true,
            callback: (transactions: OnyxCollection<OldTransaction>) => {
                Onyx.disconnect(connectionID);

                if (!transactions || isEmptyObject(transactions)) {
                    Log.info('[Migrate Onyx] Skipped migration RenameReceiptFilename because there are no transactions');
                    return resolve();
                }

                const transactionArray: Array<OldTransaction | null> = Object.values(transactions);
                if (!transactionArray?.map((transaction) => transaction?.receiptFilename).filter(Boolean).length) {
                    Log.info('[Migrate Onyx] Skipped migration RenameReceiptFilename because there were no transactions with the receiptFilename property');
                    return resolve();
                }

                Log.info('[Migrate Onyx] Running  RenameReceiptFilename migration');
                const dataToSave: Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, NullishDeep<OldTransaction>> = {};

                transactionArray?.forEach((transaction) => {
                    // Do nothing if there is no receiptFilename property
                    if (!transaction || !('receiptFilename' in transaction)) {
                        return;
                    }

                    Log.info(`[Migrate Onyx] Renaming receiptFilename ${transaction?.receiptFilename} to filename`);
                    dataToSave[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
                        filename: transaction?.receiptFilename,
                        receiptFilename: null,
                    };
                }, {});

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, dataToSave).then(() => {
                    Log.info(`[Migrate Onyx] Ran migration RenameReceiptFilename and renamed ${Object.keys(dataToSave)?.length} properties`);
                    resolve();
                });
            },
        });
    });
}
