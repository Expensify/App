import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Array} activeClients
 */
function setActiveClients(activeClients) {
    Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
}

/**
 * @param {Number} clientID
 * @returns {Promise}
 */
function addClient(clientID) {
    return Onyx.merge(ONYXKEYS.ACTIVE_CLIENTS, [clientID]);
}

export {
    setActiveClients,
    addClient,
};
