"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.write = write;
exports.makeRequestWithSideEffects = makeRequestWithSideEffects;
exports.read = read;
exports.paginate = paginate;
exports.writeWithNoDuplicatesConflictAction = writeWithNoDuplicatesConflictAction;
exports.writeWithNoDuplicatesEnableFeatureConflicts = writeWithNoDuplicatesEnableFeatureConflicts;
var react_native_onyx_1 = require("react-native-onyx");
var RequestConflictUtils_1 = require("@libs/actions/RequestConflictUtils");
var Log_1 = require("@libs/Log");
var Middleware_1 = require("@libs/Middleware");
var NetworkStore_1 = require("@libs/Network/NetworkStore");
var SequentialQueue_1 = require("@libs/Network/SequentialQueue");
var Pusher_1 = require("@libs/Pusher");
var Request_1 = require("@libs/Request");
var PersistedRequests_1 = require("@userActions/PersistedRequests");
var CONST_1 = require("@src/CONST");
var types_1 = require("./types");
// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Save the Response in Onyx. Errors thrown in one middleware will bubble to the next.
// e.g. an error thrown in Logging or Reauthenticate logic will be caught by the next middleware or the SequentialQueue which retries failing requests.
// Logging - Logs request details and errors.
(0, Request_1.use)(Middleware_1.Logging);
// RecheckConnection - Sets a timer for a request that will "recheck" if we are connected to the internet if time runs out. Also triggers the connection recheck when we encounter any error.
(0, Request_1.use)(Middleware_1.RecheckConnection);
// Reauthentication - Handles jsonCode 407 which indicates an expired authToken. We need to reauthenticate and get a new authToken with our stored credentials.
(0, Request_1.use)(Middleware_1.Reauthentication);
// Handles the case when the copilot has been deleted. The response contains jsonCode 408 and a message indicating account deletion
(0, Request_1.use)(Middleware_1.handleDeletedAccount);
// If an optimistic ID is not used by the server, this will update the remaining serialized requests using that optimistic ID to use the correct ID instead.
(0, Request_1.use)(Middleware_1.HandleUnusedOptimisticID);
(0, Request_1.use)(Middleware_1.Pagination);
// SaveResponseInOnyx - Merges either the successData or failureData (or finallyData, if included in place of the former two values) into Onyx depending on if the call was successful or not. This needs to be the LAST middleware we use, don't add any
// middlewares after this, because the SequentialQueue depends on the result of this middleware to pause the queue (if needed) to bring the app to an up-to-date state.
(0, Request_1.use)(Middleware_1.SaveResponseInOnyx);
var requestIndex = 0;
/**
 * Prepare the request to be sent. Bind data together with request metadata and apply optimistic Onyx data.
 */
function prepareRequest(command, type, params, onyxData, conflictResolver) {
    if (onyxData === void 0) { onyxData = {}; }
    if (conflictResolver === void 0) { conflictResolver = {}; }
    Log_1.default.info('[API] Preparing request', false, { command: command, type: type });
    var shouldApplyOptimisticData = true;
    if (conflictResolver === null || conflictResolver === void 0 ? void 0 : conflictResolver.checkAndFixConflictingRequest) {
        var requests = (0, PersistedRequests_1.getAll)();
        var conflictAction = conflictResolver.checkAndFixConflictingRequest(requests).conflictAction;
        shouldApplyOptimisticData = conflictAction.type !== 'noAction';
    }
    var optimisticData = onyxData.optimisticData, onyxDataWithoutOptimisticData = __rest(onyxData, ["optimisticData"]);
    if (optimisticData && shouldApplyOptimisticData) {
        Log_1.default.info('[API] Applying optimistic data', false, { command: command, type: type });
        react_native_onyx_1.default.update(optimisticData);
    }
    var isWriteRequest = type === CONST_1.default.API_REQUEST_TYPE.WRITE;
    var pusherSocketID = Pusher_1.default.getPusherSocketID();
    if (pusherSocketID === 'null' && isWriteRequest) {
        Log_1.default.alert("Pusher socket ID is 'null'. This should not happen.", { command: command, pusherSocketID: pusherSocketID }, true);
        pusherSocketID = undefined;
    }
    // Prepare the data we'll send to the API
    var data = __assign(__assign({}, params), { apiRequestType: type, 
        // We send the pusherSocketID with all write requests so that the api can include it in push events to prevent Pusher from sending the events to the requesting client. The push event
        // is sent back to the requesting client in the response data instead, which prevents a replay effect in the UI. See https://github.com/Expensify/App/issues/12775.
        pusherSocketID: isWriteRequest ? pusherSocketID : undefined });
    // Assemble all request metadata (used by middlewares, and for persisted requests stored in Onyx)
    var request = __assign(__assign({ command: command, data: data, initiatedOffline: (0, NetworkStore_1.isOffline)(), requestID: requestIndex++ }, onyxDataWithoutOptimisticData), conflictResolver);
    if (isWriteRequest) {
        // This should be removed once we are no longer using deprecatedAPI https://github.com/Expensify/Expensify/issues/215650
        request.data.shouldRetry = true;
        request.data.canCancel = true;
    }
    return request;
}
/**
 * Process a prepared request according to its type.
 */
