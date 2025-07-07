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
/* eslint-disable @typescript-eslint/naming-convention */
var Log_1 = require("@libs/Log");
function publishEvent(event, accountID) {
    if (!window.dataLayer) {
        return;
    }
    var params = { event: event, user_id: accountID };
    // Pass a copy of params here since the dataLayer modifies the object
    window.dataLayer.push(__assign({}, params));
    Log_1.default.info('[GTM] event published', false, params);
}
var GoogleTagManager = {
    publishEvent: publishEvent,
};
exports.default = GoogleTagManager;
