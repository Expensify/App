import _ from 'underscore';
import Guid from '../Guid';
import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

const clientID = Guid();

let activeClients;
Ion.connect({
    key: IONKEYS.ACTIVE_CLIENTS,

    callback: val => activeClients = val,
});

/**
 * Add our client ID to the list of active IDs
 */
function init() {
    Ion.merge(IONKEYS.ACTIVE_CLIENTS, {[clientID]: clientID});
}

/**
 * Remove this client ID from the array of active client IDs when this client is exited
 */
function removeClient() {
    Ion.set(IONKEYS.ACTIVE_CLIENTS, _.omit(activeClients, clientID));
}

/**
 * Checks if the current client is the leader (the first one in the list of active clients)
 *
 * @returns {boolean}
 */
function isClientTheLeader() {
    return _.first(_.keys(activeClients)) === clientID;
}

/**
 * Listens for storage events so that multiple tabs can keep track of what
 * other tabs are doing
 *
 * @param {function} callback
 */
function addStorageEventListener(callback) {
    window.addEventListener('storage', (e) => {
        callback(e.key, JSON.parse(e.newValue));
    });
}


export {
    init,
    removeClient,
    isClientTheLeader,
    addStorageEventListener,
};
