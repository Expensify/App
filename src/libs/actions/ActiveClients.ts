import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setActiveClients(activeClients: string[]): Promise<void | void[]> {
    return Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setActiveClients,
};
