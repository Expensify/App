"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var BankAccounts_1 = require("@userActions/BankAccounts");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var Confirmation_1 = require("./subSteps/Confirmation");
var bodyContent = [Confirmation_1.default];
var INPUT_KEYS = {
    PROVIDE_TRUTHFUL_INFORMATION: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION,
    AGREE_TO_TERMS_AND_CONDITIONS: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS,
    CONSENT_TO_PRIVACY_NOTICE: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE,
    AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};
function Agreements(_a) {
    var _b, _c;
    var onBackButtonPress = _a.onBackButtonPress, onSubmit = _a.onSubmit;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var agreementsStepValues = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var bankAccountID = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.bankAccountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID;
    var submit = function () {
        (0, BankAccounts_1.finishCorpayBankAccountOnboarding)({
            inputs: JSON.stringify({
                provideTruthfulInformation: agreementsStepValues.provideTruthfulInformation,
                agreeToTermsAndConditions: agreementsStepValues.agreeToTermsAndConditions,
                consentToPrivacyNotice: agreementsStepValues.consentToPrivacyNotice,
                authorizedToBindClientToAgreement: agreementsStepValues.authorizedToBindClientToAgreement,
            }),
            bankAccountID: bankAccountID,
        });
    };
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) || (reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isFinishingCorpayBankAccountOnboarding) || !(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess)) {
            return;
        }
        if (reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess) {
            onSubmit();
            (0, BankAccounts_1.clearReimbursementAccountFinishCorpayBankAccountOnboarding)();
        }
        return function () {
            (0, BankAccounts_1.clearReimbursementAccountFinishCorpayBankAccountOnboarding)();
        };
    }, [reimbursementAccount, onSubmit]);
    var _d = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: 0, onFinished: submit }), SubStep = _d.componentToRender, isEditing = _d.isEditing, screenIndex = _d.screenIndex, nextScreen = _d.nextScreen, prevScreen = _d.prevScreen, moveTo = _d.moveTo, goToTheLastStep = _d.goToTheLastStep;
    var handleBackButtonPress = function () {
        (0, FormActions_1.clearErrors)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
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
    return (<InteractiveStepWrapper_1.default wrapperID={Agreements.displayName} handleBackButtonPress={handleBackButtonPress} headerTitle={translate('agreementsStep.agreements')} stepNames={CONST_1.default.NON_USD_BANK_ACCOUNT.STEP_NAMES} startStepIndex={5}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo}/>
        </InteractiveStepWrapper_1.default>);
}
Agreements.displayName = 'Agreements';
exports.default = Agreements;
