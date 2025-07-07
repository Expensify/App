"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NetworkConnection_1 = require("@libs/NetworkConnection");
var CONST_1 = require("@src/CONST");
/**
 * @returns cancel timer
 */
function startRecheckTimeoutTimer() {
    // If request is still in processing after this time, we might be offline
    var timerID = setTimeout(NetworkConnection_1.default.recheckNetworkConnection, CONST_1.default.NETWORK.MAX_PENDING_TIME_MS);
    return function () { return clearTimeout(timerID); };
}
var RecheckConnection = function (response) {
    // When the request goes past a certain amount of time we trigger a re-check of the connection
    var cancelRequestTimeoutTimer = startRecheckTimeoutTimer();
    return response
        .catch(function (error) {
        if (error.name !== CONST_1.default.ERROR.REQUEST_CANCELLED) {
            // Because we ran into an error we assume we might be offline and do a "connection" health test
            NetworkConnection_1.default.recheckNetworkConnection();
        }
        throw error;
    })
        .finally(cancelRequestTimeoutTimer);
};
exports.default = RecheckConnection;
