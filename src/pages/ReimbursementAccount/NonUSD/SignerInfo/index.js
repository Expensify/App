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
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var YesNoStep_1 = require("@components/SubStepForms/YesNoStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var Navigation_1 = require("@navigation/Navigation");
var getSignerDetailsAndSignerFilesForSignerInfo_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getSignerDetailsAndSignerFilesForSignerInfo");
var BankAccounts_1 = require("@userActions/BankAccounts");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var EnterEmail_1 = require("./EnterEmail");
var HangTight_1 = require("./HangTight");
var Address_1 = require("./subSteps/Address");
var Confirmation_1 = require("./subSteps/Confirmation");
var DateOfBirth_1 = require("./subSteps/DateOfBirth");
var JobTitle_1 = require("./subSteps/JobTitle");
var Name_1 = require("./subSteps/Name");
var UploadDocuments_1 = require("./subSteps/UploadDocuments");
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
var SUBSTEP = CONST_1.default.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SUBSTEP;
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, OWNS_MORE_THAN_25_PERCENT = _a.OWNS_MORE_THAN_25_PERCENT, COMPANY_NAME = _a.COMPANY_NAME;
var fullBodyContent = [Name_1.default, JobTitle_1.default, DateOfBirth_1.default, Address_1.default, UploadDocuments_1.default, Confirmation_1.default];
var userIsOwnerBodyContent = [JobTitle_1.default, UploadDocuments_1.default, Confirmation_1.default];
function SignerInfo(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var onBackButtonPress = _a.onBackButtonPress, onSubmit = _a.onSubmit;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var currency = (_c = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _c !== void 0 ? _c : '';
    var isUserOwner = (_g = (_f = (_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.corpay) === null || _e === void 0 ? void 0 : _e[OWNS_MORE_THAN_25_PERCENT]) !== null && _f !== void 0 ? _f : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[OWNS_MORE_THAN_25_PERCENT]) !== null && _g !== void 0 ? _g : false;
    var companyName = (_l = (_k = (_j = (_h = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _h === void 0 ? void 0 : _h.corpay) === null || _j === void 0 ? void 0 : _j[COMPANY_NAME]) !== null && _k !== void 0 ? _k : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[COMPANY_NAME]) !== null && _l !== void 0 ? _l : '';
    var bankAccountID = (_o = (_m = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _m === void 0 ? void 0 : _m.bankAccountID) !== null && _o !== void 0 ? _o : CONST_1.default.DEFAULT_NUMBER_ID;
    var _p = (0, react_1.useState)(SUBSTEP.IS_DIRECTOR), currentSubStep = _p[0], setCurrentSubStep = _p[1];
    var _q = (0, react_1.useState)(false), isUserDirector = _q[0], setIsUserDirector = _q[1];
    var submit = (0, react_1.useCallback)(function () {
        var _a;
        var _b = (0, getSignerDetailsAndSignerFilesForSignerInfo_1.default)(reimbursementAccountDraft, (_a = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _a !== void 0 ? _a : '', isUserOwner), signerDetails = _b.signerDetails, signerFiles = _b.signerFiles;
        (0, BankAccounts_1.saveCorpayOnboardingDirectorInformation)(__assign(__assign({ inputs: JSON.stringify(signerDetails) }, signerFiles), { bankAccountID: bankAccountID }));
    }, [account === null || account === void 0 ? void 0 : account.primaryLogin, bankAccountID, isUserOwner, reimbursementAccountDraft]);
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) || (reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingDirectorInformation) || !(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess)) {
            return;
        }
        if (reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess) {
            if (currency === CONST_1.default.CURRENCY.AUD) {
                setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
                (0, BankAccounts_1.clearReimbursementAccountSaveCorpayOnboardingDirectorInformation)();
                return;
            }
            onSubmit();
            (0, BankAccounts_1.clearReimbursementAccountSaveCorpayOnboardingDirectorInformation)();
        }
        return function () {
            (0, BankAccounts_1.clearReimbursementAccountSaveCorpayOnboardingDirectorInformation)();
        };
    }, [reimbursementAccount, onSubmit, currency]);
    var bodyContent = (0, react_1.useMemo)(function () {
        if (isUserOwner) {
            return userIsOwnerBodyContent;
        }
        return fullBodyContent;
    }, [isUserOwner]);
    var _r = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: 0, onFinished: submit }), SignerDetailsForm = _r.componentToRender, isEditing = _r.isEditing, screenIndex = _r.screenIndex, nextScreen = _r.nextScreen, prevScreen = _r.prevScreen, moveTo = _r.moveTo, goToTheLastStep = _r.goToTheLastStep;
    var handleNextSubStep = (0, react_1.useCallback)(function (value) {
        if (currentSubStep === SUBSTEP.IS_DIRECTOR) {
            // user is director so we gather their data
            if (value) {
                setIsUserDirector(value);
                setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
                return;
            }
            setIsUserDirector(value);
            setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
            return;
        }
        setIsUserDirector(value);
        setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
    }, [currentSubStep]);
    var handleBackButtonPress = (0, react_1.useCallback)(function () {
        (0, FormActions_1.clearErrors)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (currentSubStep === SUBSTEP.IS_DIRECTOR) {
            onBackButtonPress();
        }
        else if (currentSubStep === SUBSTEP.ENTER_EMAIL && isUserDirector) {
            setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
        }
        else if (currentSubStep === SUBSTEP.SIGNER_DETAILS_FORM && screenIndex > 0) {
            prevScreen();
        }
        else if (currentSubStep === SUBSTEP.SIGNER_DETAILS_FORM && screenIndex === 0) {
            setCurrentSubStep(SUBSTEP.IS_DIRECTOR);
        }
        else if (currentSubStep === SUBSTEP.HANG_TIGHT) {
            Navigation_1.default.goBack();
        }
        else if (currentSubStep === SUBSTEP.ARE_YOU_DIRECTOR) {
            setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
        }
        else {
            setCurrentSubStep(function (subStep) { return subStep - 1; });
        }
    }, [currentSubStep, goToTheLastStep, isEditing, isUserDirector, onBackButtonPress, prevScreen, screenIndex]);
    var handleEmailSubmit = (0, react_1.useCallback)(function () {
        // TODO: the message to the email provided in the previous step should be sent
        setCurrentSubStep(SUBSTEP.HANG_TIGHT);
    }, []);
    return (<InteractiveStepWrapper_1.default wrapperID={SignerInfo.displayName} handleBackButtonPress={handleBackButtonPress} headerTitle={translate('signerInfoStep.signerInfo')} stepNames={CONST_1.default.NON_USD_BANK_ACCOUNT.STEP_NAMES} startStepIndex={4}>
            {currentSubStep === SUBSTEP.IS_DIRECTOR && (<YesNoStep_1.default title={translate('signerInfoStep.areYouDirector', { companyName: companyName })} description={translate('signerInfoStep.regulationRequiresUs')} defaultValue={isUserDirector} onSelectedValue={handleNextSubStep}/>)}

            {currentSubStep === SUBSTEP.SIGNER_DETAILS_FORM && (<SignerDetailsForm isEditing={isEditing} onNext={nextScreen} onMove={moveTo}/>)}

            {currentSubStep === SUBSTEP.ENTER_EMAIL && (<EnterEmail_1.default onSubmit={handleEmailSubmit} isUserDirector={isUserDirector}/>)}

            {currentSubStep === SUBSTEP.HANG_TIGHT && <HangTight_1.default tempSubmit={onSubmit}/>}
        </InteractiveStepWrapper_1.default>);
}
SignerInfo.displayName = 'SignerInfo';
exports.default = SignerInfo;
