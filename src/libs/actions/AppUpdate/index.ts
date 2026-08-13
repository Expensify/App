import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import updateApp from './updateApp';

function triggerUpdateAvailable() {
    Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE, true);
}

function setIsAppInBeta(isBeta: boolean) {
    Onyx.set(ONYXKEYS.IS_BETA, isBeta);
}

export {triggerUpdateAvailable, setIsAppInBeta, updateApp};
