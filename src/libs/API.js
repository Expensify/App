import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as Request from './Request';
import * as SequentialQueue from './Network/SequentialQueue';
import {version} from '../../package.json';

function write(command, apiCommandParameters = {}, onyxData = {}) {
    // Optimistically update Onyx
    if (onyxData.optimisticData) {
        Onyx.update(onyxData.optimisticData);
    }

    // Assemble the data we'll send to the API
    const data = {
        ...apiCommandParameters,
        appversion: version,
    };

    // Assemble all the request data we'll be storing in the queue
    const request = {
        command,
        data,
        ..._.omit(onyxData, 'optimisticData'),
    };

    // Write commands can be saved and retried, so push it to the SequentialQueue
    SequentialQueue.push(request);
}

function makeRequestWithSideEffects(command, apiCommandParameters = {}, onyxData = {}) {
    // Optimistically update Onyx
    if (onyxData.optimisticData) {
        Onyx.update(onyxData.optimisticData);
    }

    // Assemble the data we'll send to the API
    const data = {
        ...apiCommandParameters,
        appversion: version,
    };

    // Assemble all the request data we'll be storing
    const request = {
        command,
        data,
        ..._.omit(onyxData, 'optimisticData'),
    };

    // Return a promise containing the response from HTTPS
    return Request.processWithMiddleware(request);
}

function read(command, apiCommandParameters, onyxData) {
    makeRequestWithSideEffects(command, apiCommandParameters, onyxData);
}

export {
    write,
    makeRequestWithSideEffects,
    read,
};
