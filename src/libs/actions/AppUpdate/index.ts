import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import updateApp from './updateApp';

function triggerUpdateAvailable() {
    Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE, true);
}

/**
 * Records that the running app version is a beta build. The version is stored rather than a flag so the verdict is
 * discarded as soon as the app updates, instead of pinning a newer build to a stale answer.
 */
function setBetaBuildVersion(version: string) {
    Onyx.set(ONYXKEYS.BETA_BUILD_VERSION, version);
}

export {triggerUpdateAvailable, setBetaBuildVersion, updateApp};
