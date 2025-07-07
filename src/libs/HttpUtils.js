"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var Alert_1 = require("@components/Alert");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Network_1 = require("./actions/Network");
var UpdateRequired_1 = require("./actions/UpdateRequired");
var types_1 = require("./API/types");
var ApiUtils_1 = require("./ApiUtils");
var HttpsError_1 = require("./Errors/HttpsError");
var prepareRequestPayload_1 = require("./prepareRequestPayload");
var shouldFailAllRequests = false;
var shouldForceOffline = false;
var ABORT_COMMANDS = (_a = {
        All: 'All'
    },
    _a[types_1.READ_COMMANDS.SEARCH_FOR_REPORTS] = types_1.READ_COMMANDS.SEARCH_FOR_REPORTS,
    _a);
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NETWORK,
    callback: function (network) {
        if (!network) {
            return;
        }
        shouldFailAllRequests = !!network.shouldFailAllRequests;
        shouldForceOffline = !!network.shouldForceOffline;
    },
});
// We use the AbortController API to terminate pending request in `cancelPendingRequests`
var abortControllerMap = new Map();
abortControllerMap.set(ABORT_COMMANDS.All, new AbortController());
abortControllerMap.set(ABORT_COMMANDS.SearchForReports, new AbortController());
/**
 * The API commands that require the skew calculation
 */
var addSkewList = [types_1.WRITE_COMMANDS.OPEN_REPORT, types_1.SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP, types_1.WRITE_COMMANDS.OPEN_APP];
/**
 * Regex to get API command from the command
 */
var APICommandRegex = /\/api\/([^&?]+)\??.*/;
/**
 * Send an HTTP request, and attempt to resolve the json response.
 * If there is a network error, we'll set the application offline.
 */
