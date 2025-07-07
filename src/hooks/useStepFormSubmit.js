"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useStepFormSubmit;
var react_1 = require("react");
var FormActions = require("@userActions/FormActions");
/**
 * Hook for handling submit method in substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param formId - ID for particular form
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
function useStepFormSubmit(_a) {
    var formId = _a.formId, onNext = _a.onNext, fieldIds = _a.fieldIds, shouldSaveDraft = _a.shouldSaveDraft;
    return (0, react_1.useCallback)(function (values) {
        if (shouldSaveDraft) {
            var stepValues = fieldIds.reduce(function (acc, key) {
                acc[key] = values[key];
                return acc;
            }, {});
            FormActions.setDraftValues(formId, stepValues);
            onNext(stepValues);
            return;
        }
        onNext();
    }, [onNext, formId, fieldIds, shouldSaveDraft]);
}
