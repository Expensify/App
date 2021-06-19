import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';

const clientID = Str.guid();
const maxClients = 20;

let activeClients;

// Whether the current clientID is set
let didInitialize = false;

let resolveReadyPromise = null;

// Keeps track of the ActiveClientManager's readiness.
const readyPromise = new Promise((res) => {
    resolveReadyPromise = res;
});

Onyx.connect({
    key: ONYXKEYS.ACTIVE_CLIENTS,
    callback: (val) => {
        activeClients = !val ? [] : val;
        if (activeClients.length >= maxClients) {
            activeClients.shift();
            Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients).then(() => {
                if (didInitialize) {
                    resolveReadyPromise();
                }
            });
        }
    },
});

/**
 * Add our client ID to the list of active IDs
 */
function init() {
    Onyx.merge(ONYXKEYS.ACTIVE_CLIENTS, [clientID]);
    didInitialize = true;
}

/**
 * Allow to run any task after ActiveClientManager has successfully initialized
 *
 * @returns {Promise<void>}
 */
function isReady() {
    return readyPromise;
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
    isReady,
    isClientTheLeader,
};
