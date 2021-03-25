import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

// This migration changes the format of the timezone in the Onyx key MY_PERSONAL_DETAILS from a string to an object
export default function () {
    return new Promise((resolve) => {
        // Connect to the old key in Onyx to get the old value of myPersonalDetails timezone
        // then update the timezone to be the default timezone and set the myPersonalDetails
        // key with the updated values
        const connectionID = Onyx.connect({
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
            callback: (myPersonalDetails) => {
                Onyx.disconnect(connectionID);

                if (_.isUndefined(myPersonalDetails) || _.isEmpty(myPersonalDetails)) {
                    console.debug('[Migrate Onyx] Skipped migration ReformatTimezone: No myPersonalDetails key found');
                    return resolve();
                }

                // Fail early here because there is nothing to migrate, the timezone is already in the expected format
                if (_.isObject(myPersonalDetails.timezone)) {
                    console.debug('[Migrate Onyx] Skipped migration ReformatTimezone');
                    return resolve();
                }

                // Update the timezone with the user's old timezone selection and set "automatic" to false
                // because we don't know if their old timezone was set automatically or not
                const details = myPersonalDetails;
                details.timezone = {selected: details.timezone, automatic: false};
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
