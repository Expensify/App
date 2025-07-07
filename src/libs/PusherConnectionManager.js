"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var Session_1 = require("./actions/Session");
var Log_1 = require("./Log");
var Pusher_1 = require("./Pusher");
function init() {
    var _a;
    /**
     * When authTokens expire they will automatically be refreshed.
     * The authorizer helps make sure that we are always passing the
     * current valid token to generate the signed auth response
     * needed to subscribe to Pusher channels.
     */
    (_a = Pusher_1.default.registerCustomAuthorizer) === null || _a === void 0 ? void 0 : _a.call(Pusher_1.default, function (channel) { return ({
        authorize: function (socketId, callback) {
            (0, Session_1.authenticatePusher)(socketId, channel.name, callback);
        },
    }); });
    Pusher_1.default.registerSocketEventCallback(function (eventName, error) {
        var _a, _b, _c;
        switch (eventName) {
            case 'error': {
                if (error && 'type' in error) {
                    var errorType = error === null || error === void 0 ? void 0 : error.type;
                    var code = (_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.code;
                    var errorMessage = (_c = (_b = error === null || error === void 0 ? void 0 : error.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : '';
                    if (errorType === CONST_1.default.ERROR.PUSHER_ERROR && code === 1006) {
                        // 1006 code happens when a websocket connection is closed. There may or may not be a reason attached indicating why the connection was closed.
                        // https://datatracker.ietf.org/doc/html/rfc6455#section-7.1.5
                        Log_1.default.hmmm('[PusherConnectionManager] Channels Error 1006', { error: error });
                        // The 1006 errors don't always have a message, but when they do, it seems that it prevents the pusher client from reconnecting.
                        // On the advice from Pusher directly, they suggested to manually reconnect in those scenarios.
                        if (errorMessage) {
                            Log_1.default.hmmm('[PusherConnectionManager] Channels Error 1006 message', { errorMessage: errorMessage });
                            Pusher_1.default.reconnect();
                        }
                    }
                    else if (errorType === CONST_1.default.ERROR.PUSHER_ERROR && code === 4201) {
                        // This means the connection was closed because Pusher did not receive a reply from the client when it pinged them for a response
                        // https://pusher.com/docs/channels/library_auth_reference/pusher-websockets-protocol/#4200-4299
                        Log_1.default.hmmm('[PusherConnectionManager] Pong reply not received', { error: error });
                    }
                    else if (errorType === CONST_1.default.ERROR.WEB_SOCKET_ERROR) {
                        // It's not clear why some errors are wrapped in a WebSocketError type - this error could mean different things depending on the contents.
                        Log_1.default.hmmm('[PusherConnectionManager] WebSocketError', { error: error });
                    }
                    else {
                        Log_1.default.alert("".concat(CONST_1.default.ERROR.ENSURE_BUG_BOT, " [PusherConnectionManager] Unknown error event"), { error: error });
                    }
                }
                break;
            }
            case 'connected':
                Log_1.default.hmmm('[PusherConnectionManager] connected event');
                break;
            case 'disconnected':
                Log_1.default.hmmm('[PusherConnectionManager] disconnected event');
                break;
            case 'state_change':
                Log_1.default.hmmm('[PusherConnectionManager] state change', { states: error });
                break;
            default:
                Log_1.default.hmmm('[PusherConnectionManager] unhandled event', { eventName: eventName });
                break;
        }
    });
}
exports.default = {
    init: init,
};
