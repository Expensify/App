import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import Log from '../Log';

// This migration changes the name of the Onyx key user.expensifyNewsStatus from expensifyNewsStatus to isSubscribedToNewsletter
export default function () {
    return new Promise((resolve) => {
        // Connect to the USER key in Onyx to get the value of expensifyNewsStatus
        // then set that value as isSubscribedToNewsletter
        // finally remove expensifyNewsStatus by setting the value to null
        const connectionID = Onyx.connect({
            key: ONYXKEYS.USER,
            callback: (user) => {
                Onyx.disconnect(connectionID);

                // Fail early here because there is nothing to migrate
                if (!user || _.isNull(user.expensifyNewsStatus) || _.isUndefined(user.expensifyNewsStatus)) {
                    Log.info('[Migrate Onyx] Skipped migration RenameExpensifyNewsStatus');
                    return resolve();
                }

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.merge(ONYXKEYS.USER, {
                    expensifyNewsStatus: null,
                    isSubscribedToNewsletter: user.expensifyNewsStatus,
                })
                    .then(() => {
                        Log.info('[Migrate Onyx] Ran migration RenameExpensifyNewsStatus');
                        resolve();
                    });
            },
        });
    });
}
