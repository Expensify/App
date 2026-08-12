import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function setActiveClients(activeClients: string[]): Promise<void | void[]> {
    return Onyx.set(ONYXKEYS.ACTIVE_CLIENTS, activeClients);
}

export {
    /* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
    setActiveClients,
};
