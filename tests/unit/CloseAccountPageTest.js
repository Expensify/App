"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var LoginUtils_1 = require("@libs/LoginUtils");
var sanitizePhoneOrEmail = function (value) { return value.replace(/\s/g, '').toLowerCase(); };
var validatePhoneOrEmail = function (inputValue, storedValue, translate) {
    var _a, _b;
    var errors = {};
    if (inputValue && storedValue) {
        var isValid = false;
        if (expensify_common_1.Str.isValidEmail(storedValue)) {
            isValid = sanitizePhoneOrEmail(storedValue) === sanitizePhoneOrEmail(inputValue);
        }
        else {
            var normalizedStored = (_a = (0, LoginUtils_1.formatE164PhoneNumber)((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)(storedValue))) !== null && _a !== void 0 ? _a : '';
            var normalizedInput = (_b = (0, LoginUtils_1.formatE164PhoneNumber)((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)(inputValue))) !== null && _b !== void 0 ? _b : '';
            isValid = normalizedStored === normalizedInput;
        }
        if (!isValid) {
            errors.phoneOrEmail = translate('closeAccountPage.enterYourDefaultContactMethod');
        }
    }
    return errors;
};
describe('CloseAccountPage Validation', function () {
    var mockTranslate = function () { return 'Please enter your default contact method'; };
    describe('Phone Number Validation', function () {
        it('Should validate matching phone numbers in different formats', function () {
            var storedPhone = '+1 (234) 567-8901';
            var testCases = ['+1 (234) 567-8901', '+12345678901', '+1 234 567 8901'];
            testCases.forEach(function (inputPhone) {
                var errors = validatePhoneOrEmail(inputPhone, storedPhone, mockTranslate);
                expect(errors.phoneOrEmail).toBeUndefined();
            });
        });
        it('Should reject non-matching phone numbers', function () {
            var storedPhone = '+1 (234) 567-8901';
            var wrongNumbers = ['+1 (234) 567-8902', '+1 (555) 123-4567', '+44 20 8759 9036'];
            wrongNumbers.forEach(function (inputPhone) {
                var errors = validatePhoneOrEmail(inputPhone, storedPhone, mockTranslate);
                expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
            });
        });
        it('Should handle international phone numbers', function () {
            var storedPhone = '+44 20 8759 9036';
            var validInputs = ['+44 20 8759 9036', '+442087599036', '44 20 8759 9036'];
            validInputs.forEach(function (inputPhone) {
                var errors = validatePhoneOrEmail(inputPhone, storedPhone, mockTranslate);
                expect(errors.phoneOrEmail).toBeUndefined();
            });
        });
    });
    describe('Email Validation', function () {
        it('Should validate matching emails with different casing and spacing', function () {
            var storedEmail = 'user@example.com';
            var testCases = ['user@example.com', 'USER@EXAMPLE.COM', ' user@example.com ', 'User@Example.Com'];
            testCases.forEach(function (inputEmail) {
                var errors = validatePhoneOrEmail(inputEmail, storedEmail, mockTranslate);
                expect(errors.phoneOrEmail).toBeUndefined();
            });
        });
        it('Should reject non-matching emails', function () {
            var storedEmail = 'user@example.com';
            var wrongEmails = ['different@example.com', 'user@different.com', 'user@example.net'];
            wrongEmails.forEach(function (inputEmail) {
                var errors = validatePhoneOrEmail(inputEmail, storedEmail, mockTranslate);
                expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
            });
        });
    });
    describe('Mixed Validation', function () {
        it('Should reject phone input when stored value is email', function () {
            var storedEmail = 'user@example.com';
            var phoneInput = '+1 (234) 567-8901';
            var errors = validatePhoneOrEmail(phoneInput, storedEmail, mockTranslate);
            expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
        });
        it('Should reject email input when stored value is phone', function () {
            var storedPhone = '+1 (234) 567-8901';
            var emailInput = 'user@example.com';
            var errors = validatePhoneOrEmail(emailInput, storedPhone, mockTranslate);
            expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
        });
    });
    describe('Edge Cases', function () {
        it('Should handle empty inputs', function () {
            var errors = validatePhoneOrEmail('', 'user@example.com', mockTranslate);
            expect(errors.phoneOrEmail).toBeUndefined();
        });
        it('Should handle invalid phone number formats', function () {
            var storedPhone = '+1 (234) 567-8901';
            var invalidInputs = ['invalid-phone', '123', 'not-a-number'];
            invalidInputs.forEach(function (inputPhone) {
                var errors = validatePhoneOrEmail(inputPhone, storedPhone, mockTranslate);
                expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
            });
        });
    });
});
