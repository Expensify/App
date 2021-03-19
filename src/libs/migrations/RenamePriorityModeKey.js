import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

// This migration changes the name of the Onyx key NVP_PRIORITY_MODE from priorityMode to nvp_priorityMode
export default function () {
    return new Promise((resolve) => {
        // Connect to the old key in Onyx to get the old value of priorityMode
        // then set the new key nvp_priorityMode to hold the old data
        // finally remove the old key by setting the value to null
        const connectionID = Onyx.connect({
            key: 'priorityMode',
            callback: (oldPriorityMode) => {
                Onyx.disconnect(connectionID);

                // Fail early here because there is nothing to migrate
                if (_.isEmpty(oldPriorityMode)) {
                    console.debug('[Migrate Onyx] Skipped migration RenamePriorityModeKey');
                    return resolve();
                }

                Onyx.multiSet({
                    priorityMode: null,
                    [ONYXKEYS.NVP_PRIORITY_MODE]: oldPriorityMode,
                })
                    .then(() => {
                        console.debug('[Migrate Onyx] Ran migration RenamePriorityModeKey');
                        resolve();
                    });
            },
        });
    });
}
