import {READ_COMMANDS} from '@libs/API/types';

import * as OnyxUpdates from '@userActions/OnyxUpdates';

import CONST from '@src/CONST';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import type OnyxRequest from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

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

        if (
            shouldApplyWithoutAdvancingLastUpdateID ||
            OnyxUpdates.requestsToIgnoreLastUpdateID.has(request.command) ||
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
