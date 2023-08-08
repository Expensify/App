import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as App from './App';
import Log from '../Log';

let onyxUpdatesLastUpdateID;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID,
    callback: (val) => (onyxUpdatesLastUpdateID = val),
});

/**
 *
 * @param {Number} [lastUpdateID]
 * @param {Number} [previousUpdateID]
 */
function detectAndGetMissingUpdates(lastUpdateID = 0, previousUpdateID = 0) {
    // Return early if there were no updateIDs
    if (!lastUpdateID || !previousUpdateID) {
        return;
    }

    console.debug('[OnyxUpdates] Received lastUpdateID from pusher', lastUpdateID);
    console.debug('[OnyxUpdates] Received previousUpdateID from pusher', previousUpdateID);
    console.debug('[OnyxUpdates] The lastUpdateID the client knows about is', onyxUpdatesLastUpdateID);

    // Store this value in Onyx to allow AuthScreens to fetch incremental updates from the server when a previous session is being reconnected to.
    Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID, lastUpdateID);

    // The previous update from the server does not match the last update the client got which means the client is missing some updates.
    // ReconnectApp will fetch updates starting from the last update this client got and going to the last update the server sent.
    if (onyxUpdatesLastUpdateID < previousUpdateID) {
        console.debug('[OnyxUpdates] Gap detected in update IDs so fetching incremental updates');
        Log.info('Gap detected in update IDs from Pusher so fetching incremental updates', true, {
            lastUpdateIDFromPusher: lastUpdateID,
            previousUpdateIDFromPusher: previousUpdateID,
            lastUpdateIDOnClient: onyxUpdatesLastUpdateID,
        });
        App.getMissingOnyxUpdates(onyxUpdatesLastUpdateID, lastUpdateID);
    }
}
export {detectAndGetMissingUpdates};
