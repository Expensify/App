import Onyx from 'react-native-onyx';
import _ from 'underscore';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

// This migration moves all the transaction backups stored in the main transactions collection (ONYXKEYS.COLLECTION.TRANSACTION)
// to a reserved collection which only stores draft transactions (ONYXKEYS.COLLECTION.TRANSACTION_DRAFT).
// The main purpose of this migration is that there is a possibility of transactions backups not getting filtered
// by most functions which need use all transactions. Eg: getAllReportTransactions (src/libs/TransactionUtils.ts)
// One problem which arose from having duplicate transactions in the collection is that for every distance request
// which have their waypoints updated offline, we expect the ReportPreview component to display the default image of a pending map.
// However, due to the presence of a transaction backup, an extra unexpected image of the previous map will be displayed.
// The problem was further discussed in this PR -> https://github.com/Expensify/App/pull/30232#issuecomment-1781101722
export default function () {
    return new Promise((resolve) => {
        const transactionConnectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
            waitForCollectionCallback: true,
            callback: (transactions) => {
                Onyx.disconnect(transactionConnectionID);

                // Check if there are any transactions.
                if (!transactions) {
                    Log.info(`[Migrate Onyx] Skipped TransactionBackupsToCollection migration because there are no transactions in the main transactions collection`);
                    return resolve();
                }

                const onyxData = _.reduce(
                    _.keys(transactions),
                    (result, transactionKey) => {
                        if (!transactionKey.endsWith('-backup')) {
                            return result;
                        }
                        return {
                            ...result,

                            // We create all the transaction backups to the draft transactions collection
                            [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactions[transactionKey].transactionID}`]: transactions[transactionKey],

                            // We delete the transaction backups stored the main transactions collection
                            [transactionKey]: null,
                        };
                    },
                    {},
                );

                // Check if there are any available transaction backups to move
                if (!onyxData) {
                    Log.info(`[Migrate Onyx] Skipped TransactionBackupsToCollection migration because there are no transaction backups in the main transactions collection`);
                    return resolve();
                }

                const transactionDraftConnectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: () => {
                        Onyx.disconnect(transactionDraftConnectionID);

                        // Moving the transaction backups from the main transactions collection to the draft transactions collection
                        Onyx.multiSet(onyxData).then(() => {
                            Log.info(
                                `[Migrate Onyx] TransactionBackupsToCollection migration: successfully moved all transaction backups from the main transactions collection to the draft transactions collection`,
                            );
                            resolve();
                        });
                    },
                });
            },
        });
    });
}
