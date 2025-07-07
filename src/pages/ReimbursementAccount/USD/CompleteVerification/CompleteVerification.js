"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var BankAccounts = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var ConfirmAgreements_1 = require("./subSteps/ConfirmAgreements");
var COMPLETE_VERIFICATION_KEYS = ReimbursementAccountForm_1.default.COMPLETE_VERIFICATION;
var bodyContent = [ConfirmAgreements_1.default];
function CompleteVerification(_a) {
    var _b, _c;
    var onBackButtonPress = _a.onBackButtonPress;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var values = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(COMPLETE_VERIFICATION_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var policyID = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID) !== null && _c !== void 0 ? _c : '-1';
    var submit = (0, react_1.useCallback)(function () {
        var _a, _b;
        BankAccounts.acceptACHContractForBankAccount(Number((_b = (_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _a === void 0 ? void 0 : _a.bankAccountID) !== null && _b !== void 0 ? _b : '-1'), {
            isAuthorizedToUseBankAccount: values.isAuthorizedToUseBankAccount,
            certifyTrueInformation: values.certifyTrueInformation,
            acceptTermsAndConditions: values.acceptTermsAndConditions,
        }, policyID);
    }, [reimbursementAccount, values, policyID]);
    var _d = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: 0, onFinished: submit }), SubStep = _d.componentToRender, isEditing = _d.isEditing, screenIndex = _d.screenIndex, nextScreen = _d.nextScreen, prevScreen = _d.prevScreen, moveTo = _d.moveTo, goToTheLastStep = _d.goToTheLastStep;
    var handleBackButtonPress = function () {
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (screenIndex === 0) {
            onBackButtonPress();
        }
        else {
            prevScreen();
        }
    };
    return (<InteractiveStepWrapper_1.default wrapperID={CompleteVerification.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('completeVerificationStep.completeVerification')} handleBackButtonPress={handleBackButtonPress} startStepIndex={5} stepNames={CONST_1.default.BANK_ACCOUNT.STEP_NAMES}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo}/>
        </InteractiveStepWrapper_1.default>);
}
CompleteVerification.displayName = 'CompleteVerification';
exports.default = CompleteVerification;
