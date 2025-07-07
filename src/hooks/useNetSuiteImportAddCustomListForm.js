"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useNetSuiteImportAddCustomListFormSubmit;
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useStepFormSubmit_1 = require("./useStepFormSubmit");
/**
 * Hook for handling submit method in NetSuite Custom List substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
function useNetSuiteImportAddCustomListFormSubmit(_a) {
    var onNext = _a.onNext, fieldIds = _a.fieldIds, shouldSaveDraft = _a.shouldSaveDraft;
    return (0, useStepFormSubmit_1.default)({
        formId: ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM,
        onNext: onNext,
        fieldIds: fieldIds,
        shouldSaveDraft: shouldSaveDraft,
    });
}
