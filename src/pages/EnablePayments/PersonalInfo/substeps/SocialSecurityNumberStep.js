"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useWalletAdditionalDetailsStepFormSubmit_1 = require("@hooks/useWalletAdditionalDetailsStepFormSubmit");
var ValidationUtils = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WalletAdditionalDetailsForm_1 = require("@src/types/form/WalletAdditionalDetailsForm");
var PERSONAL_INFO_STEP_KEY = WalletAdditionalDetailsForm_1.default.PERSONAL_INFO_STEP;
var STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.SSN_LAST_4];
function SocialSecurityNumberStep(_a) {
    var _b;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var walletAdditionalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_ADDITIONAL_DETAILS)[0];
    var shouldAskForFullSSN = (walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails.errorCode) === CONST_1.default.WALLET.ERROR.SSN;
    var defaultSsnLast4 = (_b = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_STEP_KEY.SSN_LAST_4]) !== null && _b !== void 0 ? _b : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
        if (shouldAskForFullSSN) {
            if (values.ssn && !ValidationUtils.isValidSSNFullNine(values.ssn)) {
                errors.ssn = translate('additionalDetailsStep.ssnFull9Error');
            }
        }
        else if (values.ssn && !ValidationUtils.isValidSSNLastFour(values.ssn)) {
            errors.ssn = translate('bankAccount.error.ssnLast4');
        }
        return errors;
    }, [translate, shouldAskForFullSSN]);
    var handleSubmit = (0, useWalletAdditionalDetailsStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS} formTitle={translate('personalInfoStep.whatsYourSSN')} formDisclaimer={translate('personalInfoStep.noPersonalChecks')} validate={validate} onSubmit={handleSubmit} inputId={PERSONAL_INFO_STEP_KEY.SSN_LAST_4} inputLabel={translate(shouldAskForFullSSN ? 'common.ssnFull9' : 'personalInfoStep.last4SSN')} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} defaultValue={defaultSsnLast4} maxLength={shouldAskForFullSSN ? CONST_1.default.BANK_ACCOUNT.MAX_LENGTH.FULL_SSN : CONST_1.default.BANK_ACCOUNT.MAX_LENGTH.SSN}/>);
}
SocialSecurityNumberStep.displayName = 'SocialSecurityNumberStep';
exports.default = SocialSecurityNumberStep;
