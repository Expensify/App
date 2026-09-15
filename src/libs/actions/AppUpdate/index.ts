import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import updateApp from './updateApp';

function triggerUpdateAvailable() {
    Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE, true);
}

export {triggerUpdateAvailable, updateApp};
