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
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeLoggingData = serializeLoggingData;
var types_1 = require("@libs/API/types");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
function getCircularReplacer() {
    var ancestors = [];
    return function (key, value) {
        if (typeof value !== 'object' || value === null) {
            return value;
        }
        // `this` is the object that value is contained in, i.e the direct parent
        // eslint-disable-next-line no-invalid-this
        while (ancestors.length > 0 && ancestors.at(-1) !== this) {
            ancestors.pop();
        }
        if (ancestors.includes(value)) {
            return '[Circular]';
        }
        ancestors.push(value);
        return value;
    };
}
function serializeLoggingData(logData) {
    try {
        return JSON.parse(JSON.stringify(logData, getCircularReplacer()));
    }
    catch (error) {
        Log_1.default.hmmm('Failed to serialize log data', { error: error });
        return null;
    }
}
function logRequestDetails(message, request, response) {
    var _a, _b;
    // Don't log about log or else we'd cause an infinite loop
    if (request.command === 'Log') {
        return;
    }
    var logParams = {
        command: request.command,
        shouldUseSecure: request.shouldUseSecure,
    };
    var returnValueList = (_a = request === null || request === void 0 ? void 0 : request.data) === null || _a === void 0 ? void 0 : _a.returnValueList;
    if (returnValueList) {
        logParams.returnValueList = returnValueList;
    }
    var nvpNames = (_b = request === null || request === void 0 ? void 0 : request.data) === null || _b === void 0 ? void 0 : _b.nvpNames;
    if (nvpNames) {
        logParams.nvpNames = nvpNames;
    }
    if (response) {
        logParams.jsonCode = response.jsonCode;
        logParams.requestID = response.requestID;
    }
    var extraData = {};
    /**
     * We don't want to log the request and response data for AuthenticatePusher
     * requests because they contain sensitive information.
     */
    if (request.command !== 'AuthenticatePusher') {
        extraData.request = __assign(__assign({}, request), { data: serializeLoggingData(request.data) });
        extraData.response = response;
    }
    Log_1.default.info(message, false, logParams, false, extraData);
}
var Logging = function (response, request) {
    var startTime = Date.now();
    logRequestDetails('[Network] Making API request', request);
    return response
        .then(function (data) {
        logRequestDetails("[Network] Finished API request in ".concat(Date.now() - startTime, "ms"), request, data);
        return data;
    })
        .catch(function (error) {
        var logParams = {
            message: error.message,
            status: error.status,
            title: error.title,
            request: request,
        };
        if (error.name === CONST_1.default.ERROR.REQUEST_CANCELLED) {
            // Cancelled requests are normal and can happen when a user logs out.
            Log_1.default.info('[Network] API request error: Request canceled', false, logParams);
        }
        else if (error.message === CONST_1.default.ERROR.FAILED_TO_FETCH) {
            // If the command that failed is Log it's possible that the next call to Log may also fail.
            // This will lead to infinitely complex log params that can eventually crash the app.
            if (request.command === 'Log') {
                delete logParams.request;
            }
            // Log when we get a "Failed to fetch" error. Very common if a user is offline or experiencing an unlikely scenario like
            // incorrect url, bad cors headers returned by the server, DNS lookup failure etc.
            Log_1.default.hmmm('[Network] API request error: Failed to fetch', logParams);
        }
        else if ([
            CONST_1.default.ERROR.IOS_NETWORK_CONNECTION_LOST,
            CONST_1.default.ERROR.NETWORK_REQUEST_FAILED,
            CONST_1.default.ERROR.IOS_NETWORK_CONNECTION_LOST_RUSSIAN,
            CONST_1.default.ERROR.IOS_NETWORK_CONNECTION_LOST_SWEDISH,
            CONST_1.default.ERROR.IOS_NETWORK_CONNECTION_LOST_SPANISH,
        ].some(function (message) { return message === error.message; })) {
            // These errors seem to happen for native devices with interrupted connections. Often we will see logs about Pusher disconnecting together with these.
            // This type of error may also indicate a problem with SSL certs.
            Log_1.default.hmmm('[Network] API request error: Connection interruption likely', logParams);
        }
        else if ([CONST_1.default.ERROR.FIREFOX_DOCUMENT_LOAD_ABORTED, CONST_1.default.ERROR.SAFARI_DOCUMENT_LOAD_ABORTED].some(function (message) { return message === error.message; })) {
            // This message can be observed page load is interrupted (closed or navigated away).
            Log_1.default.hmmm('[Network] API request error: User likely navigated away from or closed browser', logParams);
        }
        else if (error.message === CONST_1.default.ERROR.IOS_LOAD_FAILED) {
            // Not yet clear why this message occurs, but it is specific to iOS and tends to happen around the same time as a Pusher code 1006
            // which is when a websocket disconnects. So it seems likely to be a spotty connection scenario.
            Log_1.default.hmmm('[Network] API request error: iOS Load Failed error', logParams);
        }
        else if (error.message === CONST_1.default.ERROR.SAFARI_CANNOT_PARSE_RESPONSE) {
            // Another cryptic Apple error message. Unclear why this can happen, but some speculation it can be fixed by a browser restart.
            Log_1.default.hmmm('[Network] API request error: Safari "cannot parse response"', logParams);
        }
        else if (error.message === CONST_1.default.ERROR.GATEWAY_TIMEOUT) {
            // This error seems to only throw on dev when localhost:8080 tries to access the production web server. It's unclear whether this can happen on production or if
            // it's a sign that the web server is down.
            Log_1.default.hmmm('[Network] API request error: Gateway Timeout error', logParams);
        }
        else if (request.command === types_1.SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER) {
            // AuthenticatePusher requests can return with fetch errors and no message. It happens because we return a non 200 header like 403 Forbidden.
            // This is common to see if we are subscribing to a bad channel related to something the user shouldn't be able to access. There's no additional information
            // we can get about these requests.
            Log_1.default.hmmm('[Network] API request error: AuthenticatePusher', logParams);
        }
        else if (error.message === CONST_1.default.ERROR.EXPENSIFY_SERVICE_INTERRUPTED) {
            // Expensify site is down completely OR
            // Auth (database connection) is down / bedrock has timed out while making a request. We currently can't tell the difference between Auth down and bedrock timing out.
            Log_1.default.hmmm('[Network] API request error: Expensify service interrupted or timed out', logParams);
        }
        else if (error.message === CONST_1.default.ERROR.THROTTLED) {
            Log_1.default.hmmm('[Network] API request error: Expensify API throttled the request', logParams);
        }
        else if (error.message === CONST_1.default.ERROR.DUPLICATE_RECORD) {
            // Duplicate records can happen when a large upload is interrupted and we need to retry to see if the original request completed
            Log_1.default.info('[Network] API request error: A record already exists with this ID', false, logParams);
        }
        else {
            // If we get any error that is not known log an alert so we can learn more about it and document it here.
            Log_1.default.alert("".concat(CONST_1.default.ERROR.ENSURE_BUG_BOT, " unknown API request error caught while processing request"), logParams, false);
        }
        // Re-throw this error so the next handler can manage it
        throw error;
    });
};
exports.default = Logging;
