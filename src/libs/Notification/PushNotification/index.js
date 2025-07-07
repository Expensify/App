"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationType_1 = require("./NotificationType");
// Push notifications are only supported on mobile, so we'll just noop here
var PushNotification = {
    init: function () { },
    register: function () { },
    deregister: function () { },
    onReceived: function () { },
    onSelected: function () { },
    TYPE: NotificationType_1.default,
    clearNotifications: function () { },
};
exports.default = PushNotification;
