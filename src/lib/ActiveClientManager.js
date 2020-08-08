import Guid from './Guid.js';
import * as Store from '../store/Store.js';
import STOREKEYS from '../store/STOREKEYS.js';

const clientID = Guid();

/**
 * Add our client ID to the list of active IDs
 */
const init = async () => {
    const activeClientIDs = (await Store.get(STOREKEYS.ACTIVE_CLIENT_IDS)) || [];
    activeClientIDs.push(clientID);
    Store.set(STOREKEYS.ACTIVE_CLIENT_IDS, activeClientIDs);
};

/**
 * Remove this client ID from the array of active client IDs when this client is exited
 */
function removeClient() {
    const activeClientIDs = Store.get(STOREKEYS.ACTIVE_CLIENT_IDS) || [];
    const newActiveClientIDs = activeClientIDs.filter(
        (activeClientID) => activeClientID !== clientID,
    );
    Store.set(STOREKEYS.ACTIVE_CLIENT_IDS, newActiveClientIDs);
}

/**
 * Checks if the current client is the leader (the first one in the list of active clients)
 *
 * @returns {boolean}
 */
function isClientTheLeader() {
    const activeClientIDs = Store.get(STOREKEYS.ACTIVE_CLIENT_IDS) || [];
    if (!activeClientIDs.length) {
        return false;
    }
    return activeClientIDs[0] === clientID;
}

export {init, removeClient, isClientTheLeader};
