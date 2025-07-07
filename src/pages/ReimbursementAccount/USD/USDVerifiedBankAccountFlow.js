"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var BankInfo_1 = require("./BankInfo/BankInfo");
var BeneficialOwnersStep_1 = require("./BeneficialOwnerInfo/BeneficialOwnersStep");
var BusinessInfo_1 = require("./BusinessInfo/BusinessInfo");
var CompleteVerification_1 = require("./CompleteVerification/CompleteVerification");
var ConnectBankAccount_1 = require("./ConnectBankAccount/ConnectBankAccount");
var RequestorStep_1 = require("./Requestor/RequestorStep");
function USDVerifiedBankAccountFlow(_a) {
    var _b;
    var USDBankAccountStep = _a.USDBankAccountStep, _c = _a.policyID, policyID = _c === void 0 ? '' : _c, onBackButtonPress = _a.onBackButtonPress, requestorStepRef = _a.requestorStepRef, onfidoToken = _a.onfidoToken, setUSDBankAccountStep = _a.setUSDBankAccountStep, setShouldShowConnectedVerifiedBankAccount = _a.setShouldShowConnectedVerifiedBankAccount;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    switch (USDBankAccountStep) {
        case CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            return (<BankInfo_1.default onBackButtonPress={onBackButtonPress} policyID={policyID} setUSDBankAccountStep={setUSDBankAccountStep}/>);
        case CONST_1.default.BANK_ACCOUNT.STEP.REQUESTOR:
            return (<RequestorStep_1.default ref={requestorStepRef} shouldShowOnfido={!!(onfidoToken && !((_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.isOnfidoSetupComplete))} onBackButtonPress={onBackButtonPress}/>);
        case CONST_1.default.BANK_ACCOUNT.STEP.COMPANY:
            return <BusinessInfo_1.default onBackButtonPress={onBackButtonPress}/>;
        case CONST_1.default.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS:
            return <BeneficialOwnersStep_1.default onBackButtonPress={onBackButtonPress}/>;
        case CONST_1.default.BANK_ACCOUNT.STEP.ACH_CONTRACT:
            return <CompleteVerification_1.default onBackButtonPress={onBackButtonPress}/>;
        case CONST_1.default.BANK_ACCOUNT.STEP.VALIDATION:
            return (<ConnectBankAccount_1.default onBackButtonPress={onBackButtonPress} setUSDBankAccountStep={setUSDBankAccountStep} setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount}/>);
        default:
            return null;
    }
}
USDVerifiedBankAccountFlow.displayName = 'USDVerifiedBankAccountFlow';
exports.default = USDVerifiedBankAccountFlow;
