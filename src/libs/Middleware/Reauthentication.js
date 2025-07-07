"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reauthThrottle = void 0;
exports.reauthenticate = reauthenticate;
exports.resetReauthentication = resetReauthentication;
var SignInRedirect_1 = require("@libs/actions/SignInRedirect");
var Authentication_1 = require("@libs/Authentication");
var Log_1 = require("@libs/Log");
var MainQueue_1 = require("@libs/Network/MainQueue");
var NetworkStore_1 = require("@libs/Network/NetworkStore");
var NetworkConnection_1 = require("@libs/NetworkConnection");
var Request_1 = require("@libs/Request");
var RequestThrottle_1 = require("@libs/RequestThrottle");
var CONST_1 = require("@src/CONST");
// We store a reference to the active authentication request so that we are only ever making one request to authenticate at a time.
var isAuthenticating = null;
var reauthThrottle = new RequestThrottle_1.default('Re-authentication');
exports.reauthThrottle = reauthThrottle;
function reauthenticate(commandName) {
    if (isAuthenticating) {
        return isAuthenticating;
    }
    isAuthenticating = retryReauthenticate(commandName).finally(function () {
        // Reset the isAuthenticating state to allow new reauthentication flows to start fresh
        isAuthenticating = null;
    });
    return isAuthenticating;
}
function retryReauthenticate(commandName) {
    return (0, Authentication_1.reauthenticate)(commandName).catch(function (error) {
        return reauthThrottle
            .sleep(error, 'Authenticate')
            .then(function () { return retryReauthenticate(commandName); })
            .catch(function () {
            (0, NetworkStore_1.setIsAuthenticating)(false);
            Log_1.default.hmmm('Redirecting to Sign In because we failed to reauthenticate after multiple attempts', { error: error });
            (0, SignInRedirect_1.default)('passwordForm.error.fallback');
            return false;
        });
    });
}
// Used in tests to reset the reauthentication state
function resetReauthentication() {
    // Resets the authentication state flag to allow new reauthentication flows to start fresh
    isAuthenticating = null;
    // Clears any pending reauth timeouts set by reauthThrottle.sleep()
    reauthThrottle.clear();
}
var Reauthentication = function (response, request, isFromSequentialQueue) {
    return response
        .then(function (data) {
        var _a, _b, _c;
        // If there is no data for some reason then we cannot reauthenticate
        if (!data) {
            Log_1.default.hmmm('Undefined data in Reauthentication');
            return;
        }
        if (data.jsonCode === CONST_1.default.JSON_CODE.NOT_AUTHENTICATED) {
            if ((0, NetworkStore_1.isOffline)()) {
                // If we are offline and somehow handling this response we do not want to reauthenticate
                throw new Error('Unable to reauthenticate because we are offline');
            }
            // There are some API requests that should not be retried when there is an auth failure like
            // creating and deleting logins. In those cases, they should handle the original response instead
            // of the new response created by handleExpiredAuthToken.
            var shouldRetry = (_a = request === null || request === void 0 ? void 0 : request.data) === null || _a === void 0 ? void 0 : _a.shouldRetry;
            var apiRequestType_1 = (_b = request === null || request === void 0 ? void 0 : request.data) === null || _b === void 0 ? void 0 : _b.apiRequestType;
            // For the SignInWithShortLivedAuthToken command, if the short token expires, the server returns a 407 error,
            // and credentials are still empty at this time, which causes reauthenticate to throw an error (requireParameters),
            // and the subsequent SaveResponseInOnyx also cannot be executed, so we need this parameter to skip the reauthentication logic.
            var skipReauthentication = (_c = request === null || request === void 0 ? void 0 : request.data) === null || _c === void 0 ? void 0 : _c.skipReauthentication;
            if ((!shouldRetry && !apiRequestType_1) || skipReauthentication) {
                if (isFromSequentialQueue) {
                    return data;
                }
                if (request.resolve) {
                    request.resolve(data);
                }
                return data;
            }
            // We are already authenticating and using the DeprecatedAPI so we will replay the request
            if (!apiRequestType_1 && (0, NetworkStore_1.isAuthenticating)()) {
                (0, MainQueue_1.replay)(request);
                return data;
            }
            return reauthenticate(request === null || request === void 0 ? void 0 : request.commandName)
                .then(function (wasSuccessful) {
                if (!wasSuccessful) {
                    return;
                }
                if (isFromSequentialQueue || apiRequestType_1 === CONST_1.default.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS) {
                    return (0, Request_1.processWithMiddleware)(request, isFromSequentialQueue);
                }
                if (apiRequestType_1 === CONST_1.default.API_REQUEST_TYPE.READ) {
                    NetworkConnection_1.default.triggerReconnectionCallbacks('read request made with expired authToken');
                    return Promise.resolve();
                }
                (0, MainQueue_1.replay)(request);
            })
                .catch(function () {
                if (isFromSequentialQueue || apiRequestType_1) {
                    throw new Error('Failed to reauthenticate');
                }
                // If we make it here, then our reauthenticate request could not be made due to a networking issue. The original request can be retried safely.
                (0, MainQueue_1.replay)(request);
            });
        }
        if (isFromSequentialQueue) {
            return data;
        }
        if (request.resolve) {
            request.resolve(data);
        }
        // Return response data so we can chain the response with the following middlewares.
        return data;
    })
        .catch(function (error) {
        // If the request is on the sequential queue, re-throw the error so we can decide to retry or not
        if (isFromSequentialQueue) {
            throw error;
        }
        // If we have caught a networking error from a DeprecatedAPI request, resolve it as unable to retry, otherwise the request will never resolve or reject.
        if (request.resolve) {
            request.resolve({ jsonCode: CONST_1.default.JSON_CODE.UNABLE_TO_RETRY });
        }
    });
};
exports.default = Reauthentication;
