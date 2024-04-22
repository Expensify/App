import Onyx from 'react-native-onyx';
import type DeferredUpdatesDictionary from '@libs/actions/OnyxUpdateManager/types';
import ONYXKEYS from '@src/ONYXKEYS';
import createTriggerPromise from '@src/utils/createTriggerPromise';

const {promise: applyUpdatesTriggeredPromise, trigger: applyUpdatesTriggered, resetPromise: resetApplyUpdatesTriggeredPromise} = createTriggerPromise();

const applyUpdates = jest.fn((updates: DeferredUpdatesDictionary) => {
    console.log('apply updates');

    applyUpdatesTriggered();

    const lastUpdateIdFromUpdates = Math.max(...Object.keys(updates).map(Number));

    const promise = Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIdFromUpdates);

    promise.finally(() => {
        resetApplyUpdatesTriggeredPromise();
    });

    promise
        .then(() => {
            console.log('applyUpdates succeeded');
        })
        .catch((e) => {
            console.log('applyUpdates failed', e);
        });

    return promise;
});

export {applyUpdates, applyUpdatesTriggeredPromise};
