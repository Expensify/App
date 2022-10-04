/**
 * When you have many tabs in one browser, the data of Onyx is shared between all of them. Since we persist write requests in Onyx, we need to ensure that
 * only one tab is processing those saved requests or we would be duplicating data (or creating errors).
 * This file ensures exactly that by tracking all the clientIDs connected, storing the most recent one last and it considers that last clientID the "leader".
 */

import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import * as ActiveClients from '../actions/ActiveClients';

const clientID = Str.guid();
const maxClients = 20;
let activeClients = [];
let resolveSavedSelfPromise;
const savedSelfPromise = new Promise((resolve) => {
    resolveSavedSelfPromise = resolve;
});

/**
 * Determines when the client is ready. We need to wait both till we saved our ID in onyx AND the init method was called
 * @returns {Promise}
 */
function isReady() {
    return savedSelfPromise;
}

Onyx.connect({
    key: ONYXKEYS.ACTIVE_CLIENTS,
    callback: (val) => {
        if (!val) {
            return;
        }

        activeClients = val;

        // Remove from the beginning of the list any clients that are past the limit, to avoid having thousands of them
        let removed = false;
        while (activeClients.length >= maxClients) {
            activeClients.shift();
            removed = true;
        }

        // Save the clients back to onyx, if they changed
        if (removed) {
            ActiveClients.setActiveClients(activeClients);
        }
    },
});

/**
 * Add our client ID to the list of active IDs.
 * We want to ensure we have no duplicates and that the activeClient gets added at the end of the array (see isClientTheLeader)
 */
function init() {
    activeClients = _.without(activeClients, clientID);
    activeClients.push(clientID);
    ActiveClients.setActiveClients(activeClients).then(resolveSavedSelfPromise);
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
