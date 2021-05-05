import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';

const clientID = Str.guid();
const maxClients = 20;

let activeClients;
let setReady = null;

// Whether the client Manager has started
let isInit = false;

// Are we ready to determine active Client?
const isReady = new Promise((res) => {
    setReady = res;
});

Onyx.connect({
    key: ONYXKEYS.ACTIVE_CLIENTS,
    callback: (val) => {
        activeClients = !val ? [] : val;
        if (activeClients.length >= maxClients) {
            activeClients.shift();
            Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
        }
        if (isInit) {
            setReady();
        }
    },
});

/**
 * Add our client ID to the list of active IDs
 */
function init() {
    Onyx.merge(ONYXKEYS.ACTIVE_CLIENTS, [clientID]);
    isInit = true;
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
