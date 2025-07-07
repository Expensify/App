"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var InternationalDepositAccountContent_1 = require("./InternationalDepositAccountContent");
function InternationalDepositAccount() {
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS), privatePersonalDetails = _a[0], privatePersonalDetailsMetadata = _a[1];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.CORPAY_FIELDS), corpayFields = _b[0], corpayFieldsMetadata = _b[1];
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST), bankAccountList = _c[0], bankAccountListMetadata = _c[1];
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT), draftValues = _d[0], draftValuesMetadata = _d[1];
    var _e = (0, useOnyx_1.default)(ONYXKEYS_1.default.COUNTRY), country = _e[0], countryMetadata = _e[1];
    var _f = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT, { selector: function (personalBankAccount) { return personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.isLoading; } }), isAccountLoading = _f[0], isLoadingMetadata = _f[1];
    var isLoading = (0, isLoadingOnyxValue_1.default)(privatePersonalDetailsMetadata, corpayFieldsMetadata, bankAccountListMetadata, draftValuesMetadata, countryMetadata, isLoadingMetadata);
    if (isLoading) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<InternationalDepositAccountContent_1.default privatePersonalDetails={privatePersonalDetails} corpayFields={corpayFields} bankAccountList={bankAccountList} draftValues={draftValues} country={country} isAccountLoading={isAccountLoading !== null && isAccountLoading !== void 0 ? isAccountLoading : false}/>);
}
InternationalDepositAccount.displayName = 'InternationalDepositAccount';
exports.default = InternationalDepositAccount;
