"use strict";
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
var useSubStep_1 = require("@hooks/useSubStep");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccounts_1 = require("@userActions/BankAccounts");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AddressUBO_1 = require("./subSteps/BeneficialOwnerDetailsFormSubSteps/AddressUBO");
var ConfirmationUBO_1 = require("./subSteps/BeneficialOwnerDetailsFormSubSteps/ConfirmationUBO");
var DateOfBirthUBO_1 = require("./subSteps/BeneficialOwnerDetailsFormSubSteps/DateOfBirthUBO");
var LegalNameUBO_1 = require("./subSteps/BeneficialOwnerDetailsFormSubSteps/LegalNameUBO");
var SocialSecurityNumberUBO_1 = require("./subSteps/BeneficialOwnerDetailsFormSubSteps/SocialSecurityNumberUBO");
var CompanyOwnersListUBO_1 = require("./subSteps/CompanyOwnersListUBO");
var SUBSTEP = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUBSTEP;
var MAX_NUMBER_OF_UBOS = 4;
var bodyContent = [LegalNameUBO_1.default, DateOfBirthUBO_1.default, SocialSecurityNumberUBO_1.default, AddressUBO_1.default, ConfirmationUBO_1.default];
function BeneficialOwnersStep(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var onBackButtonPress = _a.onBackButtonPress;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var companyName = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.companyName) !== null && _c !== void 0 ? _c : '';
    var policyID = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.policyID;
    var defaultValues = {
        ownsMoreThan25Percent: (_g = (_f = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _e === void 0 ? void 0 : _e.ownsMoreThan25Percent) !== null && _f !== void 0 ? _f : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft.ownsMoreThan25Percent) !== null && _g !== void 0 ? _g : false,
        hasOtherBeneficialOwners: (_k = (_j = (_h = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _h === void 0 ? void 0 : _h.hasOtherBeneficialOwners) !== null && _j !== void 0 ? _j : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft.hasOtherBeneficialOwners) !== null && _k !== void 0 ? _k : false,
        beneficialOwnerKeys: (_o = (_m = (_l = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _l === void 0 ? void 0 : _l.beneficialOwnerKeys) !== null && _m !== void 0 ? _m : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft.beneficialOwnerKeys) !== null && _o !== void 0 ? _o : [],
    };
    // We're only reading beneficialOwnerKeys from draft values because there is not option to remove UBO
    // if we were to set them based on values saved in BE then there would be no option to enter different UBOs
    // user would always see the same UBOs that was saved in BE when returning to this step and trying to change something
    var _p = (0, react_1.useState)(defaultValues.beneficialOwnerKeys), beneficialOwnerKeys = _p[0], setBeneficialOwnerKeys = _p[1];
    var _q = (0, react_1.useState)(''), beneficialOwnerBeingModifiedID = _q[0], setBeneficialOwnerBeingModifiedID = _q[1];
    var _r = (0, react_1.useState)(false), isEditingCreatedBeneficialOwner = _r[0], setIsEditingCreatedBeneficialOwner = _r[1];
    var _s = (0, react_1.useState)(defaultValues.ownsMoreThan25Percent), isUserUBO = _s[0], setIsUserUBO = _s[1];
    var _t = (0, react_1.useState)(defaultValues.hasOtherBeneficialOwners), isAnyoneElseUBO = _t[0], setIsAnyoneElseUBO = _t[1];
    var _u = (0, react_1.useState)(1), currentUBOSubStep = _u[0], setCurrentUBOSubStep = _u[1];
    var canAddMoreUBOS = beneficialOwnerKeys.length < (isUserUBO ? MAX_NUMBER_OF_UBOS - 1 : MAX_NUMBER_OF_UBOS);
    var submit = function () {
        var _a, _b;
        var beneficialOwnerFields = ['firstName', 'lastName', 'dob', 'ssnLast4', 'street', 'city', 'state', 'zipCode'];
        var beneficialOwners = beneficialOwnerKeys.map(function (ownerKey) {
            return beneficialOwnerFields.reduce(function (acc, fieldName) {
                acc[fieldName] = reimbursementAccountDraft ? String(reimbursementAccountDraft["beneficialOwner_".concat(ownerKey, "_").concat(fieldName)]) : undefined;
                return acc;
            }, {});
        });
        (0, BankAccounts_1.updateBeneficialOwnersForBankAccount)(Number((_b = (_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _a === void 0 ? void 0 : _a.bankAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID), {
            ownsMoreThan25Percent: isUserUBO,
            beneficialOwners: JSON.stringify(beneficialOwners),
            beneficialOwnerKeys: beneficialOwnerKeys,
        }, policyID);
    };
    var addBeneficialOwner = function (beneficialOwnerID) {
        // Each beneficial owner is assigned a unique key that will connect it to values in saved ONYX.
        // That way we can dynamically render each Identity Form based on which keys are present in the beneficial owners array.
        var newBeneficialOwners = __spreadArray(__spreadArray([], beneficialOwnerKeys, true), [beneficialOwnerID], false);
        setBeneficialOwnerKeys(newBeneficialOwners);
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, { beneficialOwners: JSON.stringify(newBeneficialOwners) });
    };
    var handleBeneficialOwnerDetailsFormSubmit = function () {
        var shouldAddBeneficialOwner = !beneficialOwnerKeys.find(function (beneficialOwnerID) { return beneficialOwnerID === beneficialOwnerBeingModifiedID; }) && canAddMoreUBOS;
        if (shouldAddBeneficialOwner) {
            addBeneficialOwner(beneficialOwnerBeingModifiedID);
        }
        // Because beneficialOwnerKeys array is not yet updated at this point we need to check against lower MAX_NUMBER_OF_UBOS (account for the one that is being added)
        var isLastUBOThatCanBeAdded = beneficialOwnerKeys.length === (isUserUBO ? MAX_NUMBER_OF_UBOS - 2 : MAX_NUMBER_OF_UBOS - 1);
        setCurrentUBOSubStep(isEditingCreatedBeneficialOwner || isLastUBOThatCanBeAdded ? SUBSTEP.UBOS_LIST : SUBSTEP.ARE_THERE_MORE_UBOS);
        setIsEditingCreatedBeneficialOwner(false);
    };
    var _v = (0, useSubStep_1.default)({
        bodyContent: bodyContent,
        startFrom: 0,
        onFinished: handleBeneficialOwnerDetailsFormSubmit,
    }), BeneficialOwnerDetailsForm = _v.componentToRender, isEditing = _v.isEditing, screenIndex = _v.screenIndex, nextScreen = _v.nextScreen, prevScreen = _v.prevScreen, moveTo = _v.moveTo, resetScreenIndex = _v.resetScreenIndex, goToTheLastStep = _v.goToTheLastStep;
    var prepareBeneficialOwnerDetailsForm = function () {
        var beneficialOwnerID = expensify_common_1.Str.guid();
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        // Reset Beneficial Owner Details Form to first subStep
        resetScreenIndex();
        setCurrentUBOSubStep(SUBSTEP.UBO_DETAILS_FORM);
    };
    var handleNextUBOSubstep = function (value) {
        if (currentUBOSubStep === SUBSTEP.IS_USER_UBO) {
            setIsUserUBO(value);
            // User is an owner but there are 4 other owners already added, so we remove last one
            if (value && beneficialOwnerKeys.length === 4) {
                setBeneficialOwnerKeys(function (previousBeneficialOwners) { return previousBeneficialOwners.slice(0, 3); });
            }
            setCurrentUBOSubStep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            return;
        }
        if (currentUBOSubStep === SUBSTEP.IS_ANYONE_ELSE_UBO) {
            setIsAnyoneElseUBO(value);
            if (!canAddMoreUBOS && value) {
                setCurrentUBOSubStep(SUBSTEP.UBOS_LIST);
                return;
            }
            if (canAddMoreUBOS && value) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }
            // User is not an owner and no one else is an owner
            if (!isUserUBO && !value) {
                submit();
                return;
            }
            // User is an owner and no one else is an owner
            if (isUserUBO && !value) {
                setCurrentUBOSubStep(SUBSTEP.UBOS_LIST);
                return;
            }
        }
        // Are there more UBOs
        if (currentUBOSubStep === SUBSTEP.ARE_THERE_MORE_UBOS) {
            if (value) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }
            setCurrentUBOSubStep(SUBSTEP.UBOS_LIST);
            return;
        }
        // User reached the limit of UBOs
        if (currentUBOSubStep === SUBSTEP.UBO_DETAILS_FORM && !canAddMoreUBOS) {
            setCurrentUBOSubStep(SUBSTEP.UBOS_LIST);
        }
    };
    var handleBackButtonPress = function () {
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        // User goes back to previous step
        if (currentUBOSubStep === SUBSTEP.IS_USER_UBO) {
            onBackButtonPress();
            // User reached limit of UBOs and goes back to initial question about additional UBOs
        }
        else if (currentUBOSubStep === SUBSTEP.UBOS_LIST && !canAddMoreUBOS) {
            setCurrentUBOSubStep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            // User goes back to last radio button
        }
        else if (currentUBOSubStep === SUBSTEP.UBOS_LIST && isAnyoneElseUBO) {
            setCurrentUBOSubStep(SUBSTEP.ARE_THERE_MORE_UBOS);
        }
        else if (currentUBOSubStep === SUBSTEP.UBOS_LIST && isUserUBO && !isAnyoneElseUBO) {
            setCurrentUBOSubStep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            // User moves between subSteps of beneficial owner details form
        }
        else if (currentUBOSubStep === SUBSTEP.UBO_DETAILS_FORM && screenIndex > 0) {
            prevScreen();
        }
        else {
            setCurrentUBOSubStep(function (currentSubstep) { return currentSubstep - 1; });
        }
    };
    var handleUBOEdit = function (beneficialOwnerID) {
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        setIsEditingCreatedBeneficialOwner(true);
        setCurrentUBOSubStep(SUBSTEP.UBO_DETAILS_FORM);
    };
    return (<InteractiveStepWrapper_1.default wrapperID={BeneficialOwnersStep.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('beneficialOwnerInfoStep.companyOwner')} handleBackButtonPress={handleBackButtonPress} startStepIndex={4} stepNames={CONST_1.default.BANK_ACCOUNT.STEP_NAMES}>
            {currentUBOSubStep === SUBSTEP.IS_USER_UBO && (<YesNoStep_1.default title={"".concat(translate('beneficialOwnerInfoStep.doYouOwn25percent'), " ").concat(companyName, "?")} description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')} submitButtonStyles={[styles.mb0]} defaultValue={isUserUBO} onSelectedValue={handleNextUBOSubstep}/>)}

            {currentUBOSubStep === SUBSTEP.IS_ANYONE_ELSE_UBO && (<YesNoStep_1.default title={"".concat(translate('beneficialOwnerInfoStep.doAnyIndividualOwn25percent'), " ").concat(companyName, "?")} description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')} submitButtonStyles={[styles.mb0]} defaultValue={isAnyoneElseUBO} onSelectedValue={handleNextUBOSubstep}/>)}

            {currentUBOSubStep === SUBSTEP.UBO_DETAILS_FORM && (<BeneficialOwnerDetailsForm isEditing={isEditing} beneficialOwnerBeingModifiedID={beneficialOwnerBeingModifiedID} setBeneficialOwnerBeingModifiedID={setBeneficialOwnerBeingModifiedID} onNext={nextScreen} onMove={moveTo}/>)}

            {currentUBOSubStep === SUBSTEP.ARE_THERE_MORE_UBOS && (<YesNoStep_1.default title={"".concat(translate('beneficialOwnerInfoStep.areThereMoreIndividualsWhoOwn25percent'), " ").concat(companyName, "?")} description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')} submitButtonStyles={[styles.mb0]} onSelectedValue={handleNextUBOSubstep} defaultValue={false}/>)}

            {currentUBOSubStep === SUBSTEP.UBOS_LIST && (<CompanyOwnersListUBO_1.default beneficialOwnerKeys={beneficialOwnerKeys} handleUBOsConfirmation={submit} handleUBOEdit={handleUBOEdit} isUserUBO={isUserUBO} isAnyoneElseUBO={isAnyoneElseUBO}/>)}
        </InteractiveStepWrapper_1.default>);
}
BeneficialOwnersStep.displayName = 'BeneficialOwnersStep';
exports.default = BeneficialOwnersStep;
