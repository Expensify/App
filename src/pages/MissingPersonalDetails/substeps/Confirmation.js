"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationStep_1 = require("@components/SubStepForms/ConfirmationStep");
var useLocalize_1 = require("@hooks/useLocalize");
var CONST_1 = require("@src/CONST");
var PersonalDetailsForm_1 = require("@src/types/form/PersonalDetailsForm");
var PERSONAL_DETAILS_STEP_INDEXES = CONST_1.default.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING;
function Confirmation(_a) {
    var values = _a.personalDetailsValues, onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var summaryItems = [
        {
            description: translate('personalInfoStep.legalName'),
            title: "".concat(values[PersonalDetailsForm_1.default.LEGAL_FIRST_NAME], " ").concat(values[PersonalDetailsForm_1.default.LEGAL_LAST_NAME]),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_DETAILS_STEP_INDEXES.LEGAL_NAME);
            },
        },
        {
            description: translate('common.dob'),
            title: values[PersonalDetailsForm_1.default.DATE_OF_BIRTH],
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_DETAILS_STEP_INDEXES.DATE_OF_BIRTH);
            },
        },
        {
            description: translate('personalInfoStep.address'),
            title: "".concat(values[PersonalDetailsForm_1.default.ADDRESS_LINE_1], ", ").concat(values[PersonalDetailsForm_1.default.ADDRESS_LINE_2] ? "".concat(values[PersonalDetailsForm_1.default.ADDRESS_LINE_2], ", ") : '').concat(values[PersonalDetailsForm_1.default.CITY], ", ").concat(values[PersonalDetailsForm_1.default.STATE], ", ").concat(values[PersonalDetailsForm_1.default.ZIP_POST_CODE].toUpperCase(), ", ").concat(values[PersonalDetailsForm_1.default.COUNTRY]),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_DETAILS_STEP_INDEXES.ADDRESS);
            },
        },
        {
            description: translate('common.phoneNumber'),
            title: values[PersonalDetailsForm_1.default.PHONE_NUMBER],
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(PERSONAL_DETAILS_STEP_INDEXES.PHONE_NUMBER);
            },
        },
    ];
    return (<ConfirmationStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} pageTitle={translate('personalInfoStep.letsDoubleCheck')} summaryItems={summaryItems} showOnfidoLinks={false}/>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
