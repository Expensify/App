import Onyx from 'react-native-onyx';
import type DeferredUpdatesDictionary from '@libs/actions/OnyxUpdateManager/types';
import createTriggerPromise from '@src/../tests/utils/createTriggerPromise';
import ONYXKEYS from '@src/ONYXKEYS';
import createProxyForValue from '@src/utils/createProxyForValue';

const {initialPromises: initialApplyUpdatesTriggeredPromises, trigger: applyUpdatesTriggered, resetPromise: resetApplyUpdatesTriggered} = createTriggerPromise();

const mockValues = {
    applyUpdatesTriggered: initialApplyUpdatesTriggeredPromises,
};
const mockValuesProxy = createProxyForValue(mockValues);

const resetApplyUpdatesTriggeredPromise = () =>
    resetApplyUpdatesTriggered((newPromise, index) => {
        mockValuesProxy.applyUpdatesTriggered[index] = newPromise;
    });

const applyUpdates = jest.fn((updates: DeferredUpdatesDictionary) => {
    applyUpdatesTriggered();

    const lastUpdateIdFromUpdates = Math.max(...Object.keys(updates).map(Number));

    console.log({lastUpdateIdFromUpdates});

    const promise = Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIdFromUpdates);

    promise.finally(() => {
        resetApplyUpdatesTriggeredPromise();
    });

    return promise;
});

export {applyUpdates, mockValuesProxy};
