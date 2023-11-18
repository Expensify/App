import isEmpty from 'lodash/isEmpty';
import Onyx, {OnyxCollection} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import {Transaction} from '@src/types/onyx';

/**
 * This migration moves all the transaction backups stored in the transaction collection, ONYXKEYS.COLLECTION.TRANSACTION,
 * to a reserved collection which only stores draft transactions, ONYXKEYS.COLLECTION.TRANSACTION_DRAFT.
 * The purpose of the migration is that there is a possibility of transaction backups are not filtered from
 * by most functions when all transactions are fetched. Eg: getAllReportTransactions (src/libs/TransactionUtils.ts)
 * One problem which arose from storing transaction backups with the other transactions is that for every distance request
 * which have their waypoints updated offline, we expect the ReportPreview component to display the default image of a pending map.
 * However, due to the presence of the transaction backup, the previous map image will be displayed alongside the current pending map.
 * The problem was further discussed in this PR -> https://github.com/Expensify/App/pull/30232#issuecomment-178110172
 */
export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            waitForCollectionCallback: true,
            callback: (transactions: OnyxCollection<Transaction>) => {
                Onyx.disconnect(connectionID);

                // Check if transaction collection is empty
                if (isEmpty(transactions) || !transactions) {
                    Log.info('[Migrate Onyx] Skipped TransactionBackupsToCollection migration because there are no transactions');
                    return resolve;
                }
                const onyxData: OnyxCollection<Transaction> = {};

                // Find all the transaction backups available
                Object.keys(transactions).forEach((transactionOnyxKey: string) => {
                    const transaction: Transaction | null = transactions[transactionOnyxKey];

                    // Check if transaction is a backup
                    if (!transactionOnyxKey.endsWith('-backup') || !transaction) {
                        return;
                    }

                    // Create the transaction backup in the draft transaction collection
                    onyxData[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`] = transaction;

                    // Delete the transaction backup stored the transaction collection
                    onyxData[transactionOnyxKey] = null;
                });

                // Check if any transaction backups were found
                if (isEmpty(onyxData)) {
                    Log.info('[Migrate Onyx] Skipped TransactionBackupsToCollection migration because there are no transaction backups');
                    return;
                }

                // eslint-disable-next-line no-console
                console.info(onyxData);

                Onyx.multiSet(onyxData as Partial<{string: [Transaction | null]}>).then(() => {
                    Log.info('[Migrate Onyx] TransactionBackupsToCollection migration: Moved the transaction backups to the draft transaction collection');
                    resolve();
                });
            },
        });
    });
}
