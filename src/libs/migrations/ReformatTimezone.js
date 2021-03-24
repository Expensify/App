import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

// This migration changes the format of the timezone in the Onyx key MY_PERSONAL_DETAILS from a string to an object
export default function () {
    return new Promise((resolve) => {
        // Connect to the old key in Onyx to get the old value of myPersonalDetails timezone
        // then update the timezone to be the default timezone and set the myPersonalDetails
        // key with the updated values
        const connectionID = Onyx.connect({
            key: 'myPersonalDetails',
            callback: (myPersonalDetails) => {
                Onyx.disconnect(connectionID);

                if (_.isUndefined(myPersonalDetails)) {
                    console.debug('[Migrate Onyx] Skipped migration ReformatTimezone: No myPersonalDetails key found');
                    return resolve();
                }

                // Fail early here because there is nothing to migrate, the timezone is already in the expected format
                if (_.isObject(myPersonalDetails.timezone)) {
                    console.debug('[Migrate Onyx] Skipped migration ReformatTimezone');
                    return resolve();
                }

                // Replace the old timezone with the default timezone
                const details = myPersonalDetails;
                details.timezone = CONST.DEFAULT_TIME_ZONE;
                Onyx.set({
                    [ONYXKEYS.MY_PERSONAL_DETAILS]: details,
                })
                    .then(() => {
                        console.debug('[Migrate Onyx] Ran migration ReformatTimezone');
                        resolve();
                    });
            },
        });
    });
}
