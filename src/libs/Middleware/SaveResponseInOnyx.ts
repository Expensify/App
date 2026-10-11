import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import {reconnectApp} from '@userActions/App';
import * as OnyxUpdates from '@userActions/OnyxUpdates';

import CONST from '@src/CONST';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import type OnyxRequest from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

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

// These requests already bring the client up to date (or end the session), so they never need a full ReconnectApp to cover a gap in update IDs.
// This is separate from requestsToIgnoreLastUpdateID because requests like DeleteMoneyRequest skip the OnyxUpdates flow but still move lastUpdateID forward.
const requestsExemptFromFullReconnect =new Set<string>([
    WRITE_COMMANDS.OPEN_APP,
    SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP,
    SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES,
    WRITE_COMMANDS.CLOSE_ACCOUNT,
]);

// A request belongs here when its successData/finallyData is what unblocks authentication, because parking that leaves the client unable to reauthenticate.
const requestsToApplyWithoutAdvancingLastUpdateID = new Set<string>([READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN, READ_COMMANDS.SIGN_IN_WITH_SUPPORT_AUTH_TOKEN]);

const SaveResponseInOnyx: Middleware = <TKey extends OnyxKey>(requestResponse: Promise<Response<TKey> | void>, request: OnyxRequest<TKey>) =>
    requestResponse.then((response = {}) => {
        const onyxUpdates = response?.onyxData ?? [];

        // Sometimes we call requests that are successful but they don't have any response or any success/failure/finally data to set. Let's return early since
        // we don't need to store anything here.
        if (!onyxUpdates && !request.successData && !request.failureData && !request.finallyData) {
            return Promise.resolve(response);
        }

        const responseToApply: OnyxUpdatesFromServer<TKey> = {
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            lastUpdateID: Number(response?.lastUpdateID ?? CONST.DEFAULT_NUMBER_ID),
            previousUpdateID: Number(response?.previousUpdateID ?? CONST.DEFAULT_NUMBER_ID),
            request,
            response: response ?? {},
        };

        const shouldApplyWithoutAdvancingLastUpdateID = requestsToApplyWithoutAdvancingLastUpdateID.has(request.command);

        // The server only keeps recent update IDs. When a client comes back after a long time, the server no longer knows its
        // lastUpdateIDAppliedToClient and answers a request with a lastUpdateID but no previousUpdateID. Applying that response moves
        // the client's lastUpdateID forward past updates it never received, so an incremental ReconnectApp can't recover them.
        // Run a full ReconnectApp after applying so the client gets everything in the gap.
        const clientLastUpdateID = OnyxUpdates.getPersistedLastUpdateID();
        const responseLastUpdateID = Number(response?.lastUpdateID ?? CONST.DEFAULT_NUMBER_ID);
        const shouldFullReconnectAfterApply =
            !shouldApplyWithoutAdvancingLastUpdateID &&
            !requestsExemptFromFullReconnect.has(request.command) &&
            !!clientLastUpdateID &&
            responseLastUpdateID > clientLastUpdateID &&
            !Number(response?.previousUpdateID ?? CONST.DEFAULT_NUMBER_ID);

        if (shouldFullReconnectAfterApply) {
            Log.info('[SaveResponseInOnyx] Response has a lastUpdateID but no previousUpdateID, running a full ReconnectApp after applying it', false, {
                command: request.command,
                clientLastUpdateID,
                responseLastUpdateID,
            });
            return OnyxUpdates.apply(responseToApply).then((appliedResponse) => {
                reconnectApp();
                return appliedResponse;
            });
        }

        if (
            shouldApplyWithoutAdvancingLastUpdateID ||
            requestsToIgnoreLastUpdateID.has(request.command) ||
            !OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID: Number(response?.previousUpdateID ?? CONST.DEFAULT_NUMBER_ID)})
        ) {
            return OnyxUpdates.apply(shouldApplyWithoutAdvancingLastUpdateID ? {...responseToApply, lastUpdateID: CONST.DEFAULT_NUMBER_ID} : responseToApply);
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
