import Onyx from 'react-native-onyx';
import type DeferredUpdatesDictionary from '@libs/actions/OnyxUpdateManager/types';
import ONYXKEYS from '@src/ONYXKEYS';

const applyUpdates = jest.fn((updates: DeferredUpdatesDictionary) => {
    const lastUpdateIdFromUpdates = Math.max(...Object.keys(updates).map(Number));
    const promise = Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIdFromUpdates);
    return promise;
});

// eslint-disable-next-line import/prefer-default-export
export {applyUpdates};
