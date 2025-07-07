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
var pick_1 = require("lodash/pick");
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var BankAccount_1 = require("@libs/models/BankAccount");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var getInitialSubStepForBusinessInfo_1 = require("@pages/ReimbursementAccount/USD/utils/getInitialSubStepForBusinessInfo");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var BankAccounts_1 = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var AddressBusiness_1 = require("./subSteps/AddressBusiness");
var ConfirmationBusiness_1 = require("./subSteps/ConfirmationBusiness");
var IncorporationCode_1 = require("./subSteps/IncorporationCode");
var IncorporationDateBusiness_1 = require("./subSteps/IncorporationDateBusiness");
var IncorporationStateBusiness_1 = require("./subSteps/IncorporationStateBusiness");
var NameBusiness_1 = require("./subSteps/NameBusiness");
var PhoneNumberBusiness_1 = require("./subSteps/PhoneNumberBusiness");
var TaxIdBusiness_1 = require("./subSteps/TaxIdBusiness");
var TypeBusiness_1 = require("./subSteps/TypeBusiness/TypeBusiness");
var WebsiteBusiness_1 = require("./subSteps/WebsiteBusiness");
var BUSINESS_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP;
var bodyContent = [
    NameBusiness_1.default,
    TaxIdBusiness_1.default,
    WebsiteBusiness_1.default,
    PhoneNumberBusiness_1.default,
    AddressBusiness_1.default,
    TypeBusiness_1.default,
    IncorporationDateBusiness_1.default,
    IncorporationStateBusiness_1.default,
    IncorporationCode_1.default,
    ConfirmationBusiness_1.default,
];
function BusinessInfo(_a) {
    var _b, _c;
    var onBackButtonPress = _a.onBackButtonPress;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var getBankAccountFields = (0, react_1.useCallback)(function (fieldNames) { return (__assign(__assign({}, pick_1.default.apply(void 0, __spreadArray([reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData], fieldNames, false))), pick_1.default.apply(void 0, __spreadArray([reimbursementAccountDraft], fieldNames, false)))); }, [reimbursementAccount, reimbursementAccountDraft]);
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var values = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var submit = (0, react_1.useCallback)(function (isConfirmPage) {
        var _a, _b, _c, _d, _e;
        var companyWebsite = expensify_common_1.Str.sanitizeURL(values.website, CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME);
        (0, BankAccounts_1.updateCompanyInformationForBankAccount)(Number((_b = (_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _a === void 0 ? void 0 : _a.bankAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID), __assign(__assign(__assign({}, values), getBankAccountFields(['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings'])), { companyTaxID: (_c = values.companyTaxID) === null || _c === void 0 ? void 0 : _c.replace(CONST_1.default.REGEX.NON_NUMERIC, ''), companyPhone: (_e = (0, PhoneNumber_1.parsePhoneNumber)((_d = values.companyPhone) !== null && _d !== void 0 ? _d : '', { regionCode: CONST_1.default.COUNTRY.US }).number) === null || _e === void 0 ? void 0 : _e.significant, website: (0, ValidationUtils_1.isValidWebsite)(companyWebsite) ? companyWebsite : undefined }), policyID, isConfirmPage);
    }, [reimbursementAccount, values, getBankAccountFields, policyID]);
    var isBankAccountVerifying = ((_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.state) === BankAccount_1.default.STATE.VERIFYING;
    var startFrom = (0, react_1.useMemo)(function () { return (isBankAccountVerifying ? 0 : (0, getInitialSubStepForBusinessInfo_1.default)(values)); }, [values, isBankAccountVerifying]);
    var _d = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: startFrom, onFinished: function () { return submit(true); }, onNextSubStep: function () { return submit(false); } }), SubStep = _d.componentToRender, isEditing = _d.isEditing, screenIndex = _d.screenIndex, nextScreen = _d.nextScreen, prevScreen = _d.prevScreen, moveTo = _d.moveTo, goToTheLastStep = _d.goToTheLastStep;
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
    return (<InteractiveStepWrapper_1.default wrapperID={BusinessInfo.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('businessInfoStep.businessInfo')} handleBackButtonPress={handleBackButtonPress} startStepIndex={3} stepNames={CONST_1.default.BANK_ACCOUNT.STEP_NAMES}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo}/>
        </InteractiveStepWrapper_1.default>);
}
BusinessInfo.displayName = 'BusinessInfo';
exports.default = BusinessInfo;
