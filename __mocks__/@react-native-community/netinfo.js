"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultState = {
    type: 'cellular',
    isConnected: true,
    isInternetReachable: true,
    details: {
        isConnectionExpensive: true,
        cellularGeneration: '3g',
        carrier: 'T-Mobile',
    },
};
var netInfoMock = {
    configure: function () { },
    fetch: function () { return Promise.resolve(defaultState); },
    refresh: function () { return Promise.resolve(defaultState); },
    addEventListener: function () { return function () { }; },
    useNetInfo: function () { return defaultState; },
};
exports.default = netInfoMock;
