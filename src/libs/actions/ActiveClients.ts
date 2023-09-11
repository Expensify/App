import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function setActiveClients(activeClients: string[]): Promise<void> {
    return Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setActiveClients,
};
