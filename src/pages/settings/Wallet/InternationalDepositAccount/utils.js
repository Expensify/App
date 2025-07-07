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
exports.getFieldsMap = getFieldsMap;
exports.getSubstepValues = getSubstepValues;
exports.getInitialPersonalDetailsValues = getInitialPersonalDetailsValues;
exports.getInitialSubstep = getInitialSubstep;
exports.testValidation = testValidation;
exports.getValidationErrors = getValidationErrors;
var sortBy_1 = require("lodash/sortBy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function getFieldsMap(corpayFields) {
    var _a;
    return ((_a = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.formFields) !== null && _a !== void 0 ? _a : []).reduce(function (acc, field) {
        var _a;
        var _b, _c, _d;
        if (!field.id) {
            return acc;
        }
        if (field.id === CONST_1.default.CORPAY_FIELDS.ACCOUNT_TYPE_KEY) {
            acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE] = (_a = {}, _a[field.id] = field, _a);
        }
        else if (CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.includes(field.id)) {
            acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION] = (_b = acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]) !== null && _b !== void 0 ? _b : {};
            acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION][field.id] = field;
        }
        else if (CONST_1.default.CORPAY_FIELDS.BANK_INFORMATION_FIELDS.includes(field.id)) {
            acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION] = (_c = acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]) !== null && _c !== void 0 ? _c : {};
            acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION][field.id] = field;
        }
        else {
            acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS] = (_d = acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS]) !== null && _d !== void 0 ? _d : {};
            acc[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS][field.id] = field;
        }
        return acc;
    }, {});
}
function getLatestCreatedBankAccount(bankAccountList) {
    return (0, sortBy_1.default)(Object.values(bankAccountList !== null && bankAccountList !== void 0 ? bankAccountList : {}), 'accountData.created').pop();
}
function getSubstepValues(privatePersonalDetails, corpayFields, bankAccountList, internationalBankAccountDraft, country, fieldsMap) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    var address = (0, PersonalDetailsUtils_1.getCurrentAddress)(privatePersonalDetails);
    var personalDetailsFieldMap = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION];
    var street = (address !== null && address !== void 0 ? address : {}).street;
    var _v = street ? street.split('\n') : [undefined, undefined], street1 = _v[0], street2 = _v[1];
    var firstName = (_a = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalFirstName) !== null && _a !== void 0 ? _a : '';
    var lastName = (_b = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalLastName) !== null && _b !== void 0 ? _b : '';
    var fullName = "".concat(firstName, " ").concat(lastName).trim() ? "".concat(firstName, " ").concat(lastName).trim() : undefined;
    var latestBankAccount = getLatestCreatedBankAccount(bankAccountList);
    return __assign(__assign({}, internationalBankAccountDraft), { bankCountry: (_g = (_f = (_e = (_d = (_c = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.bankCountry) !== null && _c !== void 0 ? _c : corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.bankCountry) !== null && _d !== void 0 ? _d : address === null || address === void 0 ? void 0 : address.country) !== null && _e !== void 0 ? _e : latestBankAccount === null || latestBankAccount === void 0 ? void 0 : latestBankAccount.bankCountry) !== null && _f !== void 0 ? _f : country) !== null && _g !== void 0 ? _g : '', bankCurrency: (_h = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.bankCurrency) !== null && _h !== void 0 ? _h : corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.bankCurrency, accountHolderName: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFieldMap === null || personalDetailsFieldMap === void 0 ? void 0 : personalDetailsFieldMap.accountHolderName) ? ((_j = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.accountHolderName) !== null && _j !== void 0 ? _j : fullName) : undefined, accountHolderAddress1: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFieldMap === null || personalDetailsFieldMap === void 0 ? void 0 : personalDetailsFieldMap.accountHolderAddress1) ? ((_k = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.accountHolderAddress1) !== null && _k !== void 0 ? _k : street1) : undefined, accountHolderAddress2: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFieldMap === null || personalDetailsFieldMap === void 0 ? void 0 : personalDetailsFieldMap.accountHolderAddress2) ? ((_l = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.accountHolderAddress2) !== null && _l !== void 0 ? _l : street2) : undefined, accountHolderCity: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFieldMap === null || personalDetailsFieldMap === void 0 ? void 0 : personalDetailsFieldMap.accountHolderCity) ? ((_m = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.accountHolderCity) !== null && _m !== void 0 ? _m : address === null || address === void 0 ? void 0 : address.city) : undefined, accountHolderCountry: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFieldMap === null || personalDetailsFieldMap === void 0 ? void 0 : personalDetailsFieldMap.accountHolderCountry)
            ? ((_s = (_r = (_q = (_p = (_o = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.accountHolderCountry) !== null && _o !== void 0 ? _o : corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.bankCountry) !== null && _p !== void 0 ? _p : address === null || address === void 0 ? void 0 : address.country) !== null && _q !== void 0 ? _q : latestBankAccount === null || latestBankAccount === void 0 ? void 0 : latestBankAccount.bankCountry) !== null && _r !== void 0 ? _r : country) !== null && _s !== void 0 ? _s : '')
            : undefined, accountHolderPostal: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFieldMap === null || personalDetailsFieldMap === void 0 ? void 0 : personalDetailsFieldMap.accountHolderPostal) ? ((_t = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.accountHolderPostal) !== null && _t !== void 0 ? _t : address === null || address === void 0 ? void 0 : address.zip) : undefined, accountHolderPhoneNumber: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFieldMap === null || personalDetailsFieldMap === void 0 ? void 0 : personalDetailsFieldMap.accountHolderPhoneNumber)
            ? ((_u = internationalBankAccountDraft === null || internationalBankAccountDraft === void 0 ? void 0 : internationalBankAccountDraft.accountHolderPhoneNumber) !== null && _u !== void 0 ? _u : privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.phoneNumber)
            : undefined });
}
function getInitialPersonalDetailsValues(privatePersonalDetails) {
    var _a, _b, _c, _d, _e, _f;
    var address = (0, PersonalDetailsUtils_1.getCurrentAddress)(privatePersonalDetails);
    var street = (address !== null && address !== void 0 ? address : {}).street;
    var _g = street ? street.split('\n') : [undefined, undefined], street1 = _g[0], street2 = _g[1];
    var firstName = (_a = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalFirstName) !== null && _a !== void 0 ? _a : '';
    var lastName = (_b = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalLastName) !== null && _b !== void 0 ? _b : '';
    var fullName = "".concat(firstName, " ").concat(lastName).trim();
    return {
        accountHolderName: fullName,
        accountHolderAddress1: street1 !== null && street1 !== void 0 ? street1 : '',
        accountHolderAddress2: street2 !== null && street2 !== void 0 ? street2 : '',
        accountHolderCity: (_c = address === null || address === void 0 ? void 0 : address.city) !== null && _c !== void 0 ? _c : '',
        accountHolderCountry: (_d = address === null || address === void 0 ? void 0 : address.country) !== null && _d !== void 0 ? _d : '',
        accountHolderPostal: (_e = address === null || address === void 0 ? void 0 : address.zip) !== null && _e !== void 0 ? _e : '',
        accountHolderPhoneNumber: (_f = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.phoneNumber) !== null && _f !== void 0 ? _f : '',
    };
}
function testValidation(values, fieldsMap) {
    var _a, _b;
    if (fieldsMap === void 0) { fieldsMap = {}; }
    for (var fieldName in fieldsMap) {
        if (!fieldName) {
            // eslint-disable-next-line no-continue
            continue;
        }
        if (fieldsMap[fieldName].isRequired && ((_a = values[fieldName]) !== null && _a !== void 0 ? _a : '') === '') {
            return false;
        }
        for (var _i = 0, _c = fieldsMap[fieldName].validationRules; _i < _c.length; _i++) {
            var rule = _c[_i];
            var regExpCheck = new RegExp(rule.regEx);
            if (!regExpCheck.test((_b = values[fieldName]) !== null && _b !== void 0 ? _b : '')) {
                return false;
            }
        }
    }
    return true;
}
function getInitialSubstep(values, fieldsMap) {
    if (values.bankCountry === '' || (0, EmptyObject_1.isEmptyObject)(fieldsMap)) {
        return CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.COUNTRY_SELECTOR;
    }
    if (values.bankCurrency === '' || !testValidation(values, fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS])) {
        return CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS;
    }
    if (!testValidation(values, fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE])) {
        return CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_TYPE;
    }
    if (!testValidation(values, fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION])) {
        return CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.BANK_INFORMATION;
    }
    if (!testValidation(values, fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION])) {
        return CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_HOLDER_INFORMATION;
    }
    return CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION;
}
function getValidationErrors(values, fieldsMap, translate) {
    var errors = {};
    Object.entries(fieldsMap).forEach(function (_a) {
        var fieldName = _a[0], field = _a[1];
        if (field.isRequired && values[fieldName] === '') {
            (0, ErrorUtils_1.addErrorMessage)(errors, fieldName, translate('common.error.fieldRequired'));
            return;
        }
        field.validationRules.forEach(function (rule) {
            var regExpCheck = new RegExp(rule.regEx);
            if (!regExpCheck.test(values[fieldName])) {
                (0, ErrorUtils_1.addErrorMessage)(errors, fieldName, rule.errorMessage);
            }
        });
    });
    return errors;
}
