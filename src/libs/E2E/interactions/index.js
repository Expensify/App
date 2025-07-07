"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForTextInputValue = exports.waitForEvent = exports.tap = exports.waitForElement = void 0;
var react_native_1 = require("react-native");
var E2EGenericPressableWrapper = require("@components/Pressable/GenericPressable/index.e2e");
var Performance_1 = require("@libs/Performance");
var waitForElement = function (testID) {
    console.debug("[E2E] waitForElement: ".concat(testID));
    if (E2EGenericPressableWrapper.getPressableProps(testID)) {
        return Promise.resolve();
    }
    return new Promise(function (resolve) {
        var subscription = react_native_1.DeviceEventEmitter.addListener('onBecameVisible', function (_testID) {
            if (_testID !== testID) {
                return;
            }
            subscription.remove();
            resolve(undefined);
        });
    });
};
exports.waitForElement = waitForElement;
var waitForTextInputValue = function (text, _testID) {
    return new Promise(function (resolve) {
        var subscription = react_native_1.DeviceEventEmitter.addListener('onChangeText', function (_a) {
            var testID = _a.testID, value = _a.value;
            if (_testID !== testID || value !== text) {
                return;
            }
            subscription.remove();
            resolve(undefined);
        });
    });
};
exports.waitForTextInputValue = waitForTextInputValue;
var waitForEvent = function (eventName) {
    return new Promise(function (resolve) {
        Performance_1.default.subscribeToMeasurements(function (entry) {
            if (entry.name !== eventName) {
                return;
            }
            resolve(entry);
        });
    });
};
exports.waitForEvent = waitForEvent;
var tap = function (testID) {
    var _a, _b;
    console.debug("[E2E] Press on: ".concat(testID));
    (_b = (_a = E2EGenericPressableWrapper.getPressableProps(testID)) === null || _a === void 0 ? void 0 : _a.onPress) === null || _b === void 0 ? void 0 : _b.call(_a, {});
};
exports.tap = tap;
