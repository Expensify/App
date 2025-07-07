"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var LocalePhoneNumber = require("../../src/libs/LocalePhoneNumber");
var ONYXKEYS_1 = require("../../src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var ES_NUMBER = '+34702474537';
var US_NUMBER = '+18332403627';
var INVALID_NUMBER = '+4818332403627';
var EMAIL_LOGIN = 'user@test.com';
describe('LocalePhoneNumber utils', function () {
    beforeAll(function () {
        return react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    describe('formatPhoneNumber function', function () {
        beforeEach(function () {
            var _a;
            return react_native_onyx_1.default.multiSet((_a = {},
                _a[ONYXKEYS_1.default.SESSION] = { email: 'current@user.com' },
                _a[ONYXKEYS_1.default.COUNTRY_CODE] = 1,
                _a)).then(waitForBatchedUpdates_1.default);
        });
        afterEach(function () { return react_native_onyx_1.default.clear(); });
        it('should display a number from the same region formatted locally', function () {
            expect(LocalePhoneNumber.formatPhoneNumber(US_NUMBER)).toBe('(833) 240-3627');
        });
        it('should display a number from another region formatted internationally', function () {
            expect(LocalePhoneNumber.formatPhoneNumber(ES_NUMBER)).toBe('+34 702 47 45 37');
        });
        it('should display a number with a space after the region code if the phone number is not valid', function () {
            expect(LocalePhoneNumber.formatPhoneNumber(INVALID_NUMBER)).toBe('+48 18332403627');
        });
        it('should display unchanged text if the string passed to the function is not a phone number', function () {
            expect(LocalePhoneNumber.formatPhoneNumber(EMAIL_LOGIN)).toBe('user@test.com');
        });
    });
});
