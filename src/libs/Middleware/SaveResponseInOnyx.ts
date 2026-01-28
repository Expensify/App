import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as OnyxUpdates from '@userActions/OnyxUpdates';
import CONST from '@src/CONST';
import type Middleware from './types';

// If we're executing any of these requests, we don't need to trigger our OnyxUpdates flow to update the current data even if our current value is out of
// date because all these requests are updating the app to the most current state.
const requestsToIgnoreLastUpdateID = new Set<string>([
    WRITE_COMMANDS.OPEN_APP,
    SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP,
    WRITE_COMMANDS.CLOSE_ACCOUNT,
    WRITE_COMMANDS.DELETE_MONEY_REQUEST,
    SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES,
]);

const SaveResponseInOnyx: Middleware = (requestResponse, request) =>
    requestResponse.then((response = {}) => {
        const onyxUpdates = response?.onyxData ?? [];

        // Sometimes we call requests that are successful but they don't have any response or any success/failure/finally data to set. Let's return early since
        // we don't need to store anything here.
        if (!onyxUpdates && !request.successData && !request.failureData && !request.finallyData) {
            return Promise.resolve(response);
        }

        const responseToApply = {
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            lastUpdateID: Number(response?.lastUpdateID ?? CONST.DEFAULT_NUMBER_ID),
            previousUpdateID: Number(response?.previousUpdateID ?? CONST.DEFAULT_NUMBER_ID),
            request,
            response: response ?? {},
        };

        if (requestsToIgnoreLastUpdateID.has(request.command) || !OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID: Number(response?.previousUpdateID ?? CONST.DEFAULT_NUMBER_ID)})) {
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