function processRequest(request, type) {
    // Write commands can be saved and retried, so push it to the SequentialQueue
    if (type === CONST_1.default.API_REQUEST_TYPE.WRITE) {
        (0, SequentialQueue_1.push)(request);
        return Promise.resolve();
    }
    // Read requests are processed right away, but don't return the response to the caller
    if (type === CONST_1.default.API_REQUEST_TYPE.READ) {
        (0, Request_1.processWithMiddleware)(request);
        return Promise.resolve();
    }
    // Requests with side effects process right away, and return the response to the caller
    return (0, Request_1.processWithMiddleware)(request);
}
/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData (or finallyData, if included in place of the former two values).
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 */
function write(command, apiCommandParameters, onyxData, conflictResolver) {
    if (onyxData === void 0) { onyxData = {}; }
    if (conflictResolver === void 0) { conflictResolver = {}; }
    Log_1.default.info('[API] Called API write', false, __assign({ command: command }, apiCommandParameters));
    var request = prepareRequest(command, CONST_1.default.API_REQUEST_TYPE.WRITE, apiCommandParameters, onyxData, conflictResolver);
    return processRequest(request, CONST_1.default.API_REQUEST_TYPE.WRITE);
}
/**
 * This function is used to write data to the API while ensuring that there are no duplicate requests in the queue.
 * If a duplicate request is found, it resolves the conflict by replacing the duplicated request with the new one.
 */
function writeWithNoDuplicatesConflictAction(command, apiCommandParameters, onyxData, requestMatcher) {
    if (onyxData === void 0) { onyxData = {}; }
    if (requestMatcher === void 0) { requestMatcher = function (request) { return request.command === command; }; }
    var conflictResolver = {
        checkAndFixConflictingRequest: function (persistedRequests) { return (0, RequestConflictUtils_1.resolveDuplicationConflictAction)(persistedRequests, requestMatcher); },
    };
    return write(command, apiCommandParameters, onyxData, conflictResolver);
}
/**
 * This function is used to write data to the API while ensuring that there are no conflicts with enabling policy features.
 * If a conflict is found, it resolves the conflict by deleting the duplicated request.
 */
function writeWithNoDuplicatesEnableFeatureConflicts(command, apiCommandParameters, onyxData) {
    if (onyxData === void 0) { onyxData = {}; }
    var conflictResolver = {
        checkAndFixConflictingRequest: function (persistedRequests) { return (0, RequestConflictUtils_1.resolveEnableFeatureConflicts)(command, persistedRequests, apiCommandParameters); },
    };
    return write(command, apiCommandParameters, onyxData, conflictResolver);
}
/**
 * For commands where the network response must be accessed directly or when there is functionality that can only
 * happen once the request is finished (eg. calling third-party services like Onfido and Plaid, redirecting a user
 * depending on the response data, etc.).
 * It works just like API.read(), except that it will return a promise.
 * Using this method is discouraged and will throw an ESLint error. Use it sparingly and only when all other alternatives have been exhausted.
 * It is best to discuss it in Slack anytime you are tempted to use this method.
 */
function makeRequestWithSideEffects(command, apiCommandParameters, onyxData) {
    if (onyxData === void 0) { onyxData = {}; }
    Log_1.default.info('[API] Called API makeRequestWithSideEffects', false, __assign({ command: command }, apiCommandParameters));
    var request = prepareRequest(command, CONST_1.default.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS, apiCommandParameters, onyxData);
    // Return a promise containing the response from HTTPS
    return processRequest(request, CONST_1.default.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS);
}
/**
 * Ensure all write requests on the sequential queue have finished responding before running read requests.
 * Responses from read requests can overwrite the optimistic data inserted by
 * write requests that use the same Onyx keys and haven't responded yet.
 */
function waitForWrites(command) {
    if ((0, PersistedRequests_1.getLength)() > 0) {
        Log_1.default.info("[API] '".concat(command, "' is waiting on ").concat((0, PersistedRequests_1.getLength)(), " write commands"));
    }
    return (0, SequentialQueue_1.waitForIdle)();
}
/**
 * Requests made with this method are not be persisted to disk. If there is no network connectivity, the request is ignored and discarded.
 */
function read(command, apiCommandParameters, onyxData) {
    if (onyxData === void 0) { onyxData = {}; }
    Log_1.default.info('[API] Called API.read', false, __assign({ command: command }, apiCommandParameters));
    // Apply optimistic updates of read requests immediately
    var request = prepareRequest(command, CONST_1.default.API_REQUEST_TYPE.READ, apiCommandParameters, onyxData);
    // Sign in with shortLivedAuthToken command shouldn't be blocked by write commands
    if (command === types_1.READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN) {
        processRequest(request, CONST_1.default.API_REQUEST_TYPE.READ);
        return;
    }
    waitForWrites(command).then(function () {
        processRequest(request, CONST_1.default.API_REQUEST_TYPE.READ);
    });
}
function paginate(type, command, apiCommandParameters, onyxData, config, conflictResolver) {
    if (conflictResolver === void 0) { conflictResolver = {}; }
    Log_1.default.info('[API] Called API.paginate', false, __assign({ command: command }, apiCommandParameters));
    var request = __assign(__assign(__assign({}, prepareRequest(command, type, apiCommandParameters, onyxData, conflictResolver)), config), {
        isPaginated: true,
    });
    switch (type) {
        case CONST_1.default.API_REQUEST_TYPE.WRITE:
            processRequest(request, type);
            return;
        case CONST_1.default.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS:
            return processRequest(request, type);
        case CONST_1.default.API_REQUEST_TYPE.READ:
            waitForWrites(command).then(function () { return processRequest(request, type); });
            return;
        default:
            throw new Error('Unknown API request type');
    }
}
