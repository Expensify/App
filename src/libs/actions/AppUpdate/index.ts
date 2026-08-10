import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import updateApp from './updateApp';

function triggerUpdateAvailable() {
    Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE, true);
}

/**
 * Records that the running app version is a beta build. Storing the version rather than a flag discards the verdict
 * as soon as the app updates.
 */
function setBetaBuildVersion(version: string) {
    Onyx.set(ONYXKEYS.BETA_BUILD_VERSION, version);
}

export {triggerUpdateAvailable, setBetaBuildVersion, updateApp};
