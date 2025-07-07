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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var YesNoStep_1 = require("@components/SubStepForms/YesNoStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useSubStep_1 = require("@hooks/useSubStep");
var getOwnerDetailsAndOwnerFilesForBeneficialOwners_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getOwnerDetailsAndOwnerFilesForBeneficialOwners");
var BankAccounts_1 = require("@userActions/BankAccounts");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var Address_1 = require("./BeneficialOwnerDetailsFormSubSteps/Address");
var Confirmation_1 = require("./BeneficialOwnerDetailsFormSubSteps/Confirmation");
var DateOfBirth_1 = require("./BeneficialOwnerDetailsFormSubSteps/DateOfBirth");
var Documents_1 = require("./BeneficialOwnerDetailsFormSubSteps/Documents");
var Last4SSN_1 = require("./BeneficialOwnerDetailsFormSubSteps/Last4SSN");
var Name_1 = require("./BeneficialOwnerDetailsFormSubSteps/Name");
var OwnershipPercentage_1 = require("./BeneficialOwnerDetailsFormSubSteps/OwnershipPercentage");
var BeneficialOwnersList_1 = require("./BeneficialOwnersList");
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, OWNS_MORE_THAN_25_PERCENT = _a.OWNS_MORE_THAN_25_PERCENT, ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE = _a.ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE, BENEFICIAL_OWNERS = _a.BENEFICIAL_OWNERS, COMPANY_NAME = _a.COMPANY_NAME;
var _b = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, COUNTRY = _b.COUNTRY, PREFIX = _b.PREFIX;
var SUBSTEP = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUBSTEP;
var bodyContent = [Name_1.default, OwnershipPercentage_1.default, DateOfBirth_1.default, Address_1.default, Last4SSN_1.default, Documents_1.default, Confirmation_1.default];
function BeneficialOwnerInfo(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var onBackButtonPress = _a.onBackButtonPress, onSubmit = _a.onSubmit;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var _k = (0, react_1.useState)([]), ownerKeys = _k[0], setOwnerKeys = _k[1];
    var _l = (0, react_1.useState)(CONST_1.default.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY), ownerBeingModifiedID = _l[0], setOwnerBeingModifiedID = _l[1];
    var _m = (0, react_1.useState)(false), isEditingCreatedOwner = _m[0], setIsEditingCreatedOwner = _m[1];
    var _o = (0, react_1.useState)(false), isUserEnteringHisOwnData = _o[0], setIsUserEnteringHisOwnData = _o[1];
    var _p = (0, react_1.useState)(false), isUserOwner = _p[0], setIsUserOwner = _p[1];
    var _q = (0, react_1.useState)(false), isAnyoneElseOwner = _q[0], setIsAnyoneElseOwner = _q[1];
    var _r = (0, react_1.useState)(SUBSTEP.IS_USER_BENEFICIAL_OWNER), currentSubStep = _r[0], setCurrentSubStep = _r[1];
    var previousSubStep = (0, usePrevious_1.default)(currentSubStep);
    var _s = (0, react_1.useState)({}), totalOwnedPercentage = _s[0], setTotalOwnedPercentage = _s[1];
    var companyName = (_e = (_d = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.corpay) === null || _c === void 0 ? void 0 : _c[COMPANY_NAME]) !== null && _d !== void 0 ? _d : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[COMPANY_NAME]) !== null && _e !== void 0 ? _e : '';
    var bankAccountID = (_g = (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _f === void 0 ? void 0 : _f.bankAccountID) !== null && _g !== void 0 ? _g : CONST_1.default.DEFAULT_NUMBER_ID;
    var totalOwnedPercentageSum = Object.values(totalOwnedPercentage).reduce(function (acc, value) { return acc + value; }, 0);
    var canAddMoreOwners = totalOwnedPercentageSum <= 75;
    var submit = function (_a) {
        var _b;
        var anyIndividualOwn25PercentOrMore = _a.anyIndividualOwn25PercentOrMore;
        var _c = (0, getOwnerDetailsAndOwnerFilesForBeneficialOwners_1.default)(ownerKeys, reimbursementAccountDraft), ownerDetails = _c.ownerDetails, ownerFiles = _c.ownerFiles;
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_b = {},
            _b[OWNS_MORE_THAN_25_PERCENT] = isUserOwner,
            _b[ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE] = isAnyoneElseOwner,
            _b[BENEFICIAL_OWNERS] = JSON.stringify(ownerDetails),
            _b));
        (0, BankAccounts_1.saveCorpayOnboardingBeneficialOwners)(__assign(__assign({ inputs: JSON.stringify(__assign(__assign({}, ownerDetails), { anyIndividualOwn25PercentOrMore: anyIndividualOwn25PercentOrMore })) }, ownerFiles), { beneficialOwnerIDs: ownerKeys.length > 0 ? ownerKeys.join(',') : undefined, bankAccountID: bankAccountID }));
    };
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) || (reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingBeneficialOwnersFields) || !(reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess)) {
            return;
        }
        if (reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSuccess) {
            onSubmit();
            (0, BankAccounts_1.clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners)();
        }
        return function () {
            (0, BankAccounts_1.clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners)();
        };
    }, [reimbursementAccount, onSubmit]);
    var addOwner = function (ownerID) {
        var newOwners = __spreadArray(__spreadArray([], ownerKeys, true), [ownerID], false);
        setOwnerKeys(newOwners);
    };
    var handleOwnerDetailsFormSubmit = function () {
        var isFreshOwner = ownerKeys.find(function (ownerID) { return ownerID === ownerBeingModifiedID; }) === undefined;
        if (isFreshOwner) {
            addOwner(ownerBeingModifiedID);
        }
        var nextSubStep;
        if (isEditingCreatedOwner || !canAddMoreOwners) {
            nextSubStep = SUBSTEP.BENEFICIAL_OWNERS_LIST;
        }
        else {
            nextSubStep = isUserEnteringHisOwnData ? SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER : SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS;
        }
        setCurrentSubStep(nextSubStep);
        setIsEditingCreatedOwner(false);
    };
    var _t = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: 0, onFinished: handleOwnerDetailsFormSubmit }), BeneficialOwnerDetailsForm = _t.componentToRender, isEditing = _t.isEditing, screenIndex = _t.screenIndex, nextScreen = _t.nextScreen, prevScreen = _t.prevScreen, moveTo = _t.moveTo, resetScreenIndex = _t.resetScreenIndex, goToTheLastStep = _t.goToTheLastStep;
    var prepareOwnerDetailsForm = function () {
        var ownerID = expensify_common_1.Str.guid();
        setOwnerBeingModifiedID(ownerID);
        resetScreenIndex();
        setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
    };
    var handleOwnerEdit = function (ownerID) {
        setOwnerBeingModifiedID(ownerID);
        setIsEditingCreatedOwner(true);
        setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
    };
    var countryStepCountryValue = (_h = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _h !== void 0 ? _h : '';
    var beneficialOwnerAddressCountryInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(COUNTRY);
    var beneficialOwnerAddressCountryValue = (_j = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[beneficialOwnerAddressCountryInputID]) !== null && _j !== void 0 ? _j : '';
    var handleBackButtonPress = function () {
        (0, FormActions_1.clearErrors)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (currentSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER) {
            onBackButtonPress();
        }
        else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && !canAddMoreOwners) {
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
        }
        else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && isAnyoneElseOwner) {
            setCurrentSubStep(SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS);
        }
        else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && isUserOwner && !isAnyoneElseOwner) {
            setCurrentSubStep(SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER);
        }
        else if (currentSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER) {
            setCurrentSubStep(SUBSTEP.IS_USER_BENEFICIAL_OWNER);
        }
        else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && screenIndex > 0) {
            if (screenIndex === 5) {
                // User is on documents sub step and is not from US (no SSN needed)
                if (beneficialOwnerAddressCountryValue !== CONST_1.default.COUNTRY.US) {
                    moveTo(3, false);
                    return;
                }
            }
            if (screenIndex === 6) {
                // User is on confirmation screen and is GB (no SSN or documents needed)
                if (countryStepCountryValue === CONST_1.default.COUNTRY.GB && beneficialOwnerAddressCountryValue === CONST_1.default.COUNTRY.GB) {
                    moveTo(3, false);
                    return;
                }
            }
            prevScreen();
        }
        else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && previousSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER) {
            setCurrentSubStep(SUBSTEP.IS_USER_BENEFICIAL_OWNER);
        }
        else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && previousSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER) {
            setCurrentSubStep(SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER);
        }
        else {
            setCurrentSubStep(function (subStep) { return subStep - 1; });
        }
    };
    var handleNextSubStep = function (value) {
        if (currentSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER) {
            // User is owner so we gather his data
            if (value) {
                setIsUserOwner(value);
                setIsUserEnteringHisOwnData(value);
                setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
                return;
            }
            setIsUserOwner(value);
            setIsUserEnteringHisOwnData(value);
            setOwnerKeys(function (currentOwnersKeys) { return currentOwnersKeys.filter(function (key) { return key !== CONST_1.default.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY; }); });
            // User is an owner but there are 4 other owners already added, so we remove last one
            if (value && ownerKeys.length === 4) {
                setOwnerKeys(function (previousBeneficialOwners) { return previousBeneficialOwners.slice(0, 3); });
            }
            setCurrentSubStep(SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER);
            return;
        }
        if (currentSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER) {
            setIsAnyoneElseOwner(value);
            setIsUserEnteringHisOwnData(false);
            // Someone else is an owner so we gather his data
            if (canAddMoreOwners && value) {
                prepareOwnerDetailsForm();
                return;
            }
            // User went back in the flow, but he cannot add more owners, so we send him back to owners list
            if (!canAddMoreOwners && value) {
                setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
                return;
            }
            // User is not an owner and no one else is an owner
            if (!isUserOwner && !value) {
                setOwnerKeys([]);
                submit({ anyIndividualOwn25PercentOrMore: false });
                return;
            }
            // User is an owner and no one else is an owner
            if (isUserOwner && !value) {
                setOwnerKeys([CONST_1.default.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY]);
                setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
                return;
            }
        }
        // Are there more UBOs
        if (currentSubStep === SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS) {
            setIsUserEnteringHisOwnData(false);
            // User went back in the flow, but he cannot add more owners, so we send him back to owners list
            if (!canAddMoreOwners && value) {
                setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
                return;
            }
            // Gather data of another owner
            if (value) {
                setIsAnyoneElseOwner(true);
                prepareOwnerDetailsForm();
                return;
            }
            // No more owners and no need to gather entity chart, so we send user to owners list
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
            return;
        }
        // User reached the limit of UBOs
        if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && !canAddMoreOwners) {
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
        }
    };
    return (<InteractiveStepWrapper_1.default wrapperID={BeneficialOwnerInfo.displayName} handleBackButtonPress={handleBackButtonPress} headerTitle={translate('ownershipInfoStep.ownerInfo')} stepNames={CONST_1.default.NON_USD_BANK_ACCOUNT.STEP_NAMES} startStepIndex={3}>
            {currentSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER && (<YesNoStep_1.default title={translate('ownershipInfoStep.doYouOwn', { companyName: companyName })} description={translate('ownershipInfoStep.regulationsRequire')} defaultValue={isUserOwner} onSelectedValue={handleNextSubStep} isLoading={reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingBeneficialOwnersFields}/>)}

            {currentSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER && (<YesNoStep_1.default title={translate('ownershipInfoStep.doesAnyoneOwn', { companyName: companyName })} description={translate('ownershipInfoStep.regulationsRequire')} defaultValue={isAnyoneElseOwner} onSelectedValue={handleNextSubStep} isLoading={reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingBeneficialOwnersFields}/>)}

            {currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && (<BeneficialOwnerDetailsForm isEditing={isEditing} onNext={nextScreen} onMove={moveTo} ownerBeingModifiedID={ownerBeingModifiedID} setOwnerBeingModifiedID={setOwnerBeingModifiedID} isUserEnteringHisOwnData={isUserEnteringHisOwnData} totalOwnedPercentage={totalOwnedPercentage} setTotalOwnedPercentage={setTotalOwnedPercentage}/>)}

            {currentSubStep === SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS && (<YesNoStep_1.default title={translate('ownershipInfoStep.areThereOther', { companyName: companyName })} description={translate('ownershipInfoStep.regulationsRequire')} defaultValue={false} onSelectedValue={handleNextSubStep} isLoading={reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isSavingCorpayOnboardingBeneficialOwnersFields}/>)}

            {currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && (<BeneficialOwnersList_1.default handleConfirmation={submit} handleOwnerEdit={handleOwnerEdit} ownerKeys={ownerKeys}/>)}
        </InteractiveStepWrapper_1.default>);
}
BeneficialOwnerInfo.displayName = 'BeneficialOwnerInfo';
exports.default = BeneficialOwnerInfo;
