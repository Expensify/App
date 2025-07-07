"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DateOfBirthStep_1 = require("@components/SubStepForms/DateOfBirthStep");
var useLocalize_1 = require("@hooks/useLocalize");
var usePersonalDetailsFormSubmit_1 = require("@hooks/usePersonalDetailsFormSubmit");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PersonalDetailsForm_1 = require("@src/types/form/PersonalDetailsForm");
var STEP_FIELDS = [PersonalDetailsForm_1.default.DATE_OF_BIRTH];
function DateOfBirth(_a) {
    var isEditing = _a.isEditing, onNext = _a.onNext, onMove = _a.onMove, personalDetailsValues = _a.personalDetailsValues;
    var translate = (0, useLocalize_1.default)().translate;
    var handleSubmit = (0, usePersonalDetailsFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    return (<DateOfBirthStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM} formTitle={translate('privatePersonalDetails.enterDateOfBirth')} onSubmit={handleSubmit} stepFields={STEP_FIELDS} dobInputID={PersonalDetailsForm_1.default.DATE_OF_BIRTH} dobDefaultValue={personalDetailsValues[PersonalDetailsForm_1.default.DATE_OF_BIRTH]}/>);
}
DateOfBirth.displayName = 'DateOfBirth';
exports.default = DateOfBirth;
