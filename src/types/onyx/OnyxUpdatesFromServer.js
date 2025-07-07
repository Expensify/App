"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidOnyxUpdateFromServer = isValidOnyxUpdateFromServer;
var CONST_1 = require("@src/CONST");
/**
 * Helper function to determine if onyx update received from server is valid
 *
 * @param value - represent the onyx update received from the server
 * @returns boolean indicating if the onyx update received from the server is valid
 */
function isValidOnyxUpdateFromServer(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    if (!('type' in value) || !value.type) {
        return false;
    }
    if (value.type === CONST_1.default.ONYX_UPDATE_TYPES.HTTPS) {
        if (!('request' in value) || !value.request) {
            return false;
        }
        if (!('response' in value) || !value.response) {
            return false;
        }
    }
    if (value.type === CONST_1.default.ONYX_UPDATE_TYPES.PUSHER) {
        if (!('updates' in value) || !value.updates) {
            return false;
        }
    }
    return true;
}
