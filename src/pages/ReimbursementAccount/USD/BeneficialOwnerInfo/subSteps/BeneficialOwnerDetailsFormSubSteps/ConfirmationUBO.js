"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationStep_1 = require("@components/SubStepForms/ConfirmationStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var ErrorUtils = require("@libs/ErrorUtils");
var getValuesForBeneficialOwner_1 = require("@pages/ReimbursementAccount/USD/utils/getValuesForBeneficialOwner");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var UBO_STEP_INDEXES = CONST_1.default.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.UBO;
function ConfirmationUBO(_a) {
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing, beneficialOwnerBeingModifiedID = _a.beneficialOwnerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var values = (0, getValuesForBeneficialOwner_1.default)(beneficialOwnerBeingModifiedID, reimbursementAccountDraft);
    var error = reimbursementAccount ? ErrorUtils.getLatestErrorMessage(reimbursementAccount) : '';
    var summaryItems = [
        {
            description: translate('beneficialOwnerInfoStep.legalName'),
            title: "".concat(values.firstName, " ").concat(values.lastName),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(UBO_STEP_INDEXES.LEGAL_NAME);
            },
        },
        {
            description: translate('common.dob'),
            title: values.dob,
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(UBO_STEP_INDEXES.DATE_OF_BIRTH);
            },
        },
        {
            description: translate('beneficialOwnerInfoStep.last4SSN'),
            title: values.ssnLast4,
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(UBO_STEP_INDEXES.SSN);
            },
        },
        {
            description: translate('beneficialOwnerInfoStep.address'),
            title: "".concat(values.street, ", ").concat(values.city, ", ").concat(values.state, " ").concat(values.zipCode),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(UBO_STEP_INDEXES.ADDRESS);
            },
        },
    ];
    return (<ConfirmationStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} pageTitle={translate('beneficialOwnerInfoStep.letsDoubleCheck')} summaryItems={summaryItems} showOnfidoLinks onfidoLinksTitle={"".concat(translate('beneficialOwnerInfoStep.byAddingThisBankAccount'), " ")} error={error}/>);
}
ConfirmationUBO.displayName = 'ConfirmationUBO';
exports.default = ConfirmationUBO;
