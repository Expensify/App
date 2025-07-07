"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getModalState;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var modalState = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.MODAL,
    callback: function (value) {
        modalState = value;
    },
});
/**
 * Returns the modal state from onyx.
 * Note: You should use the HOCs/hooks to get onyx data, instead of using this directly.
 * A valid use case to use this is if the value is only needed once for an initial value.
 */
function getModalState() {
    return modalState;
}
