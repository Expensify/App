"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pusher = void 0;
var CONST_1 = require("@src/CONST");
var MockedPusher = /** @class */ (function () {
    function MockedPusher() {
        this.channels = new Map();
        this.socketId = 'mock-socket-id';
        this.connectionState = CONST_1.default.PUSHER.STATE.DISCONNECTED;
    }
    MockedPusher.getInstance = function () {
        if (!MockedPusher.instance) {
            MockedPusher.instance = new MockedPusher();
        }
        return MockedPusher.instance;
    };
    MockedPusher.prototype.init = function (_a) {
        var onConnectionStateChange = _a.onConnectionStateChange;
        onConnectionStateChange(CONST_1.default.PUSHER.STATE.CONNECTED, CONST_1.default.PUSHER.STATE.DISCONNECTED);
        return Promise.resolve();
    };
    MockedPusher.prototype.connect = function () {
        this.connectionState = CONST_1.default.PUSHER.STATE.CONNECTED;
        return Promise.resolve();
    };
    MockedPusher.prototype.disconnect = function () {
        this.connectionState = CONST_1.default.PUSHER.STATE.DISCONNECTED;
        this.channels.clear();
        return Promise.resolve();
    };
    MockedPusher.prototype.subscribe = function (_a) {
        var channelName = _a.channelName, onEvent = _a.onEvent, onSubscriptionSucceeded = _a.onSubscriptionSucceeded;
        if (!this.channels.has(channelName)) {
            this.channels.set(channelName, { onEvent: onEvent, onSubscriptionSucceeded: onSubscriptionSucceeded });
            onSubscriptionSucceeded();
        }
        return Promise.resolve();
    };
    MockedPusher.prototype.unsubscribe = function (_a) {
        var channelName = _a.channelName;
        this.channels.delete(channelName);
    };
    MockedPusher.prototype.trigger = function (_a) {
        var _b;
        var channelName = _a.channelName, eventName = _a.eventName, data = _a.data;
        (_b = this.channels.get(channelName)) === null || _b === void 0 ? void 0 : _b.onEvent({ channelName: channelName, eventName: eventName, data: data });
    };
    MockedPusher.prototype.getChannel = function (channelName) {
        return this.channels.get(channelName);
    };
    MockedPusher.prototype.getSocketId = function () {
        return Promise.resolve(this.socketId);
    };
    MockedPusher.instance = null;
    return MockedPusher;
}());
exports.Pusher = MockedPusher;
