import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as OnyxUpdates from '@userActions/OnyxUpdates';
import Log from '@libs/Log';
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

        // Log all API responses, especially for update commands
        const isUpdateCommand = request.command?.includes('UPDATE') || request.command?.includes('CREATE') || request.command?.includes('DELETE');
        if (isUpdateCommand || request.command === WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY || request.command === WRITE_COMMANDS.TRACK_EXPENSE) {
            // Log.info signature accepts 3 arguments in practice (message, shouldLogToConsole, data) - matching existing code patterns
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Log.info('[API_DEBUG] SaveResponseInOnyx - API response received', false, {
                command: request.command,
                jsonCode: response?.jsonCode,
                requestID: response?.requestID,
                transactionID: request?.data?.transactionID,
                hasOnyxData: !!onyxUpdates,
                onyxDataCount: onyxUpdates?.length ?? 0,
                errorMessage: response?.jsonCode !== 200 ? response?.message : undefined,
            });
        }

        // Log receipt state updates for TrackExpense and RequestMoney responses
        if (request.command === WRITE_COMMANDS.TRACK_EXPENSE || request.command === WRITE_COMMANDS.REQUEST_MONEY) {
            const transactionID = request?.data?.transactionID;
            const receiptStateInRequest = request?.data?.receiptState;
            
            // Check if response contains receipt state updates
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const receiptStateUpdates = onyxUpdates?.filter((update: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                if (update.key?.includes('transactions_')) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                    const receiptState = update.value?.receipt?.state;
                    return receiptState !== undefined;
                }
                return false;
            }) ?? [];
            
            Log.info(`[SCAN_DEBUG] SaveResponseInOnyx - ${request.command} response received`, false, {
                command: request.command,
                transactionID,
                jsonCode: response?.jsonCode,
                receiptStateInRequest,
                hasOnyxData: !!onyxUpdates,
                onyxDataCount: onyxUpdates?.length ?? 0,
                receiptStateUpdatesCount: receiptStateUpdates.length,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                receiptStateUpdates: receiptStateUpdates.map((update: any) => ({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
                    transactionID: update.key?.replace('transactions_', ''),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                    newReceiptState: update.value?.receipt?.state,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                    stateChanged: update.value?.receipt?.state !== receiptStateInRequest,
                })),
            });
        }

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

        // Log before calling OnyxUpdates.apply for TRACK_EXPENSE and REQUEST_MONEY
        if (request.command === WRITE_COMMANDS.TRACK_EXPENSE || request.command === WRITE_COMMANDS.REQUEST_MONEY) {
            Log.info(`[API_DEBUG] SaveResponseInOnyx - About to call OnyxUpdates.apply for ${request.command}`, false, {
                command: request.command,
                transactionID: request?.data?.transactionID,
                receiptState: request?.data?.receiptState,
                jsonCode: response?.jsonCode,
                lastUpdateID: responseToApply.lastUpdateID,
                previousUpdateID: responseToApply.previousUpdateID,
                willIgnoreLastUpdateID: requestsToIgnoreLastUpdateID.has(request.command),
                hasOnyxData: !!onyxUpdates,
                onyxDataCount: onyxUpdates?.length ?? 0,
            });
        }
        
        if (requestsToIgnoreLastUpdateID.has(request.command) || !OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID: Number(response?.previousUpdateID ?? CONST.DEFAULT_NUMBER_ID)})) {
            // Log after calling OnyxUpdates.apply for TRACK_EXPENSE and REQUEST_MONEY
            if (request.command === WRITE_COMMANDS.TRACK_EXPENSE || request.command === WRITE_COMMANDS.REQUEST_MONEY) {
                Log.info(`[API_DEBUG] SaveResponseInOnyx - Calling OnyxUpdates.apply for ${request.command}`, false, {
                    command: request.command,
                    transactionID: request?.data?.transactionID,
                    receiptState: request?.data?.receiptState,
                });
            }
            
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
