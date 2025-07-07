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
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var BankAccount_1 = require("@libs/models/BankAccount");
var getInitialSubStepForPersonalInfo_1 = require("@pages/ReimbursementAccount/USD/utils/getInitialSubStepForPersonalInfo");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var BankAccounts_1 = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var Address_1 = require("./subSteps/Address");
var Confirmation_1 = require("./subSteps/Confirmation");
var DateOfBirth_1 = require("./subSteps/DateOfBirth");
var FullName_1 = require("./subSteps/FullName");
var SocialSecurityNumber_1 = require("./subSteps/SocialSecurityNumber");
var PERSONAL_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP;
var bodyContent = [FullName_1.default, DateOfBirth_1.default, SocialSecurityNumber_1.default, Address_1.default, Confirmation_1.default];
function PersonalInfo(_a, ref) {
    var _b, _c, _d;
    var onBackButtonPress = _a.onBackButtonPress;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var values = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(PERSONAL_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var bankAccountID = Number((_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.bankAccountID);
    var submit = (0, react_1.useCallback)(function (isConfirmPage) {
        (0, BankAccounts_1.updatePersonalInformationForBankAccount)(bankAccountID, __assign({}, values), policyID, isConfirmPage);
    }, [values, bankAccountID, policyID]);
    var isBankAccountVerifying = ((_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.state) === BankAccount_1.default.STATE.VERIFYING;
    var startFrom = (0, react_1.useMemo)(function () { return (isBankAccountVerifying ? 0 : (0, getInitialSubStepForPersonalInfo_1.default)(values)); }, [values, isBankAccountVerifying]);
    var _e = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: startFrom, onFinished: function () { return submit(true); }, onNextSubStep: function () { return submit(false); } }), SubStep = _e.componentToRender, isEditing = _e.isEditing, screenIndex = _e.screenIndex, nextScreen = _e.nextScreen, prevScreen = _e.prevScreen, moveTo = _e.moveTo, goToTheLastStep = _e.goToTheLastStep;
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
    return (<InteractiveStepWrapper_1.default ref={ref} wrapperID={PersonalInfo.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('personalInfoStep.personalInfo')} handleBackButtonPress={handleBackButtonPress} startStepIndex={1} stepNames={CONST_1.default.BANK_ACCOUNT.STEP_NAMES}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo}/>
        </InteractiveStepWrapper_1.default>);
}
PersonalInfo.displayName = 'PersonalInfo';
exports.default = (0, react_1.forwardRef)(PersonalInfo);
