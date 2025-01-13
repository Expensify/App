import type {OnyxUpdate} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

const createUpdate = (lastUpdateID: number, successData: OnyxUpdate[] = [], previousUpdateID?: number): OnyxUpdatesFromServer => ({
    type: CONST.ONYX_UPDATE_TYPES.HTTPS,
    lastUpdateID,
    previousUpdateID: previousUpdateID ?? lastUpdateID - 1,
    request: {
        command: 'TestCommand',
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

const createPendingUpdate = (lastUpdateID: number): OnyxUpdatesFromServer => ({
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
