"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPersonalDetailsDraft = clearPersonalDetailsDraft;
exports.setPersonalDetails = setPersonalDetails;
exports.clearWorkspaceDetailsDraft = clearWorkspaceDetailsDraft;
exports.setWorkspaceCurrency = setWorkspaceCurrency;
exports.verifyTestDriveRecipient = verifyTestDriveRecipient;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Clear Personal Details draft
 */
function clearPersonalDetailsDraft() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM_DRAFT, null);
}
/**
 * Set the personal details Onyx data
 */
function setPersonalDetails(firstName, lastName) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, { firstName: firstName, lastName: lastName });
}
/**
 * Clear Workspace Details draft
 */
function clearWorkspaceDetailsDraft() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, null);
}
/**
 * Set the workspace currency Onyx data
 */
function setWorkspaceCurrency(currency) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, { currency: currency });
}
function verifyTestDriveRecipient(email) {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.VERIFY_TEST_DRIVE_RECIPIENT, { email: email }).then(function (response) {
        if (!(response === null || response === void 0 ? void 0 : response.accountExists)) {
            // We can invite this user since they do not have an account yet
            return;
        }
        throw new Error(response === null || response === void 0 ? void 0 : response.message);
    });
}
