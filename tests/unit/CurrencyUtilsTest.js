"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var CurrencyUtils = require("@src/libs/CurrencyUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
// This file can get outdated. In that case, you can follow these steps to update it:
// - open your browser console and navigate to the Network tab
// - refresh the App
// - click on the OpenApp request and in the preview tab locate the key `currencyList`
// - copy the value and format it to valid json using some external tool
// - update currencyList.json
var currencyList_json_1 = require("./currencyList.json");
var currencyCodeList = Object.keys(currencyList_json_1.default);
var AVAILABLE_LOCALES = [CONST_1.default.LOCALES.EN, CONST_1.default.LOCALES.ES];
describe('CurrencyUtils', function () {
    beforeAll(function () {
        var _a;
        react_native_onyx_1.default.init({
            keys: {
                NVP_PREFERRED_LOCALE: ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
                CURRENCY_LIST: ONYXKEYS_1.default.CURRENCY_LIST,
            },
            initialKeyStates: (_a = {},
                _a[ONYXKEYS_1.default.NVP_PREFERRED_LOCALE] = CONST_1.default.LOCALES.DEFAULT,
                _a[ONYXKEYS_1.default.CURRENCY_LIST] = currencyList_json_1.default,
                _a),
        });
        return (0, waitForBatchedUpdates_1.default)();
    });
    beforeEach(function () {
        IntlStore_1.default.load(CONST_1.default.LOCALES.DEFAULT);
        return (0, waitForBatchedUpdates_1.default)();
    });
    afterEach(function () { return react_native_onyx_1.default.clear(); });
    describe('getLocalizedCurrencySymbol', function () {
        test.each(AVAILABLE_LOCALES)('Returns non empty string for all currencyCode with preferredLocale %s', function (preferredLocale) {
            return IntlStore_1.default.load(preferredLocale).then(function () {
                currencyCodeList.forEach(function (currencyCode) {
                    var localizedSymbol = CurrencyUtils.getLocalizedCurrencySymbol(currencyCode);
                    expect(localizedSymbol).toBeTruthy();
                });
            });
        });
    });
    describe('getCurrencyDecimals', function () {
        test('Currency decimals smaller than or equal 2', function () {
            expect(CurrencyUtils.getCurrencyDecimals('JPY')).toBe(0);
            expect(CurrencyUtils.getCurrencyDecimals('USD')).toBe(2);
            expect(CurrencyUtils.getCurrencyDecimals('RSD')).toBe(2);
        });
        test('Currency decimals larger than 2 should return 2', function () {
            // Actual: 3
            expect(CurrencyUtils.getCurrencyDecimals('LYD')).toBe(2);
            // Actual: 4
            expect(CurrencyUtils.getCurrencyDecimals('UYW')).toBe(2);
        });
    });
    describe('getCurrencyUnit', function () {
        test('Currency with decimals smaller than or equal 2', function () {
            expect(CurrencyUtils.getCurrencyUnit('JPY')).toBe(1);
            expect(CurrencyUtils.getCurrencyUnit('USD')).toBe(100);
        });
        test('Currency with decimals larger than 2 should be floor to 2', function () {
            expect(CurrencyUtils.getCurrencyUnit('LYD')).toBe(100);
        });
    });
    describe('convertToBackendAmount', function () {
        test.each([
            [25, 2500],
            [25.25, 2525],
            [25.5, 2550],
            [2500, 250000],
            [80.6, 8060],
            [80.9, 8090],
            [80.99, 8099],
            [25, 2500],
            [25.25, 2525],
            [25.5, 2550],
            [2500, 250000],
            [80.6, 8060],
            [80.9, 8090],
            [80.99, 8099],
        ])('Correctly converts %s to amount in cents (subunit) handled in backend', function (amount, expectedResult) {
            expect(CurrencyUtils.convertToBackendAmount(amount)).toBe(expectedResult);
        });
    });
    describe('convertToFrontendAmountAsInteger', function () {
        test.each([
            [2500, 25, 'USD'],
            [2550, 25.5, 'USD'],
            [25, 0.25, 'USD'],
            [2500, 25, 'USD'],
            [2500.5, 25, 'USD'], // The backend should never send a decimal .5 value
            [2500, 25, 'VND'],
            [2550, 26, 'VND'],
            [25, 0, 'VND'],
            [2586, 26, 'VND'],
            [2500.5, 25, 'VND'], // The backend should never send a decimal .5 value
        ])('Correctly converts %s to amount in units handled in frontend as an integer', function (amount, expectedResult, currency) {
            expect(CurrencyUtils.convertToFrontendAmountAsInteger(amount, currency)).toBe(expectedResult);
        });
    });
    describe('convertToFrontendAmountAsString', function () {
        test.each([
            [2500, '25.00', 'USD'],
            [2550, '25.50', 'USD'],
            [25, '0.25', 'USD'],
            [2500.5, '25.00', 'USD'],
            [null, '', 'USD'],
            [undefined, '', 'USD'],
            [0, '0.00', 'USD'],
            [2500, '25', 'VND'],
            [2550, '26', 'VND'],
            [25, '0', 'VND'],
            [2500.5, '25', 'VND'],
            [null, '', 'VND'],
            [undefined, '', 'VND'],
            [0, '0', 'VND'],
            [2586, '26', 'VND'],
        ])('Correctly converts %s to amount in units handled in frontend as a string', function (input, expectedResult, currency) {
            expect(CurrencyUtils.convertToFrontendAmountAsString(input, currency !== null && currency !== void 0 ? currency : CONST_1.default.CURRENCY.USD)).toBe(expectedResult);
        });
    });
    describe('convertToDisplayString', function () {
        test.each([
            [CONST_1.default.CURRENCY.USD, 25, '$0.25'],
            [CONST_1.default.CURRENCY.USD, 2500, '$25.00'],
            [CONST_1.default.CURRENCY.USD, 150, '$1.50'],
            [CONST_1.default.CURRENCY.USD, 250000, '$2,500.00'],
            ['JPY', 2500, '¥25'],
            ['JPY', 250000, '¥2,500'],
            ['JPY', 2500.5, '¥25'],
            ['RSD', 100, 'RSD\xa01.00'],
            ['RSD', 145, 'RSD\xa01.45'],
            ['BHD', 12345, 'BHD\xa0123.45'],
            ['BHD', 1, 'BHD\xa00.01'],
        ])('Correctly displays %s', function (currency, amount, expectedResult) {
            expect(CurrencyUtils.convertToDisplayString(amount, currency)).toBe(expectedResult);
        });
        test.each([
            ['EUR', 25, '0,25\xa0€'],
            ['EUR', 2500, '25,00\xa0€'],
            ['EUR', 250000, '2500,00\xa0€'],
            ['EUR', 250000000, '2.500.000,00\xa0€'],
        ])('Correctly displays %s in ES locale', function (currency, amount, expectedResult) {
            return IntlStore_1.default.load(CONST_1.default.LOCALES.ES).then(function () { return expect(CurrencyUtils.convertToDisplayString(amount, currency)).toBe(expectedResult); });
        });
    });
    describe('convertToShortDisplayString', function () {
        test.each([
            [CONST_1.default.CURRENCY.USD, 25, '$0'],
            [CONST_1.default.CURRENCY.USD, 2500, '$25'],
            [CONST_1.default.CURRENCY.USD, 150, '$2'],
            [CONST_1.default.CURRENCY.USD, 250000, '$2,500'],
            ['JPY', 2500, '¥25'],
            ['JPY', 250000, '¥2,500'],
            ['JPY', 2500.5, '¥25'],
            ['RSD', 100, 'RSD\xa01'],
            ['RSD', 145, 'RSD\xa01'],
            ['BHD', 12345, 'BHD\xa0123'],
            ['BHD', 1, 'BHD\xa00'],
        ])('Correctly displays %s', function (currency, amount, expectedResult) {
            expect(CurrencyUtils.convertToShortDisplayString(amount, currency)).toBe(expectedResult);
        });
        test.each([
            ['EUR', 25, '0\xa0€'],
            ['EUR', 2500, '25\xa0€'],
            ['EUR', 250000, '2500\xa0€'],
            ['EUR', 250000000, '2.500.000\xa0€'],
        ])('Correctly displays %s in ES locale', function (currency, amount, expectedResult) {
            return IntlStore_1.default.load(CONST_1.default.LOCALES.ES).then(function () { return expect(CurrencyUtils.convertToShortDisplayString(amount, currency)).toBe(expectedResult); });
        });
    });
});
