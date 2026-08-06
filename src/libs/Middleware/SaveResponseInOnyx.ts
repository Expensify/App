import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';

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

// These requests carry the state that unblocks authentication itself: a new session, plus the finallyData that clears
// `isAuthenticatingWithShortLivedToken`. They run while the previous session's watermark is still in Onyx, so a gap parks them,
// and a parked payload leaves that flag set, which makes `reauthenticate()` give up and every later command 407.
// `updateAuthTokenIfNecessary` only rescues a session authToken out of `response.onyxData`, never successData/finallyData,
// so a command whose client-side data gates authentication has to be applied on arrival and belongs here.
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

        // Zeroing lastUpdateID does both jobs: the payload applies now, so the new session and the flags land immediately,
        // and the watermark stays put, so the gap is still fetched by the next response that carries a previousUpdateID.
        const shouldApplyWithoutAdvancingLastUpdateID = requestsToApplyWithoutAdvancingLastUpdateID.has(request.command);

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
