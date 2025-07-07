"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Agreements_1 = require("./Agreements");
var BankInfo_1 = require("./BankInfo/BankInfo");
var BeneficialOwnerInfo_1 = require("./BeneficialOwnerInfo/BeneficialOwnerInfo");
var BusinessInfo_1 = require("./BusinessInfo/BusinessInfo");
var Country_1 = require("./Country/Country");
var Finish_1 = require("./Finish");
var SignerInfo_1 = require("./SignerInfo");
function NonUSDVerifiedBankAccountFlow(_a) {
    var nonUSDBankAccountStep = _a.nonUSDBankAccountStep, setNonUSDBankAccountStep = _a.setNonUSDBankAccountStep, setShouldShowContinueSetupButton = _a.setShouldShowContinueSetupButton, policyID = _a.policyID, shouldShowContinueSetupButtonValue = _a.shouldShowContinueSetupButtonValue;
    var handleNextNonUSDBankAccountStep = function () {
        switch (nonUSDBankAccountStep) {
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.COUNTRY:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.FINISH);
                break;
            default:
                return null;
        }
    };
    var nonUSDBankAccountsGoBack = function () {
        (0, FormActions_1.clearErrors)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        switch (nonUSDBankAccountStep) {
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.COUNTRY:
                setNonUSDBankAccountStep(null);
                setShouldShowContinueSetupButton(shouldShowContinueSetupButtonValue);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS:
                setNonUSDBankAccountStep(CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO);
                break;
            case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.FINISH:
                setShouldShowContinueSetupButton(true);
                setNonUSDBankAccountStep(null);
                break;
            default:
                return null;
        }
    };
    switch (nonUSDBankAccountStep) {
        case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.COUNTRY:
            return (<Country_1.default onBackButtonPress={nonUSDBankAccountsGoBack} onSubmit={handleNextNonUSDBankAccountStep} policyID={policyID}/>);
        case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO:
            return (<BankInfo_1.default onBackButtonPress={nonUSDBankAccountsGoBack} onSubmit={handleNextNonUSDBankAccountStep} policyID={policyID}/>);
        case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO:
            return (<BusinessInfo_1.default onBackButtonPress={nonUSDBankAccountsGoBack} onSubmit={handleNextNonUSDBankAccountStep}/>);
        case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO:
            return (<BeneficialOwnerInfo_1.default onBackButtonPress={nonUSDBankAccountsGoBack} onSubmit={handleNextNonUSDBankAccountStep}/>);
        case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO:
            return (<SignerInfo_1.default onBackButtonPress={nonUSDBankAccountsGoBack} onSubmit={handleNextNonUSDBankAccountStep}/>);
        case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS:
            return (<Agreements_1.default onBackButtonPress={nonUSDBankAccountsGoBack} onSubmit={handleNextNonUSDBankAccountStep}/>);
        case CONST_1.default.NON_USD_BANK_ACCOUNT.STEP.FINISH:
            return <Finish_1.default />;
        default:
            return null;
    }
}
NonUSDVerifiedBankAccountFlow.displayName = 'NonUSDVerifiedBankAccountFlow';
exports.default = NonUSDVerifiedBankAccountFlow;