function processHTTPRequest(url, method, body, abortSignal) {
    if (method === void 0) { method = 'get'; }
    if (body === void 0) { body = null; }
    if (abortSignal === void 0) { abortSignal = undefined; }
    var startTime = new Date().valueOf();
    return fetch(url, {
        // We hook requests to the same Controller signal, so we can cancel them all at once
        signal: abortSignal,
        method: method,
        body: body,
        // On Web fetch already defaults to 'omit' for credentials, but it seems that this is not the case for the ReactNative implementation
        // so to avoid sending cookies with the request we set it to 'omit' explicitly
        // this avoids us sending specially the expensifyWeb cookie, which makes a CSRF token required
        // more on that here: https://stackoverflowteams.com/c/expensify/questions/93
        credentials: 'omit',
    })
        .then(function (response) {
        var _a;
        // We are calculating the skew to minimize the delay when posting the messages
        var match = (_a = url.match(APICommandRegex)) === null || _a === void 0 ? void 0 : _a[1];
        if (match && addSkewList.includes(match) && response.headers) {
            var dateHeaderValue = response.headers.get('Date');
            var serverTime = dateHeaderValue ? new Date(dateHeaderValue).valueOf() : new Date().valueOf();
            var endTime = new Date().valueOf();
            var latency = (endTime - startTime) / 2;
            var skew = serverTime - startTime + latency;
            (0, Network_1.setTimeSkew)(dateHeaderValue ? skew : 0);
        }
        return response;
    })
        .then(function (response) {
        // Test mode where all requests will succeed in the server, but fail to return a response
        if (shouldFailAllRequests || shouldForceOffline) {
            throw new HttpsError_1.default({
                message: CONST_1.default.ERROR.FAILED_TO_FETCH,
            });
        }
        if (!response.ok) {
            // Expensify site is down or there was an internal server error, or something temporary like a Bad Gateway, or unknown error occurred
            var serviceInterruptedStatuses = [
                CONST_1.default.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                CONST_1.default.HTTP_STATUS.BAD_GATEWAY,
                CONST_1.default.HTTP_STATUS.GATEWAY_TIMEOUT,
                CONST_1.default.HTTP_STATUS.UNKNOWN_ERROR,
            ];
            if (serviceInterruptedStatuses.indexOf(response.status) > -1) {
                throw new HttpsError_1.default({
                    message: CONST_1.default.ERROR.EXPENSIFY_SERVICE_INTERRUPTED,
                    status: response.status.toString(),
                    title: 'Issue connecting to Expensify site',
                });
            }
            if (response.status === CONST_1.default.HTTP_STATUS.TOO_MANY_REQUESTS) {
                throw new HttpsError_1.default({
                    message: CONST_1.default.ERROR.THROTTLED,
                    status: response.status.toString(),
                    title: 'API request throttled',
                });
            }
            throw new HttpsError_1.default({
                message: response.statusText,
                status: response.status.toString(),
            });
        }
        return response.json();
    })
        .then(function (response) {
        var _a, _b, _c;
        // Some retried requests will result in a "Unique Constraints Violation" error from the server, which just means the record already exists
        if (response.jsonCode === CONST_1.default.JSON_CODE.BAD_REQUEST && response.message === CONST_1.default.ERROR_TITLE.DUPLICATE_RECORD) {
            throw new HttpsError_1.default({
                message: CONST_1.default.ERROR.DUPLICATE_RECORD,
                status: CONST_1.default.JSON_CODE.BAD_REQUEST.toString(),
                title: CONST_1.default.ERROR_TITLE.DUPLICATE_RECORD,
            });
        }
        // Auth is down or timed out while making a request
        if (response.jsonCode === CONST_1.default.JSON_CODE.EXP_ERROR && response.title === CONST_1.default.ERROR_TITLE.SOCKET && response.type === CONST_1.default.ERROR_TYPE.SOCKET) {
            throw new HttpsError_1.default({
                message: CONST_1.default.ERROR.EXPENSIFY_SERVICE_INTERRUPTED,
                status: CONST_1.default.JSON_CODE.EXP_ERROR.toString(),
                title: CONST_1.default.ERROR_TITLE.SOCKET,
            });
        }
        if (response.data && ((_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.authWriteCommands) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0)) {
            var _d = response.data, phpCommandName = _d.phpCommandName, authWriteCommands = _d.authWriteCommands;
            var message = "The API command ".concat(phpCommandName, " is doing too many Auth writes. Count ").concat(authWriteCommands.length, ", commands: ").concat(authWriteCommands.join(', '), ". If you modified this command, you MUST refactor it to remove the extra Auth writes. Otherwise, update the allowed write count in Web-Expensify APIWriteCommands.");
            (0, Alert_1.default)('Too many auth writes', message);
        }
        if (response.jsonCode === CONST_1.default.JSON_CODE.UPDATE_REQUIRED) {
            // Trigger a modal and disable the app as the user needs to upgrade to the latest minimum version to continue
            (0, UpdateRequired_1.alertUser)();
        }
        return response;
    });
}
/**
 * Makes XHR request
 * @param command the name of the API command
 * @param data parameters for the API command
 * @param type HTTP request type (get/post)
 * @param shouldUseSecure should we use the secure server
 */
function xhr(command, data, type, shouldUseSecure, initiatedOffline) {
    if (type === void 0) { type = CONST_1.default.NETWORK.METHOD.POST; }
    if (shouldUseSecure === void 0) { shouldUseSecure = false; }
    if (initiatedOffline === void 0) { initiatedOffline = false; }
    return (0, prepareRequestPayload_1.default)(command, data, initiatedOffline).then(function (formData) {
        var _a;
        var url = (0, ApiUtils_1.getCommandURL)({ shouldUseSecure: shouldUseSecure, command: command });
        var abortSignalController = data.canCancel ? ((_a = abortControllerMap.get(command)) !== null && _a !== void 0 ? _a : abortControllerMap.get(ABORT_COMMANDS.All)) : undefined;
        return processHTTPRequest(url, type, formData, abortSignalController === null || abortSignalController === void 0 ? void 0 : abortSignalController.signal);
    });
}
function cancelPendingRequests(command) {
    if (command === void 0) { command = ABORT_COMMANDS.All; }
    var controller = abortControllerMap.get(command);
    controller === null || controller === void 0 ? void 0 : controller.abort();
    // We create a new instance because once `abort()` is called any future requests using the same controller would
    // automatically get rejected: https://dom.spec.whatwg.org/#abortcontroller-api-integration
    abortControllerMap.set(command, new AbortController());
}
exports.default = {
    xhr: xhr,
    cancelPendingRequests: cancelPendingRequests,
};
