import type {OnyxUpdate} from 'react-native-onyx';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';

const createOnyxMockUpdate = (lastUpdateID: number, successData: OnyxUpdate[] = []): OnyxUpdatesFromServer => ({
    type: 'https',
    lastUpdateID,
    previousUpdateID: lastUpdateID - 1,
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
        previousUpdateID: lastUpdateID - 1,
        onyxData: successData,
    },
});

export default createOnyxMockUpdate;
