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
exports.LocaleContext = void 0;
exports.LocaleContextProvider = LocaleContextProvider;
var react_1 = require("react");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useOnyx_1 = require("@hooks/useOnyx");
var DateUtils_1 = require("@libs/DateUtils");
var LocaleDigitUtils_1 = require("@libs/LocaleDigitUtils");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Localize_1 = require("@libs/Localize");
var NumberFormatUtils_1 = require("@libs/NumberFormatUtils");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LocaleContext = (0, react_1.createContext)({
    translate: function () { return ''; },
    numberFormat: function () { return ''; },
    getLocalDateFromDatetime: function () { return new Date(); },
    datetimeToRelative: function () { return ''; },
    datetimeToCalendarTime: function () { return ''; },
    formatPhoneNumber: function () { return ''; },
    toLocaleDigit: function () { return ''; },
    toLocaleOrdinal: function () { return ''; },
    fromLocaleDigit: function () { return ''; },
    preferredLocale: undefined,
});
exports.LocaleContext = LocaleContext;
function LocaleContextProvider(_a) {
    var children = _a.children;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING, { initWithStoredValues: false, canBeMissing: true })[0], areTranslationsLoading = _b === void 0 ? true : _b;
    var _c = (0, react_1.useState)(function () { return IntlStore_1.default.getCurrentLocale(); }), currentLocale = _c[0], setCurrentLocale = _c[1];
    (0, react_1.useEffect)(function () {
        if (areTranslationsLoading) {
            return;
        }
        var locale = IntlStore_1.default.getCurrentLocale();
        if (!locale) {
            return;
        }
        setCurrentLocale(locale);
    }, [areTranslationsLoading]);
    var selectedTimezone = (0, react_1.useMemo)(function () { var _a; return (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone) === null || _a === void 0 ? void 0 : _a.selected; }, [currentUserPersonalDetails]);
    var translate = (0, react_1.useMemo)(function () {
        return function (path) {
            var parameters = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                parameters[_i - 1] = arguments[_i];
            }
            return Localize_1.translate.apply(void 0, __spreadArray([currentLocale, path], parameters, false));
        };
    }, [currentLocale]);
    var numberFormat = (0, react_1.useMemo)(function () { return function (number, options) { return (0, NumberFormatUtils_1.format)(currentLocale, number, options); }; }, [currentLocale]);
    var getLocalDateFromDatetime = (0, react_1.useMemo)(function () { return function (datetime, currentSelectedTimezone) { return DateUtils_1.default.getLocalDateFromDatetime(currentLocale, datetime, currentSelectedTimezone !== null && currentSelectedTimezone !== void 0 ? currentSelectedTimezone : selectedTimezone); }; }, [currentLocale, selectedTimezone]);
    var datetimeToRelative = (0, react_1.useMemo)(function () { return function (datetime) { return DateUtils_1.default.datetimeToRelative(currentLocale, datetime); }; }, [currentLocale]);
    var datetimeToCalendarTime = (0, react_1.useMemo)(function () {
        return function (datetime, includeTimezone, isLowercase) {
            if (isLowercase === void 0) { isLowercase = false; }
            return DateUtils_1.default.datetimeToCalendarTime(currentLocale, datetime, includeTimezone, selectedTimezone, isLowercase);
        };
    }, [currentLocale, selectedTimezone]);
    var formatPhoneNumber = (0, react_1.useMemo)(function () { return function (phoneNumber) { return (0, LocalePhoneNumber_1.formatPhoneNumber)(phoneNumber); }; }, []);
    var toLocaleDigit = (0, react_1.useMemo)(function () { return function (digit) { return (0, LocaleDigitUtils_1.toLocaleDigit)(currentLocale, digit); }; }, [currentLocale]);
    var toLocaleOrdinal = (0, react_1.useMemo)(function () {
        return function (number, writtenOrdinals) {
            if (writtenOrdinals === void 0) { writtenOrdinals = false; }
            return (0, LocaleDigitUtils_1.toLocaleOrdinal)(currentLocale, number, writtenOrdinals);
        };
    }, [currentLocale]);
    var fromLocaleDigit = (0, react_1.useMemo)(function () { return function (localeDigit) { return (0, LocaleDigitUtils_1.fromLocaleDigit)(currentLocale, localeDigit); }; }, [currentLocale]);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        translate: translate,
        numberFormat: numberFormat,
        getLocalDateFromDatetime: getLocalDateFromDatetime,
        datetimeToRelative: datetimeToRelative,
        datetimeToCalendarTime: datetimeToCalendarTime,
        formatPhoneNumber: formatPhoneNumber,
        toLocaleDigit: toLocaleDigit,
        toLocaleOrdinal: toLocaleOrdinal,
        fromLocaleDigit: fromLocaleDigit,
        preferredLocale: currentLocale,
    }); }, [translate, numberFormat, getLocalDateFromDatetime, datetimeToRelative, datetimeToCalendarTime, formatPhoneNumber, toLocaleDigit, toLocaleOrdinal, fromLocaleDigit, currentLocale]);
    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}
LocaleContextProvider.displayName = 'LocaleContextProvider';
