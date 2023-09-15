import Onyx, {OnyxEntry} from 'react-native-onyx';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';

// This migration changes the name of the Onyx key ACTIVE_CLIENTS from activeClients2 to activeClients
export default function (): Promise<void> {
    return new Promise((resolve) => {
        // Connect to the old key in Onyx to get the old value of activeClients2
        // then set the new key activeClients to hold the old data
        // finally remove the old key by setting the value to null
        const connectionID = Onyx.connect({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            key: 'activeClients2',
            callback: (oldActiveClients) => {
                Onyx.disconnect(connectionID);

                // Fail early here because there is nothing to migrate
                if (oldActiveClients) {
                    Log.info('[Migrate Onyx] Skipped migration RenameActiveClientsKey');
                    return resolve();
                }

                Onyx.multiSet({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    activeClients2: null,
                    [ONYXKEYS.ACTIVE_CLIENTS]: oldActiveClients as OnyxEntry<string[]>,
                }).then(() => {
                    Log.info('[Migrate Onyx] Ran migration RenameActiveClientsKey');
                    resolve();
                });
            },
        });
    });
}
