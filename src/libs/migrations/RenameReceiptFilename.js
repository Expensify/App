import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashHas from 'lodash/has';
import ONYXKEYS from '../../ONYXKEYS';
import Log from '../Log';

// This migration changes the property name on a transaction from receiptFilename to filename so that it matches what is stored in the database
export default function () {
    return new Promise((resolve) => {
        // Connect to the TRANSACTION collection key in Onyx to get all of the stored transactions.
        // Go through each transaction and change the property name
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.TRANSACTION,
            callback: (transactions) => {
                Onyx.disconnect(connectionID);

                if (!transactions || transactions.length === 0) {
                    Log.info('[Migrate Onyx] Skipped migration RenameReceiptFilename because there are no transactions');
                    return resolve();
                }

                if (!_.pluck(transactions, 'receiptFilename').length) {
                    Log.info('[Migrate Onyx] Skipped migration RenameReceiptFilename because there were no transactions with the receiptFilename property');
                    return resolve();
                }

                const dataToSave = _.reduce(
                    transactions,
                    (dataToSaveToOnyx, transaction) => {
                        // Do nothing if there is no receiptFilename property
                        if (!lodashHas(transaction, 'receiptFilename')) {
                            return dataToSaveToOnyx;
                        }
                        Log.info(`[Migrate Onyx] Renaming receiptFilename ${transaction.receiptFilename} to filename`);
                        return {
                            ...dataToSaveToOnyx,
                            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transctionID}`]: {
                                ..._.omit(transaction, 'receiptFilename'),
                                filename: transaction.receiptFilename,
                            },
                        };
                    },
                    {},
                );

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.multiSet(dataToSave).then(() => {
                    Log.info(`[Migrate Onyx] Ran migration RenameReceiptFilename and renamed ${_.size(dataToSave)} properties`);
                    resolve();
                });
            },
        });
    });
}
