/**
 * Marks the receipt upload error as final when the server rejects a receipt request for a reason a retry can't fix,
 * such as a report that no longer accepts expenses or a missing permission. Without it, the receipt view offers
 * Try again, which sends the same request again and gets the same rejection every time.
 */
import {isReceiptError} from '@libs/ErrorUtils';
import {isRecord} from '@libs/ObjectUtils';
import {logReceiptUploadRejected, RECEIPT_BEARING_COMMANDS} from '@libs/telemetry/ReceiptObservability';

import CONST from '@src/CONST';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/** Response codes that say "try later" rather than "this request is wrong", so Try again stays available. */
const RETRYABLE_JSON_CODES = new Set<number | string>([CONST.JSON_CODE.UPDATE_REQUIRED, CONST.JSON_CODE.TOO_MANY_REQUESTS, CONST.JSON_CODE.SERVICE_UNAVAILABLE]);

/**
 * Server messages for temporary backend failures. The backend sends these as a regular error response, so the
 * message is the only way to tell them apart from a real rejection. Matched as a prefix because the backend appends
 * details such as the Bedrock error code.
 */
const RETRYABLE_SERVER_MESSAGE_PREFIXES = ['Internal Bedrock command timeout', 'Bedrock circuit breaker open'];

function isRetryableRejection({jsonCode, message}: Pick<Response<OnyxKey>, 'jsonCode' | 'message'>): boolean {
    if (jsonCode !== undefined && RETRYABLE_JSON_CODES.has(jsonCode)) {
        return true;
    }
    return RETRYABLE_SERVER_MESSAGE_PREFIXES.some((prefix) => (message ?? '').startsWith(prefix));
}

function getErrorsMarkedAsFinal(errors: Record<string, unknown>, serverMessage: string | undefined): Record<string, unknown> {
    return Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, isReceiptError(error) ? {...error, isRetryable: false, serverMessage} : error]));
}

const HandleReceiptUploadRejection: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        if (!response || response.jsonCode === CONST.JSON_CODE.SUCCESS || !RECEIPT_BEARING_COMMANDS.has(request.command)) {
            return response;
        }

        const isRetryable = isRetryableRejection(response);
        const transactionID = request.data?.transactionID;
        logReceiptUploadRejected({
            transactionID: typeof transactionID === 'string' ? transactionID : undefined,
            command: request.command,
            jsonCode: response.jsonCode,
            errorMessage: response.message,
            isRetryable,
        });

        if (isRetryable || !request.failureData) {
            return response;
        }

        // SaveResponseInOnyx applies this request's failureData right after this middleware, so marking it here means
        // the error lands as final in one write. Merging a flag afterwards could be overwritten, because write
        // requests queue their updates until the sequential queue flushes. The failure data belongs to this request
        // alone and is discarded once it's applied, so it's safe to change in place.
        for (const update of request.failureData) {
            const value: unknown = update.value;
            if (!isRecord(value)) {
                continue;
            }
            // Receipt errors sit on the transaction (`{errors}`) and on report actions (`{[reportActionID]: {errors}}`), so both levels are checked.
            for (const container of [value, ...Object.values(value)]) {
                if (isRecord(container) && isRecord(container.errors)) {
                    container.errors = getErrorsMarkedAsFinal(container.errors, response.message);
                }
            }
        }
        return response;
    });

export default HandleReceiptUploadRejection;
