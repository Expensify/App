import Guid from './Guid';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';

const clientID = Guid();

// @TODO make all this work by uncommenting code. This will work once
// there is a cross-platform method for onBeforeUnload
// See https://github.com/Expensify/ReactNativeChat/issues/413
// let activeClients;
Ion.connect({
    key: IONKEYS.ACTIVE_CLIENTS,

    // callback: val => activeClients = val,
});

/**
 * Add our client ID to the list of active IDs
 *
 * @returns {Promise}
 */
// @TODO need to change this to Ion.merge() once we support multiple tabs since there is now way to remove
// clientIDs from this yet
const init = () => Ion.set(IONKEYS.ACTIVE_CLIENTS, {[clientID]: clientID});

/**
 * Remove this client ID from the array of active client IDs when this client is exited
 */
function removeClient() {
    // Ion.set(IONKEYS.ACTIVE_CLIENTS, _.omit(activeClients, clientID));
}

/**
 * Checks if the current client is the leader (the first one in the list of active clients)
 *
 * @returns {Promise}
 */
function isClientTheLeader() {
    return true;

    // return _.first(activeClients) === clientID;
}

export {
    init,
    removeClient,
    isClientTheLeader
};
