import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as MemoryOnlyKeys from '../actions/MemoryOnlyKeys/MemoryOnlyKeys';
import * as OnyxUpdates from '../actions/OnyxUpdates';
import Middleware from './types';

// If we're executing any of these requests, we don't need to trigger our OnyxUpdates flow to update the current data even if our current value is out of
// date because all these requests are updating the app to the most current state.
const requestsToIgnoreLastUpdateID = ['OpenApp', 'ReconnectApp', 'GetMissingOnyxMessages'];

const SaveResponseInOnyx: Middleware = (requestResponse, request) =>
    requestResponse.then((response = {}) => {
        const onyxUpdates = response?.onyxData ?? [];

        // Sometimes we call requests that are successfull but they don't have any response or any success/failure data to set. Let's return early since
        // we don't need to store anything here.
        if (!onyxUpdates && !request.successData && !request.failureData) {
            return Promise.resolve(response);
        }

        // If there is an OnyxUpdate for using memory only keys, enable them
        onyxUpdates?.find(({key, value}) => {
            if (key !== ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS || !value) {
                return false;
            }

            MemoryOnlyKeys.enable();
            return true;
        });

        const responseToApply = {
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            lastUpdateID: Number(response?.lastUpdateID ?? 0),
            previousUpdateID: Number(response?.previousUpdateID ?? 0),
            request,
            response: response ?? {},
        };

        if (requestsToIgnoreLastUpdateID.includes(request.command) || !OnyxUpdates.doesClientNeedToBeUpdated(Number(response?.previousUpdateID ?? 0))) {
            return OnyxUpdates.apply(responseToApply);
        }

        // Save the update IDs to Onyx so they can be used to fetch incremental updates if the client gets out of sync from the server
        OnyxUpdates.saveUpdateInformation(responseToApply);

        // Ensure the queue is paused while the client resolves the gap in onyx updates so that updates are guaranteed to happen in a specific order.
        return Promise.resolve({
            ...response,
            shouldPauseQueue: true,
        });
    });

export default SaveResponseInOnyx;
