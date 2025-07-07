"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDraftValues = clearDraftValues;
exports.clearErrorFields = clearErrorFields;
exports.clearErrors = clearErrors;
exports.setDraftValues = setDraftValues;
exports.setErrorFields = setErrorFields;
exports.setErrors = setErrors;
exports.setIsLoading = setIsLoading;
var react_native_onyx_1 = require("react-native-onyx");
function setIsLoading(formID, isLoading) {
    react_native_onyx_1.default.merge(formID, { isLoading: isLoading });
}
function setErrors(formID, errors) {
    react_native_onyx_1.default.merge(formID, { errors: errors });
}
function setErrorFields(formID, errorFields) {
    react_native_onyx_1.default.merge(formID, { errorFields: errorFields });
}
function clearErrors(formID) {
    react_native_onyx_1.default.merge(formID, { errors: null });
}
function clearErrorFields(formID) {
    react_native_onyx_1.default.merge(formID, { errorFields: null });
}
function setDraftValues(formID, draftValues) {
    return react_native_onyx_1.default.merge("".concat(formID, "Draft"), draftValues !== null && draftValues !== void 0 ? draftValues : null);
}
function clearDraftValues(formID) {
    react_native_onyx_1.default.set("".concat(formID, "Draft"), null);
}
