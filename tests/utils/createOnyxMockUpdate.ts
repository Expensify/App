import type {OnyxUpdate} from 'react-native-onyx';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

const createOnyxMockUpdate = (lastUpdateID: number, successData: OnyxUpdate[] = [], previousUpdateIDOffset = 1): OnyxUpdatesFromServer => ({
    type: 'https',
    lastUpdateID,
    previousUpdateID: lastUpdateID - previousUpdateIDOffset,
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
        previousUpdateID: lastUpdateID - previousUpdateIDOffset,
        onyxData: successData,
    },
});

export default createOnyxMockUpdate;
