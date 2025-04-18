"use strict";
exports.__esModule = true;
exports.formatPhoneNumber = void 0;
var expensify_common_1 = require("expensify-common");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PhoneNumber_1 = require("./PhoneNumber");
var countryCodeByIP;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COUNTRY_CODE,
    callback: function (val) { return (countryCodeByIP = val !== null && val !== void 0 ? val : 1); }
});
/**
 * Returns a locally converted phone number for numbers from the same region
 * and an internationally converted phone number with the country code for numbers from other regions
 */
function formatPhoneNumber(number) {
    var _a;
    if (!number) {
        return '';
    }
    // eslint-disable-next-line no-param-reassign
    number = number.replace(/ /g, '\u00A0');
    // do not parse the string, if it doesn't contain the SMS domain and it's not a phone number
    if (number.indexOf(CONST_1["default"].SMS.DOMAIN) === -1 && !CONST_1["default"].REGEX.DIGITS_AND_PLUS.test(number)) {
        return number;
    }
    var numberWithoutSMSDomain = expensify_common_1.Str.removeSMSDomain(number);
    var parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(numberWithoutSMSDomain);
    // return the string untouched if it's not a phone number
    if (!parsedPhoneNumber.valid) {
        if ((_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.international) {
            return parsedPhoneNumber.number.international;
        }
        return numberWithoutSMSDomain;
    }
    var regionCode = parsedPhoneNumber.countryCode;
    if (regionCode === countryCodeByIP) {
        return parsedPhoneNumber.number.national;
    }
    return parsedPhoneNumber.number.international;
}
exports.formatPhoneNumber = formatPhoneNumber;
