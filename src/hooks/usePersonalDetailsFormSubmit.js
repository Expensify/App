"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = usePersonalDetailsFormSubmit;
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useStepFormSubmit_1 = require("./useStepFormSubmit");
/**
 * Hook for handling submit method in Missing Personal Details substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
function usePersonalDetailsFormSubmit(_a) {
    var onNext = _a.onNext, fieldIds = _a.fieldIds, shouldSaveDraft = _a.shouldSaveDraft;
    return (0, useStepFormSubmit_1.default)({
        formId: ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM,
        onNext: onNext,
        fieldIds: fieldIds,
        shouldSaveDraft: shouldSaveDraft,
    });
}
