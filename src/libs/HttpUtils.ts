import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import alert from '@components/Alert';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RequestType} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import * as NetworkActions from './actions/Network';
import * as UpdateRequired from './actions/UpdateRequired';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from './API/types';
import * as ApiUtils from './ApiUtils';
import HttpsError from './Errors/HttpsError';

let shouldFailAllRequests = false;
let shouldForceOffline = false;

Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        shouldFailAllRequests = Boolean(network.shouldFailAllRequests);
        shouldForceOffline = Boolean(network.shouldForceOffline);
    },
});

// We use the AbortController API to terminate pending request in `cancelPendingRequests`
let cancellationController = new AbortController();

// Some existing old commands (6+ years) exempted from the auth writes count check
const exemptedCommandsWithAuthWrites: string[] = ['SetWorkspaceAutoReportingFrequency'];

/**
 * The API commands that require the skew calculation
 */
const addSkewList: string[] = [SIDE_EFFECT_REQUEST_COMMANDS.OPEN_REPORT, SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_APP];

/**
 * Regex to get API command from the command
 */
const APICommandRegex = /[?&]command=([^&]+)/;

/**
 * Send an HTTP request, and attempt to resolve the json response.
 * If there is a network error, we'll set the application offline.
 */
function processHTTPRequest(url: string, method: RequestType = 'get', body: FormData | null = null, canCancel = true): Promise<Response> {
    const startTime = new Date().valueOf();
    return fetch(url, {
        // We hook requests to the same Controller signal, so we can cancel them all at once
        signal: canCancel ? cancellationController.signal : undefined,
        method,
        body,
    })
        .then((response) => {
            // We are calculating the skew to minimize the delay when posting the messages
            const match = url.match(APICommandRegex)?.[1];
            if (match && addSkewList.includes(match) && response.headers) {
                const dateHeaderValue = response.headers.get('Date');
                const serverTime = dateHeaderValue ? new Date(dateHeaderValue).valueOf() : new Date().valueOf();
                const endTime = new Date().valueOf();
                const latency = (endTime - startTime) / 2;
                const skew = serverTime - startTime + latency;
                NetworkActions.setTimeSkew(dateHeaderValue ? skew : 0);
            }
            return response;
        })
        .then((response) => {
            // Test mode where all requests will succeed in the server, but fail to return a response
            if (shouldFailAllRequests || shouldForceOffline) {
                throw new HttpsError({
                    message: CONST.ERROR.FAILED_TO_FETCH,
                });
            }

            if (!response.ok) {
                // Expensify site is down or there was an internal server error, or something temporary like a Bad Gateway, or unknown error occurred
                const serviceInterruptedStatuses: Array<ValueOf<typeof CONST.HTTP_STATUS>> = [
                    CONST.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    CONST.HTTP_STATUS.BAD_GATEWAY,
                    CONST.HTTP_STATUS.GATEWAY_TIMEOUT,
                    CONST.HTTP_STATUS.UNKNOWN_ERROR,
                ];
                if (serviceInterruptedStatuses.indexOf(response.status as ValueOf<typeof CONST.HTTP_STATUS>) > -1) {
                    throw new HttpsError({
                        message: CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED,
                        status: response.status.toString(),
                        title: 'Issue connecting to Expensify site',
                    });
                }
                if (response.status === CONST.HTTP_STATUS.TOO_MANY_REQUESTS) {
                    throw new HttpsError({
                        message: CONST.ERROR.THROTTLED,
                        status: response.status.toString(),
                        title: 'API request throttled',
                    });
                }

                throw new HttpsError({
                    message: response.statusText,
                    status: response.status.toString(),
                });
            }

            return response.json() as Promise<Response>;
        })
        .then((response) => {
            // Some retried requests will result in a "Unique Constraints Violation" error from the server, which just means the record already exists
            if (response.jsonCode === CONST.JSON_CODE.BAD_REQUEST && response.message === CONST.ERROR_TITLE.DUPLICATE_RECORD) {
                throw new HttpsError({
                    message: CONST.ERROR.DUPLICATE_RECORD,
                    status: CONST.JSON_CODE.BAD_REQUEST.toString(),
                    title: CONST.ERROR_TITLE.DUPLICATE_RECORD,
                });
            }

            // Auth is down or timed out while making a request
            if (response.jsonCode === CONST.JSON_CODE.EXP_ERROR && response.title === CONST.ERROR_TITLE.SOCKET && response.type === CONST.ERROR_TYPE.SOCKET) {
                throw new HttpsError({
                    message: CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED,
                    status: CONST.JSON_CODE.EXP_ERROR.toString(),
                    title: CONST.ERROR_TITLE.SOCKET,
                });
            }

            if (response.jsonCode === CONST.JSON_CODE.MANY_WRITES_ERROR && !exemptedCommandsWithAuthWrites.includes(response.data?.phpCommandName ?? '')) {
                if (response.data) {
                    const {phpCommandName, authWriteCommands} = response.data;
                    // eslint-disable-next-line max-len
                    const message = `The API call (${phpCommandName}) did more Auth write requests than allowed. Count ${authWriteCommands.length}, commands: ${authWriteCommands.join(
                        ', ',
                    )}. Check the APIWriteCommands class in Web-Expensify`;
                    alert('Too many auth writes', message);
                }
            }
            if (response.jsonCode === CONST.JSON_CODE.UPDATE_REQUIRED) {
                // Trigger a modal and disable the app as the user needs to upgrade to the latest minimum version to continue
                UpdateRequired.alertUser();
            }
            return response as Promise<Response>;
        });
}

/**
 * Makes XHR request
 * @param command the name of the API command
 * @param data parameters for the API command
 * @param type HTTP request type (get/post)
 * @param shouldUseSecure should we use the secure server
 */
function xhr(command: string, data: Record<string, unknown>, type: RequestType = CONST.NETWORK.METHOD.POST, shouldUseSecure = false): Promise<Response> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'undefined') {
            return;
        }
        formData.append(key, data[key] as string | Blob);
    });

    const url = ApiUtils.getCommandURL({shouldUseSecure, command});
    return processHTTPRequest(url, type, formData, Boolean(data.canCancel));
}

function cancelPendingRequests() {
    cancellationController.abort();

    // We create a new instance because once `abort()` is called any future requests using the same controller would
    // automatically get rejected: https://dom.spec.whatwg.org/#abortcontroller-api-integration
    cancellationController = new AbortController();
}

export default {
    xhr,
    cancelPendingRequests,
};
