"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function resetDebugDetailsDraftForm() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.DEBUG_DETAILS_FORM_DRAFT, null);
}
function setDebugData(onyxKey, onyxValue) {
    react_native_onyx_1.default.set(onyxKey, onyxValue);
}
function mergeDebugData(onyxKey, onyxValue) {
    react_native_onyx_1.default.merge(onyxKey, onyxValue);
}
exports.default = {
    resetDebugDetailsDraftForm: resetDebugDetailsDraftForm,
    setDebugData: setDebugData,
    mergeDebugData: mergeDebugData,
};
