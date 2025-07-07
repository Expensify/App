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
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var Onfido_1 = require("@components/Onfido");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Growl_1 = require("@libs/Growl");
var BankAccounts_1 = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ONFIDO_ERROR_DISPLAY_DURATION = 10000;
function VerifyIdentity(_a) {
    var _b, _c;
    var onBackButtonPress = _a.onBackButtonPress;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true })[0];
    var onfidoApplicantID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONFIDO_APPLICANT_ID, { canBeMissing: false })[0];
    var onfidoToken = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONFIDO_TOKEN, { canBeMissing: false })[0];
    var _d = (0, react_1.useState)(function () { return Math.floor(Math.random() * 1000000); }), onfidoKey = _d[0], setOnfidoKey = _d[1];
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var bankAccountID = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.bankAccountID;
    var handleOnfidoSuccess = (0, react_1.useCallback)(function (onfidoData) {
        if (!policyID) {
            return;
        }
        (0, BankAccounts_1.verifyIdentityForBankAccount)(Number(bankAccountID), __assign(__assign({}, onfidoData), { applicantID: onfidoApplicantID }), policyID);
        (0, BankAccounts_1.updateReimbursementAccountDraft)({ isOnfidoSetupComplete: true });
    }, [bankAccountID, onfidoApplicantID, policyID]);
    var handleOnfidoError = function () {
        // In case of any unexpected error we log it to the server, show a growl, and return the user back to the requestor step so they can try again.
        Growl_1.default.error(translate('onfidoStep.genericError'), ONFIDO_ERROR_DISPLAY_DURATION);
        (0, BankAccounts_1.clearOnfidoToken)();
        (0, BankAccounts_1.goToWithdrawalAccountSetupStep)(CONST_1.default.BANK_ACCOUNT.STEP.REQUESTOR);
    };
    var handleOnfidoUserExit = function (isUserInitiated) {
        if (isUserInitiated) {
            (0, BankAccounts_1.clearOnfidoToken)();
            (0, BankAccounts_1.goToWithdrawalAccountSetupStep)(CONST_1.default.BANK_ACCOUNT.STEP.REQUESTOR);
        }
        else {
            setOnfidoKey(Math.floor(Math.random() * 1000000));
        }
    };
    return (<InteractiveStepWrapper_1.default wrapperID={VerifyIdentity.displayName} headerTitle={translate('onfidoStep.verifyIdentity')} handleBackButtonPress={onBackButtonPress} startStepIndex={2} stepNames={CONST_1.default.BANK_ACCOUNT.STEP_NAMES} enableEdgeToEdgeBottomSafeAreaPadding>
            <FullPageOfflineBlockingView_1.default addBottomSafeAreaPadding>
                <ScrollView_1.default contentContainerStyle={styles.flex1}>
                    <Onfido_1.default key={onfidoKey} sdkToken={onfidoToken !== null && onfidoToken !== void 0 ? onfidoToken : ''} onUserExit={handleOnfidoUserExit} onError={handleOnfidoError} onSuccess={handleOnfidoSuccess}/>
                </ScrollView_1.default>
            </FullPageOfflineBlockingView_1.default>
        </InteractiveStepWrapper_1.default>);
}
VerifyIdentity.displayName = 'VerifyIdentity';
exports.default = VerifyIdentity;
