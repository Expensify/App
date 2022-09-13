import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import Log from '../Log';

/**
 * This migration changes the format of the data in Onyx key loginList
 * from an array (old format) to an object (new format).
 * 
 * The object keys will be each login's partnerUserID.
 */
export default function () {
    return new Promise((resolve) => {
        // Connect to the LOGIN_LIST key in Onyx to get the format of this data.
        // Then, check if the data is an array or object.
        // Finally, if the data is an array, convert it to an object and replace the data.
        const connectionID = Onyx.connect({
            key: ONYXKEYS.LOGIN_LIST,
            callback: (loginList) => {
                Onyx.disconnect(connectionID);

                // Quit early here if there is nothing to migrate
                if (!loginList || (_.isObject(loginList) && !_.isArray(loginList))) {
                    Log.info('[Migrate Onyx] Skipped migration ReformatLoginList');
                    return resolve();
                }

                // Convert array of logins to object containing all logins.
                const newLoginList = loginList.reduce((allLogins, login) => {
                    allLogins[login.partnerUserID] = login;
                    return allLogins;
                }, {});

                Onyx.set(ONYXKEYS.LOGIN_LIST, newLoginList)
                    .then(() => {
                        Log.info('[Migrate Onyx] Ran migration ReformatLoginList');
                        resolve();
                    });
            },
        });
    });
}