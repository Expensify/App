"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var LoginUtils = require("@libs/LoginUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('LoginUtils', function () {
    beforeAll(function () {
        var _a;
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            initialKeyStates: (_a = {},
                _a[ONYXKEYS_1.default.COUNTRY_CODE] = 1,
                _a),
        });
        return (0, waitForBatchedUpdates_1.default)();
    });
    afterEach(function () {
        jest.useRealTimers();
        react_native_onyx_1.default.clear();
    });
    describe('getPhoneNumberWithoutSpecialChars', function () {
        it('Should return valid phone number', function () {
            var givenPhone = '+12345678901';
            var parsedPhone = LoginUtils.getPhoneNumberWithoutSpecialChars(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number even if received special chars', function () {
            var givenPhone = '+1(234) 56-7\t8-9 01';
            var parsedPhone = LoginUtils.getPhoneNumberWithoutSpecialChars(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
    });
    describe('appendCountryCode', function () {
        it('Should return valid phone number with country code when received a phone with country code', function () {
            var givenPhone = '+12345678901';
            var parsedPhone = LoginUtils.appendCountryCode(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number with country code when received a phone without country code', function () {
            var givenPhone = '2345678901';
            var parsedPhone = LoginUtils.appendCountryCode(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
    });
    describe('isEmailPublicDomain', function () {
        it('Should return true if email is from public domain', function () {
            var givenEmail = 'test@gmail.com';
            var parsedEmail = LoginUtils.isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(true);
        });
        it('Should return false if email is not from public domain', function () {
            var givenEmail = 'test@test.com';
            var parsedEmail = LoginUtils.isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(false);
        });
        it("Should return false if provided string isn't email", function () {
            var givenEmail = 'test';
            var parsedEmail = LoginUtils.isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(false);
        });
    });
    describe('validateNumber', function () {
        it("Should return valid phone number with '@expensify.sms' suffix if provided phone number is valid", function () {
            var givenPhone = '+12345678901';
            var parsedPhone = LoginUtils.validateNumber(givenPhone);
            expect(parsedPhone).toBe('+12345678901@expensify.sms');
        });
        it('Should return empty string if provided phone number is not valid', function () {
            var givenPhone = '786';
            var parsedPhone = LoginUtils.validateNumber(givenPhone);
            expect(parsedPhone).toBe('');
        });
        it('Should return empty string if provided phone number is empty', function () {
            var givenPhone = '';
            var parsedPhone = LoginUtils.validateNumber(givenPhone);
            expect(parsedPhone).toBe('');
        });
    });
    describe('getPhoneLogin', function () {
        it('Should return valid phone number with country code if provided phone number is valid and with country code', function () {
            var givenPhone = '+12345678901';
            var parsedPhone = LoginUtils.getPhoneLogin(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number with country code if provided phone number is valid and without country code', function () {
            var givenPhone = '2345678901';
            var parsedPhone = LoginUtils.getPhoneLogin(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return empty string if provided phone number is empty', function () {
            var givenPhone = '';
            var parsedPhone = LoginUtils.getPhoneLogin(givenPhone);
            expect(parsedPhone).toBe('');
        });
    });
});
