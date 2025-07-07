"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullNameStep_1 = require("@components/SubStepForms/FullNameStep");
var useLocalize_1 = require("@hooks/useLocalize");
var usePersonalDetailsFormSubmit_1 = require("@hooks/usePersonalDetailsFormSubmit");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PersonalDetailsForm_1 = require("@src/types/form/PersonalDetailsForm");
var STEP_FIELDS = [PersonalDetailsForm_1.default.LEGAL_FIRST_NAME, PersonalDetailsForm_1.default.LEGAL_LAST_NAME];
function LegalName(_a) {
    var isEditing = _a.isEditing, onNext = _a.onNext, onMove = _a.onMove, personalDetailsValues = _a.personalDetailsValues;
    var translate = (0, useLocalize_1.default)().translate;
    var defaultValues = {
        firstName: personalDetailsValues[PersonalDetailsForm_1.default.LEGAL_FIRST_NAME],
        lastName: personalDetailsValues[PersonalDetailsForm_1.default.LEGAL_LAST_NAME],
    };
    var handleSubmit = (0, usePersonalDetailsFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    return (<FullNameStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM} formTitle={translate('privatePersonalDetails.enterLegalName')} onSubmit={handleSubmit} stepFields={STEP_FIELDS} firstNameInputID={PersonalDetailsForm_1.default.LEGAL_FIRST_NAME} lastNameInputID={PersonalDetailsForm_1.default.LEGAL_LAST_NAME} defaultValues={defaultValues} shouldShowHelpLinks={false}/>);
}
LegalName.displayName = 'LegalName';
exports.default = LegalName;
