import isEqual from 'lodash/isEqual';
import lodashMerge from 'lodash/merge';
import Onyx, {OnyxUpdate} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {Request} from '@src/types/onyx';

let persistedRequests: Request[] = [];

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => (persistedRequests = val ?? []),
});

/**
 * This promise is only used by tests. DO NOT USE THIS PROMISE IN THE APPLICATION CODE
 */
function clear() {
    return Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

/**
 * Method to merge two arrays of OnyxUpdate elements.
 * Elements from the old array which keys are not present in the new array are merged with the data of the new array.
 */
function mergeOnyxUpdateData(oldData: OnyxUpdate[] = [], newData: OnyxUpdate[] = []): OnyxUpdate[] {
    const mergedData = [...newData];

    oldData.forEach((oldUpdate) => {
        const hasSameKey = newData.some((newUpdate) => newUpdate.key === oldUpdate.key);

        if (!hasSameKey) {
            mergedData.push(oldUpdate);
        }
    });

    return mergedData;
}

function createUpdatedRequest(oldRequest: Request, newRequest: Request): Request {
    /**
     * In order to create updated request, properties: data, failureData, successData and optimisticData have to be merged
     */
    const updatedRequest = {
        data: lodashMerge({...oldRequest.data}, newRequest.data),
        failureData: mergeOnyxUpdateData(oldRequest.failureData, newRequest.failureData),
        successData: mergeOnyxUpdateData(oldRequest.successData, newRequest.successData),
        ...newRequest,
    };

    const updatedOptimisticData = mergeOnyxUpdateData(oldRequest.optimisticData, newRequest.optimisticData);

    if (updatedOptimisticData.length > 0) {
        updatedRequest.optimisticData = updatedOptimisticData;
    }

    return updatedRequest;
}

function save(requestsToPersist: Request[]) {
    let requests: Request[] = [];

    if (persistedRequests.length) {
        requests = [...persistedRequests];
        /**
         * When we add a new request to the persistedRequests array, firstly we should check if the array already contains a request with the same idempotency key as the new request.
         * If we find a matching request, we should update it, otherwise the new request will be added to the array.
         */
        requestsToPersist.forEach((requestToPersist) => {
            const index = persistedRequests.findIndex((persistedRequest) => !!requestToPersist.idempotencyKey && requestToPersist.idempotencyKey === persistedRequest.idempotencyKey);
            if (index > -1) {
                requests[index] = createUpdatedRequest(requests[index], requestToPersist);
            } else {
                requests.push(requestToPersist);
            }
        });
    } else {
        requests = requestsToPersist;
    }
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function remove(requestToRemove: Request) {
    /**
     * We only remove the first matching request because the order of requests matters.
     * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
     */
    const requests = [...persistedRequests];
    const index = requests.findIndex((persistedRequest) => isEqual(persistedRequest, requestToRemove));
    if (index === -1) {
        return;
    }
    requests.splice(index, 1);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function update(oldRequestIndex: number, newRequest: Request) {
    const requests = [...persistedRequests];
    requests.splice(oldRequestIndex, 1, newRequest);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function getAll(): Request[] {
    return persistedRequests;
}

export {clear, save, getAll, remove, update};
