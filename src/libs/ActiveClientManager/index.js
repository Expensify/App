import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClients from '../actions/ActiveClients';
import createOnReadyTask from '../createOnReadyTask';

const clientID = Str.guid();
const maxClients = 20;

let activeClients;

// Keeps track of the ActiveClientManager's readiness in one place
// so that multiple calls of isReady resolve the same promise
const activeClientsReadyTask = createOnReadyTask();

/**
 * @returns {Promise}
 */
function isReady() {
    return activeClientsReadyTask.isReady();
}

Onyx.connect({
    key: ONYXKEYS.ACTIVE_CLIENTS,
    callback: (val) => {
        activeClients = !val ? [] : val;
        if (activeClients.length >= maxClients) {
            activeClients.shift();
            ActiveClients.setActiveClients(activeClients);
        }
    },
});

/**
 * Add our client ID to the list of active IDs
 */
function init() {
    ActiveClients.addClient(clientID)
        .then(activeClientsReadyTask.setIsReady);
}

/**
 * The last GUID is the most recent GUID, so that should be the leader
 *
 * @returns {Boolean}
 */
function isClientTheLeader() {
    return _.last(activeClients) === clientID;
}

export {
    init,
    isClientTheLeader,
    isReady,
};
