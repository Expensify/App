"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var CONST_1 = require("@src/CONST");
var shouldReportActivity_1 = require("./shouldReportActivity");
var appState = CONST_1.default.APP_STATE.ACTIVE;
/**
 * Listener that will only fire the callback when the user has become active.
 * @returns callback to unsubscribe
 */
function addBecameActiveListener(callback) {
    function appStateChangeCallback(state) {
        if (shouldReportActivity_1.default && (appState === CONST_1.default.APP_STATE.INACTIVE || appState === CONST_1.default.APP_STATE.BACKGROUND) && state === CONST_1.default.APP_STATE.ACTIVE) {
            callback();
        }
        appState = state;
    }
    var appStateChangeSubscription = react_native_1.AppState.addEventListener('change', appStateChangeCallback);
    return function () {
        if (!appStateChangeSubscription) {
            return;
        }
        appStateChangeSubscription.remove();
    };
}
exports.default = {
    addBecameActiveListener: addBecameActiveListener,
};
