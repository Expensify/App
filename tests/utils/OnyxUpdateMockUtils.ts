import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

const createUpdate = <TKey extends OnyxKey>(lastUpdateID: number, successData: Array<OnyxUpdate<TKey>> = [], previousUpdateID?: number): OnyxUpdatesFromServer<TKey> => ({
    type: CONST.ONYX_UPDATE_TYPES.HTTPS,
    lastUpdateID,
    previousUpdateID: previousUpdateID ?? lastUpdateID - 1,
    request: {
        command: 'TestCommand',
        data: {apiRequestType: 'TestType'},
        successData,
        failureData: [],
        finallyData: [],
        optimisticData: [],
    },
    response: {
        jsonCode: 200,
        lastUpdateID,
        previousUpdateID: previousUpdateID ?? lastUpdateID - 1,
        onyxData: successData,
    },
});

const createPendingUpdate = (lastUpdateID: number): OnyxUpdatesFromServer<never> => ({
    type: CONST.ONYX_UPDATE_TYPES.AIRSHIP,
    lastUpdateID,
    shouldFetchPendingUpdates: true,
    updates: [],
});

const OnyxUpdateMockUtils = {
    createUpdate,
    createPendingUpdate,
};

export default OnyxUpdateMockUtils;
