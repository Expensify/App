import type {OnyxCollection, OnyxCollectionInputValue, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

/**
 * This migration moves all the transaction backups stored in the transaction collection, ONYXKEYS.COLLECTION.TRANSACTION, to a reserved collection that only
 * stores draft transactions, ONYXKEYS.COLLECTION.TRANSACTION_DRAFT. The purpose of the migration is that there is a possibility that transaction backups are
 * not filtered by most functions, e.g, getAllReportTransactions (src/libs/TransactionUtils/index.ts). One problem that arose from storing transaction backups with
 * the other transactions is that for every distance expense which have their waypoints updated offline, we expect the ReportPreview component to display the
 * default image of a pending map. However, due to the presence of the transaction backup, the previous map image will be displayed alongside the pending map.
 * The problem was further discussed in this PR. https://github.com/Expensify/App/pull/30232#issuecomment-178110172
 */
export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            waitForCollectionCallback: true,
            callback: (transactions: OnyxCollection<Transaction>) => {
                Onyx.disconnect(connection);

                // Determine whether any transactions were stored
                if (!transactions || Object.keys(transactions).length === 0) {
                    Log.info('[Migrate Onyx] Skipped TransactionBackupsToCollection migration because there are no transactions');
                    return resolve();
                }

                const onyxData: OnyxCollectionInputValue<Transaction> = {};

                // Find all the transaction backups available
                Object.keys(transactions).forEach((transactionOnyxKey: string) => {
                    const transaction: OnyxEntry<Transaction> = transactions[transactionOnyxKey];

                    // Determine whether or not the transaction is a backup
                    if (transactionOnyxKey.endsWith('-backup') && transaction) {
                        // Create the transaction backup in the draft transaction collection
                        onyxData[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`] = transaction;

                        // Delete the transaction backup stored in the transaction collection
                        onyxData[transactionOnyxKey] = null;
                    }
                });

                // Determine whether any transaction backups are found
                if (Object.keys(onyxData).length === 0) {
                    Log.info('[Migrate Onyx] Skipped TransactionBackupsToCollection migration because there are no transaction backups');
                    return resolve();
                }

                // Move the transaction backups to the draft transaction collection
                Onyx.multiSet(onyxData as Partial<{string: [Transaction | null]}>).then(() => {
                    Log.info('[Migrate Onyx] TransactionBackupsToCollection migration: Successfully moved all the transaction backups to the draft transaction collection');
                    resolve();
                });
            },
        });
    });
}
