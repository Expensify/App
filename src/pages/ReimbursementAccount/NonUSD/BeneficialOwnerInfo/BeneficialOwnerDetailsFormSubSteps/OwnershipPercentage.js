"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, OWNERSHIP_PERCENTAGE = _a.OWNERSHIP_PERCENTAGE, PREFIX = _a.PREFIX;
function OwnershipPercentage(_a) {
    var _b;
    var onNext = _a.onNext, isEditing = _a.isEditing, onMove = _a.onMove, isUserEnteringHisOwnData = _a.isUserEnteringHisOwnData, ownerBeingModifiedID = _a.ownerBeingModifiedID, totalOwnedPercentage = _a.totalOwnedPercentage, setTotalOwnedPercentage = _a.setTotalOwnedPercentage;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var ownershipPercentageInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(OWNERSHIP_PERCENTAGE);
    var defaultOwnershipPercentage = String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ownershipPercentageInputID]) !== null && _b !== void 0 ? _b : '');
    var formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYoursPercentage' : 'ownershipInfoStep.whatPercentage');
    var validate = (0, react_1.useCallback)(function (values) {
        var _a;
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [ownershipPercentageInputID]);
        if (values[ownershipPercentageInputID] && !(0, ValidationUtils_1.isValidOwnershipPercentage)(String(values[ownershipPercentageInputID]), totalOwnedPercentage, ownerBeingModifiedID)) {
            errors[ownershipPercentageInputID] = translate('bankAccount.error.ownershipPercentage');
        }
        setTotalOwnedPercentage(__assign(__assign({}, totalOwnedPercentage), (_a = {}, _a[ownerBeingModifiedID] = Number(values[ownershipPercentageInputID]), _a)));
        return errors;
    }, [ownerBeingModifiedID, ownershipPercentageInputID, setTotalOwnedPercentage, totalOwnedPercentage, translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: [ownershipPercentageInputID],
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={formTitle} validate={validate} onSubmit={handleSubmit} inputId={ownershipPercentageInputID} inputLabel={translate('ownershipInfoStep.ownership')} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} defaultValue={defaultOwnershipPercentage} shouldShowHelpLinks={false}/>);
}
OwnershipPercentage.displayName = 'OwnershipPercentage';
exports.default = OwnershipPercentage;
