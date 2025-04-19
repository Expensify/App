'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
exports.addSMSDomainIfPhoneNumber = exports.parsePhoneNumber = void 0;
// eslint-disable-next-line no-restricted-imports
var awesome_phonenumber_1 = require('awesome-phonenumber');
var expensify_common_1 = require('expensify-common');
var CONST_1 = require('@src/CONST');
/**
 * Wraps awesome-phonenumber's parsePhoneNumber function to handle the case where we want to treat
 * a US phone number that's technically valid as invalid. eg: +115005550009.
 * See https://github.com/Expensify/App/issues/28492
 */
function parsePhoneNumber(phoneNumber, options) {
    var parsedPhoneNumber = awesome_phonenumber_1.parsePhoneNumber(phoneNumber, options);
    if (!parsedPhoneNumber.possible) {
        return parsedPhoneNumber;
    }
    var phoneNumberWithoutSpecialChars = phoneNumber.replace(CONST_1['default'].REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
    if (!/^\+11[0-9]{10}$/.test(phoneNumberWithoutSpecialChars)) {
        return parsedPhoneNumber;
    }
    var countryCode = phoneNumberWithoutSpecialChars.substring(0, 2);
    var phoneNumberWithoutCountryCode = phoneNumberWithoutSpecialChars.substring(2);
    return __assign(__assign({}, parsedPhoneNumber), {
        valid: false,
        possible: false,
        number: __assign(__assign({}, parsedPhoneNumber.number), {
            // mimic the behavior of awesome-phonenumber
            e164: phoneNumberWithoutSpecialChars,
            international: countryCode + ' ' + phoneNumberWithoutCountryCode,
            national: phoneNumberWithoutCountryCode,
            rfc3966: 'tel:' + countryCode + '-' + phoneNumberWithoutCountryCode,
            significant: phoneNumberWithoutCountryCode,
        }),
    });
}
exports.parsePhoneNumber = parsePhoneNumber;
/**
 * Adds expensify SMS domain (@expensify.sms) if login is a phone number and if it's not included yet
 */
function addSMSDomainIfPhoneNumber(login) {
    var _a;
    if (login === void 0) {
        login = '';
    }
    var parsedPhoneNumber = parsePhoneNumber(login);
    if (parsedPhoneNumber.possible && !expensify_common_1.Str.isValidEmail(login)) {
        return '' + ((_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) + CONST_1['default'].SMS.DOMAIN;
    }
    return login;
}
exports.addSMSDomainIfPhoneNumber = addSMSDomainIfPhoneNumber;
