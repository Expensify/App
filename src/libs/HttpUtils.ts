import axios from 'axios';
import type {AxiosError, AxiosProgressEvent, AxiosResponse} from 'axios';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import alert from '@components/Alert';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RequestType} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import {setTimeSkew} from './actions/Network';
import {alertUser} from './actions/UpdateRequired';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from './API/types';
import {getCommandURL} from './ApiUtils';
import HttpsError from './Errors/HttpsError';
import prepareRequestPayload from './prepareRequestPayload';

let shouldFailAllRequests = false;
let shouldForceOffline = false;

const ABORT_COMMANDS = {
    All: 'All',
    [READ_COMMANDS.SEARCH_FOR_REPORTS]: READ_COMMANDS.SEARCH_FOR_REPORTS,
} as const;

type AbortCommand = keyof typeof ABORT_COMMANDS;

Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        shouldFailAllRequests = !!network.shouldFailAllRequests;
        shouldForceOffline = !!network.shouldForceOffline;
    },
});

// We use the AbortController API to terminate pending request in `cancelPendingRequests`
const abortControllerMap = new Map<AbortCommand, AbortController>();
abortControllerMap.set(ABORT_COMMANDS.All, new AbortController());
abortControllerMap.set(ABORT_COMMANDS.SearchForReports, new AbortController());

/**
 * The API commands that require the skew calculation
 */
const addSkewList: string[] = [WRITE_COMMANDS.OPEN_REPORT, SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_APP];

/**
 * Regex to get API command from the command
 */
const APICommandRegex = /\/api\/([^&?]+)\??.*/;

/**
 * Send an HTTP request, and attempt to resolve the json response.
 * If there is a network error, we'll set the application offline.
 */
function processHTTPRequest(url: string, method: RequestType = 'get', body: FormData | null = null, abortSignal: AbortSignal | undefined = undefined): Promise<Response> {
    const startTime = new Date().valueOf();
    let shouldTrackProgress = false;

    // Upload progress tracking for diagnostic purposes
    const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
        if (!progressEvent.total || !progressEvent.loaded) {
            return;
        }

        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

        // If the request is complete and we haven't started tracking progress, skip
        if (percentCompleted === 100 && !shouldTrackProgress) {
            return;
        }
        shouldTrackProgress = true;

        const uploadedMB = (progressEvent.loaded / (1024 * 1024)).toFixed(2);
        const totalMB = (progressEvent.total / (1024 * 1024)).toFixed(2);

        // Log upload progress for diagnostic purposes
        // eslint-disable-next-line no-console
        Log.info(`[HttpUtils] ${url}> Upload Progress: ${percentCompleted}% (${uploadedMB}MB / ${totalMB}MB)`);
    };

    return axios({
        url,
        method: method.toLowerCase(),
        data: body,
        // We hook requests to the same Controller signal, so we can cancel them all at once
        signal: abortSignal,
        // On Web fetch already defaults to 'omit' for credentials, but it seems that this is not the case for the ReactNative implementation
        // so to avoid sending cookies with the request we set it to false explicitly
        // this avoids us sending specially the expensifyWeb cookie, which makes a CSRF token required
        // more on that here: https://stackoverflowteams.com/c/expensify/questions/93
        withCredentials: false,
        // Add upload progress tracking - only relevant for requests with body data (file uploads)
        onUploadProgress: body ? onUploadProgress : undefined,
        // Disable automatic JSON parsing to handle errors manually like the original fetch implementation
        transformResponse: [(data: string) => data],
        // Disable automatic error throwing for non-2xx status codes to match fetch behavior
        validateStatus: () => true,
    })
        .then((response: AxiosResponse<string>) => {
            // We are calculating the skew to minimize the delay when posting the messages
            const match = url.match(APICommandRegex)?.[1];
            if (match && addSkewList.includes(match) && response.headers) {
                const dateHeaderValue = (response.headers.date as string) || (response.headers.Date as string);
                const serverTime = dateHeaderValue ? new Date(dateHeaderValue).valueOf() : new Date().valueOf();
                const endTime = new Date().valueOf();
                const latency = (endTime - startTime) / 2;
                const skew = serverTime - startTime + latency;
                setTimeSkew(dateHeaderValue ? skew : 0);
            }
            return response;
        })
        .then((response: AxiosResponse<string>) => {
            // Test mode where all requests will succeed in the server, but fail to return a response
            if (shouldFailAllRequests || shouldForceOffline) {
                throw new HttpsError({
                    message: CONST.ERROR.FAILED_TO_FETCH,
                });
            }

            // Check if response is not ok (axios doesn't throw for non-2xx when validateStatus returns true)
            if (response.status < 200 || response.status >= 300) {
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

            // Parse JSON manually since we disabled automatic parsing
            const jsonResponse = JSON.parse(response.data) as Response;
            return jsonResponse;
        })
        .then((response: Response) => {
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

            if (response.data && (response.data?.authWriteCommands?.length ?? 0)) {
                const {phpCommandName, authWriteCommands} = response.data;
                const message = `The API command ${phpCommandName} is doing too many Auth writes. Count ${authWriteCommands.length}, commands: ${authWriteCommands.join(
                    ', ',
                )}. If you modified this command, you MUST refactor it to remove the extra Auth writes. Otherwise, update the allowed write count in Web-Expensify APIWriteCommands.`;
                alert('Too many auth writes', message);
            }
            if (response.jsonCode === CONST.JSON_CODE.UPDATE_REQUIRED) {
                // Trigger a modal and disable the app as the user needs to upgrade to the latest minimum version to continue
                alertUser();
            }
            return response as Promise<Response>;
        })
        .catch((error: AxiosError | HttpsError) => {
            // If it's already an HttpsError, re-throw it
            if (error instanceof HttpsError) {
                throw error;
            }

            // Handle axios-specific errors and convert them to match the original fetch error behavior
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new HttpsError({
                    message: CONST.ERROR.FAILED_TO_FETCH,
                });
            }

            // For network errors or other axios errors, throw a generic fetch error
            throw new HttpsError({
                message: CONST.ERROR.FAILED_TO_FETCH,
            });
        });
}

/**
 * Makes XHR request
 * @param command the name of the API command
 * @param data parameters for the API command
 * @param type HTTP request type (get/post)
 * @param shouldUseSecure should we use the secure server
 */
function xhr(command: string, data: Record<string, unknown>, type: RequestType = CONST.NETWORK.METHOD.POST, shouldUseSecure = false, initiatedOffline = false): Promise<Response> {
    return prepareRequestPayload(command, data, initiatedOffline).then((formData) => {
        const url = getCommandURL({shouldUseSecure, command});
        const abortSignalController = data.canCancel ? (abortControllerMap.get(command as AbortCommand) ?? abortControllerMap.get(ABORT_COMMANDS.All)) : undefined;

        return processHTTPRequest(url, type, formData, abortSignalController?.signal);
    });
}

function cancelPendingRequests(command: AbortCommand = ABORT_COMMANDS.All) {
    const controller = abortControllerMap.get(command);

    controller?.abort();

    // We create a new instance because once `abort()` is called any future requests using the same controller would
    // automatically get rejected: https://dom.spec.whatwg.org/#abortcontroller-api-integration
    abortControllerMap.set(command, new AbortController());
}

export default {
    xhr,
    cancelPendingRequests,
};
