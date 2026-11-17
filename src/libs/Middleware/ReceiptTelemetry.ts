/**
 * Logs the sent and serverResult steps of the receipt trail for every attempt of a request that creates, edits, moves,
 * merges or deletes an expense. It sits right after Logging, so a 407 that Reauthentication replays shows up as two
 * attempts instead of one.
 */
import type HttpsError from '@libs/Errors/HttpsError';
import {getReceiptTrailFields, getResponseResultClass, getThrownErrorResultClass, logReceiptSent, logReceiptServerResult, RECEIPT_TRAIL_COMMANDS} from '@libs/telemetry/ReceiptObservability';

import CONST from '@src/CONST';

import type Middleware from './types';

/** A thrown error carries the HTTP or json code as a string, and an empty one when the request never got an answer. */
function getThrownErrorCode(status: string | undefined): number {
    const code = Number.parseInt(status ?? '', 10);
    return Number.isNaN(code) ? CONST.JSON_CODE.NO_RESPONSE : code;
}

const ReceiptTelemetry: Middleware = (response, request) => {
    const {command} = request;
    if (!RECEIPT_TRAIL_COMMANDS.has(command)) {
        return response;
    }

    const fields = getReceiptTrailFields(request.data);
    if (fields.hasReceipt) {
        logReceiptSent({command, fields});
    }

    return response
        .then((data) => {
            if (data) {
                logReceiptServerResult({
                    command,
                    fields,
                    resultClass: getResponseResultClass(data.jsonCode),
                    jsonCode: data.jsonCode,
                    requestID: data.requestID,
                    serverMessage: data.message,
                });
            }
            return data;
        })
        .catch((error: HttpsError) => {
            logReceiptServerResult({
                command,
                fields,
                resultClass: getThrownErrorResultClass(error.name, error.message),
                jsonCode: getThrownErrorCode(error.status),
                requestID: error.requestID,
                errorMessage: error.message,
                serverMessage: error.title,
            });
            throw error;
        });
};

export default ReceiptTelemetry;
