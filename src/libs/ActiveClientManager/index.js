import _ from 'underscore';
import Onyx from 'react-native-onyx';
import guid from '../guid';
import IONKEYS from '../../IONKEYS';

const clientID = guid();
const maxClients = 20;

let activeClients;
Onyx.connect({
    key: IONKEYS.ACTIVE_CLIENTS,
    callback: (val) => {
        activeClients = _.isNull(val) ? [] : val;
        if (activeClients.length >= maxClients) {
            activeClients.shift();
            Onyx.set(IONKEYS.ACTIVE_CLIENTS, activeClients);
        }
    },
});

/**
 * Add our client ID to the list of active IDs
 */
function init() {
    Onyx.merge(IONKEYS.ACTIVE_CLIENTS, [clientID]);
}

/**
 * The last GUID is the most recent GUID, so that should be the leader
 *
 * @returns {boolean}
 */
function isClientTheLeader() {
    return _.last(activeClients) === clientID;
}

export {
    init,
    isClientTheLeader
};
