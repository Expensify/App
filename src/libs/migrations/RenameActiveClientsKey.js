import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

// This migration changes the name of the Onyx key ACTIVE_CLIENTS from activeClients2 to activeClients
export default function () {
    return new Promise((resolve) => {
        // Connect to the old key in Onyx to get the old value of activeClients2
        // then set the new key activeClients to hold the old data
        // finally remove the old key by setting the value to null
        const connectionID = Onyx.connect({
            key: 'activeClients2',
            callback: (oldActiveClients) => {
                Onyx.disconnect(connectionID);

                // Fail early here because there is nothing to migrate
                if (_.isEmpty(oldActiveClients)) {
                    console.debug('[Migrate Onyx] Skipped migration RenameActiveClientsKey');
                    return resolve();
                }

                Onyx.multiSet({
                    activeClients2: null,
                    [ONYXKEYS.ACTIVE_CLIENTS]: oldActiveClients,
                })
                    .then(() => {
                        console.debug('[Migrate Onyx] Ran migration RenameActiveClientsKey');
                        resolve();
                    });
            },
        });
    });
}
