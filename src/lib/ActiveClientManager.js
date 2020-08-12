import _ from 'underscore';
import Guid from './Guid';
import Ion from './Ion';
import STOREKEYS from '../store/STOREKEYS';

const clientID = Guid();

/**
 * Add our client ID to the list of active IDs
 *
 * @returns {Promise}
 */
const init = () => Ion.merge(STOREKEYS.ACTIVE_CLIENT_IDS, {clientID});

/**
 * Remove this client ID from the array of active client IDs when this client is exited
 *
 * @returns {Promise}
 */
function removeClient() {
    return Ion.get(STOREKEYS.ACTIVE_CLIENT_IDS)
        .then(activeClientIDs => _.omit(activeClientIDs, clientID))
        .then(newActiveClientIDs => Ion.set(STOREKEYS.ACTIVE_CLIENT_IDS, newActiveClientIDs));
}

/**
 * Checks if the current client is the leader (the first one in the list of active clients)
 *
 * @returns {Promise}
 */
function isClientTheLeader() {
    return Ion.get(STOREKEYS.ACTIVE_CLIENT_IDS)
        .then(activeClientIDs => _.first(activeClientIDs) === clientID);
}

export {
    init,
    removeClient,
    isClientTheLeader
};
