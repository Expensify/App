"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveExitReason = saveExitReason;
exports.saveResponse = saveResponse;
exports.switchToOldDot = switchToOldDot;
exports.resetExitSurveyForm = resetExitSurveyForm;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ExitSurveyReasonForm_1 = require("@src/types/form/ExitSurveyReasonForm");
var ExitSurveyResponseForm_1 = require("@src/types/form/ExitSurveyResponseForm");
var exitReason;
var exitSurveyResponse;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM,
    callback: function (value) { return (exitReason = value === null || value === void 0 ? void 0 : value[ExitSurveyReasonForm_1.default.REASON]); },
});
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.FORMS.EXIT_SURVEY_RESPONSE_FORM,
    callback: function (value) { return (exitSurveyResponse = value === null || value === void 0 ? void 0 : value[ExitSurveyResponseForm_1.default.RESPONSE]); },
});
function saveExitReason(reason) {
    var _a;
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM, (_a = {}, _a[ExitSurveyReasonForm_1.default.REASON] = reason, _a));
}
function saveResponse(response) {
    var _a;
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.EXIT_SURVEY_RESPONSE_FORM, (_a = {}, _a[ExitSurveyResponseForm_1.default.RESPONSE] = response, _a));
}
/**
 * Save the user's response to the mandatory exit survey in the back-end.
 */
function switchToOldDot() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM,
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM_DRAFT,
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.FORMS.EXIT_SURVEY_RESPONSE_FORM,
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT,
            value: null,
        },
    ];
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.write(types_1.WRITE_COMMANDS.SWITCH_TO_OLD_DOT, {
        reason: exitReason,
        surveyResponse: exitSurveyResponse,
    }, { optimisticData: optimisticData });
}
/**
 * Clear the exit survey form data.
 */
function resetExitSurveyForm(callback) {
    var _a;
    react_native_onyx_1.default.multiSet((_a = {},
        _a[ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM] = null,
        _a[ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM_DRAFT] = null,
        _a[ONYXKEYS_1.default.FORMS.EXIT_SURVEY_RESPONSE_FORM] = null,
        _a[ONYXKEYS_1.default.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT] = null,
        _a)).then(callback);
}
