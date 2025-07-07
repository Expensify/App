"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var analytics_1 = require("@react-native-firebase/analytics");
var Log_1 = require("@libs/Log");
function publishEvent(event, accountID) {
    (0, analytics_1.default)().logEvent(event, { user_id: accountID });
    Log_1.default.info('[GTM] event published', false, { event: event, user_id: accountID });
}
var GoogleTagManager = {
    publishEvent: publishEvent,
};
exports.default = GoogleTagManager;
