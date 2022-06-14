import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClients from '../actions/ActiveClients';

const clientID = Str.guid();
const maxClients = 20;

let activeClients;

let resolveIsReadyPromise;
const isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

/**
 * @returns {Promise}
 */
function isReady() {
    return isReadyPromise;
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
        .then(resolveIsReadyPromise);
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
