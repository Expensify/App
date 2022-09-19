import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Array} activeClients
 * @return {Promise}
 */
function setActiveClients(activeClients) {
    return Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setActiveClients,
};
