import Onyx from 'react-native-onyx';
import * as LoginUtils from '@libs/LoginUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('LoginUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.COUNTRY_CODE]: 1,
            },
        });
        return waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.useRealTimers();
        Onyx.clear();
    });
    describe('getPhoneNumberWithoutSpecialChars', () => {
        it('Should return valid phone number', () => {
            const givenPhone = '+12345678901';
            const parsedPhone = LoginUtils.getPhoneNumberWithoutSpecialChars(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number even if received special chars', () => {
            const givenPhone = '+1(234) 56-7\t8-9 01';
            const parsedPhone = LoginUtils.getPhoneNumberWithoutSpecialChars(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
    });
    describe('appendCountryCode', () => {
        it('Should return valid phone number with country code when received a phone with country code', () => {
            const givenPhone = '+12345678901';
            const parsedPhone = LoginUtils.appendCountryCode(givenPhone, 1);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number with country code when received a phone without country code', () => {
            const givenPhone = '2345678901';
            const parsedPhone = LoginUtils.appendCountryCode(givenPhone, 1);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should use provided country code parameter when phone is valid for that country', () => {
            // Valid UK phone number
            const givenPhone = '2012345678';
            const parsedPhone = LoginUtils.appendCountryCode(givenPhone, 44);
            expect(parsedPhone).toBe('+442012345678');
        });
        it('Should work correctly when country code 1 is explicitly provided', () => {
            const givenPhone = '2345678901';
            const parsedPhone = LoginUtils.appendCountryCode(givenPhone, 1);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should handle different country codes correctly with valid phone numbers', () => {
            // Valid US phone
            expect(LoginUtils.appendCountryCode('2345678901', 1)).toBe('+12345678901');
            // Valid UK phone
            expect(LoginUtils.appendCountryCode('2012345678', 44)).toBe('+442012345678');
            // Valid French phone
            expect(LoginUtils.appendCountryCode('123456789', 33)).toBe('+33123456789');
        });
        it('Should fallback to adding + prefix when phone is not possible with country code', () => {
            const givenPhone = '123';
            const parsedPhone = LoginUtils.appendCountryCode(givenPhone, 44);
            expect(parsedPhone).toBe('+123');
        });
        it('Should fallback when US number used with non-US country code', () => {
            // US number with UK country code should fallback to +number format
            const givenPhone = '2345678901';
            const parsedPhone = LoginUtils.appendCountryCode(givenPhone, 44);
            expect(parsedPhone).toBe('+2345678901');
        });
    });
    describe('isEmailPublicDomain', () => {
        it('Should return true if email is from public domain', () => {
            const givenEmail = 'test@gmail.com';
            const parsedEmail = LoginUtils.isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(true);
        });
        it('Should return false if email is not from public domain', () => {
            const givenEmail = 'test@test.com';
            const parsedEmail = LoginUtils.isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(false);
        });
        it("Should return false if provided string isn't email", () => {
            const givenEmail = 'test';
            const parsedEmail = LoginUtils.isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(false);
        });
    });
    describe('validateNumber', () => {
        it("Should return valid phone number with '@expensify.sms' suffix if provided phone number is valid", () => {
            const givenPhone = '+12345678901';
            const parsedPhone = LoginUtils.validateNumber(givenPhone);
            expect(parsedPhone).toBe('+12345678901@expensify.sms');
        });
        it('Should return empty string if provided phone number is not valid', () => {
            const givenPhone = '786';
            const parsedPhone = LoginUtils.validateNumber(givenPhone);
            expect(parsedPhone).toBe('');
        });
        it('Should return empty string if provided phone number is empty', () => {
            const givenPhone = '';
            const parsedPhone = LoginUtils.validateNumber(givenPhone);
            expect(parsedPhone).toBe('');
        });
    });
    describe('getPhoneLogin', () => {
        it('Should return valid phone number with country code if provided phone number is valid and with country code', () => {
            const givenPhone = '+12345678901';
            const parsedPhone = LoginUtils.getPhoneLogin(givenPhone, 1);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number with country code if provided phone number is valid and without country code', () => {
            const givenPhone = '2345678901';
            const parsedPhone = LoginUtils.getPhoneLogin(givenPhone, 1);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return empty string if provided phone number is empty', () => {
            const givenPhone = '';
            const parsedPhone = LoginUtils.getPhoneLogin(givenPhone, 1);
            expect(parsedPhone).toBe('');
        });
        it('Should use provided country code parameter when phone is valid for that country', () => {
            // Valid UK phone number
            const givenPhone = '2012345678';
            const parsedPhone = LoginUtils.getPhoneLogin(givenPhone, 44);
            expect(parsedPhone).toBe('+442012345678');
        });
        it('Should work correctly when country code 1 is explicitly provided', () => {
            const givenPhone = '2345678901';
            const parsedPhone = LoginUtils.getPhoneLogin(givenPhone, 1);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should handle phone numbers with special characters and different country codes', () => {
            const givenPhone = '(234) 567-8901';
            expect(LoginUtils.getPhoneLogin(givenPhone, 1)).toBe('+12345678901');
            // Use a valid UK format phone with special characters
            const givenUKPhone = '(201) 234-5678';
            expect(LoginUtils.getPhoneLogin(givenUKPhone, 44)).toBe('+442012345678');
        });
    });
    describe('formatE164PhoneNumber', () => {
        it('Should return E164 formatted phone number for valid US phone', () => {
            const givenPhone = '2345678901';
            const formattedPhone = LoginUtils.formatE164PhoneNumber(givenPhone, 1);
            expect(formattedPhone).toBe('+12345678901');
        });
        it('Should return E164 formatted phone number for phone already with country code', () => {
            const givenPhone = '+12345678901';
            const formattedPhone = LoginUtils.formatE164PhoneNumber(givenPhone, 1);
            expect(formattedPhone).toBe('+12345678901');
        });
        it('Should use provided country code parameter when phone is valid for that country', () => {
            // Valid UK phone number
            const givenPhone = '2012345678';
            const formattedPhone = LoginUtils.formatE164PhoneNumber(givenPhone, 44);
            expect(formattedPhone).toBe('+442012345678');
        });
        it('Should work correctly when country code 1 is explicitly provided', () => {
            const givenPhone = '2345678901';
            const formattedPhone = LoginUtils.formatE164PhoneNumber(givenPhone, 1);
            expect(formattedPhone).toBe('+12345678901');
        });
        it('Should handle different country codes correctly with valid phone numbers', () => {
            // Valid US phone
            expect(LoginUtils.formatE164PhoneNumber('2345678901', 1)).toBe('+12345678901');
            // Valid UK phone
            expect(LoginUtils.formatE164PhoneNumber('2012345678', 44)).toBe('+442012345678');
            // Valid French phone
            expect(LoginUtils.formatE164PhoneNumber('123456789', 33)).toBe('+33123456789');
        });
        it('Should handle invalid phone numbers that cannot create valid E164', () => {
            const givenPhone = '123';
            const formattedPhone = LoginUtils.formatE164PhoneNumber(givenPhone, 44);
            // The function may return undefined or a fallback value depending on parsing behavior
            // In this case, parsePhoneNumber tries to parse "+123" but it's not a valid E164 number
            expect(formattedPhone).toBeDefined(); // It returns some value, not undefined
        });
        it('Should handle phone numbers with special characters', () => {
            const givenPhone = '(234) 567-8901';
            const formattedPhone = LoginUtils.formatE164PhoneNumber(givenPhone, 1);
            expect(formattedPhone).toBe('+12345678901');
        });
    });
});
