'use strict';
exports.__esModule = true;
exports.formatE164PhoneNumber =
    exports.handleSAMLLoginError =
    exports.postSAMLLogin =
    exports.areEmailsFromSamePrivateDomain =
    exports.getPhoneLogin =
    exports.validateNumber =
    exports.isEmailPublicDomain =
    exports.appendCountryCode =
    exports.getPhoneNumberWithoutSpecialChars =
        void 0;
var expensify_common_1 = require('expensify-common');
var react_native_onyx_1 = require('react-native-onyx');
var CONFIG_1 = require('@src/CONFIG');
var CONST_1 = require('@src/CONST');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var ROUTES_1 = require('@src/ROUTES');
var Session_1 = require('./actions/Session');
var Navigation_1 = require('./Navigation/Navigation');
var PhoneNumber_1 = require('./PhoneNumber');
var countryCodeByIP;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COUNTRY_CODE,
    callback: function (val) {
        return (countryCodeByIP = val !== null && val !== void 0 ? val : 1);
    },
});
/**
 * Remove the special chars from the phone number
 */
function getPhoneNumberWithoutSpecialChars(phone) {
    return phone.replace(CONST_1['default'].REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
}
exports.getPhoneNumberWithoutSpecialChars = getPhoneNumberWithoutSpecialChars;
/**
 * Append user country code to the phone number
 */
function appendCountryCode(phone) {
    if (phone.startsWith('+')) {
        return phone;
    }
    var phoneWithCountryCode = '+' + countryCodeByIP + phone;
    if (PhoneNumber_1.parsePhoneNumber(phoneWithCountryCode).possible) {
        return phoneWithCountryCode;
    }
    return '+' + phone;
}
exports.appendCountryCode = appendCountryCode;
/**
 * Check email is public domain or not
 */
function isEmailPublicDomain(email) {
    var emailDomain = expensify_common_1.Str.extractEmailDomain(email).toLowerCase();
    return expensify_common_1.PUBLIC_DOMAINS.includes(emailDomain);
}
exports.isEmailPublicDomain = isEmailPublicDomain;
/**
 * Check if number is valid
 * @returns a valid phone number formatted
 */
function validateNumber(values) {
    var _a;
    var parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(values);
    if (parsedPhoneNumber.possible && expensify_common_1.Str.isValidE164Phone(values.slice(0))) {
        return '' + ((_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) + CONST_1['default'].SMS.DOMAIN;
    }
    return '';
}
exports.validateNumber = validateNumber;
/**
 * Check number is valid and attach country code
 * @returns a valid phone number with country code
 */
function getPhoneLogin(partnerUserID) {
    if (partnerUserID.length === 0) {
        return '';
    }
    return appendCountryCode(getPhoneNumberWithoutSpecialChars(partnerUserID));
}
exports.getPhoneLogin = getPhoneLogin;
/**
 * Check whether 2 emails have the same private domain
 */
function areEmailsFromSamePrivateDomain(email1, email2) {
    if (isEmailPublicDomain(email1) || isEmailPublicDomain(email2)) {
        return false;
    }
    return expensify_common_1.Str.extractEmailDomain(email1).toLowerCase() === expensify_common_1.Str.extractEmailDomain(email2).toLowerCase();
}
exports.areEmailsFromSamePrivateDomain = areEmailsFromSamePrivateDomain;
function postSAMLLogin(body) {
    return fetch(CONFIG_1['default'].EXPENSIFY.SAML_URL, {
        method: CONST_1['default'].NETWORK.METHOD.POST,
        body: body,
        credentials: 'omit',
    }).then(function (response) {
        if (!response.ok) {
            throw new Error('An error occurred while logging in. Please try again');
        }
        return response.json();
    });
}
exports.postSAMLLogin = postSAMLLogin;
function handleSAMLLoginError(errorMessage, shouldClearSignInData) {
    if (shouldClearSignInData) {
        Session_1.clearSignInData();
    }
    Session_1.setAccountError(errorMessage);
    Navigation_1['default'].goBack(ROUTES_1['default'].HOME);
}
exports.handleSAMLLoginError = handleSAMLLoginError;
function formatE164PhoneNumber(phoneNumber) {
    var _a;
    var phoneNumberWithCountryCode = appendCountryCode(phoneNumber);
    var parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(phoneNumberWithCountryCode);
    return (_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164;
}
exports.formatE164PhoneNumber = formatE164PhoneNumber;
