import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function setActiveClients(activeClients: string[]): Promise<void | void[]> {
    return Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setActiveClients,
};
