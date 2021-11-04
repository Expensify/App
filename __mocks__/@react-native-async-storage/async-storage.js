import {jest} from '@jest/globals';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';

let asyncStorageDelay = 0;
function addDelayToGetItem(delay) {
    asyncStorageDelay = delay;
}

export default {
    ...AsyncStorageMock,
    getItem: jest.fn(params => AsyncStorageMock.getItem(params).then(result => new Promise((resolve) => {
        if (asyncStorageDelay > 0) {
            setTimeout(() => {
                resolve(result);
            }, asyncStorageDelay);
        } else {
            resolve(result);
        }
    }))),
    addDelayToGetItem,
};
