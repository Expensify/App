import Onyx from 'react-native-onyx';
import {appendCountryCode, getEmailDomain, getPhoneLogin, getPhoneNumberWithoutSpecialChars, isDomainPublic, isEmailPublicDomain, validateNumber} from '@libs/LoginUtils';
import CONST from '@src/CONST';
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
            const parsedPhone = getPhoneNumberWithoutSpecialChars(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number even if received special chars', () => {
            const givenPhone = '+1(234) 56-7\t8-9 01';
            const parsedPhone = getPhoneNumberWithoutSpecialChars(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
    });
    describe('appendCountryCode', () => {
        it('Should return valid phone number with country code when received a phone with country code', () => {
            const givenPhone = '+12345678901';
            const countryCode = CONST.DEFAULT_COUNTRY_CODE;
            const parsedPhone = appendCountryCode(givenPhone, countryCode);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number with country code when received a phone without country code', () => {
            const givenPhone = '2345678901';
            const countryCode = CONST.DEFAULT_COUNTRY_CODE;
            const parsedPhone = appendCountryCode(givenPhone, countryCode);
            expect(parsedPhone).toBe('+12345678901');
        });
    });
    describe('isEmailPublicDomain', () => {
        it('Should return true if email is from public domain', () => {
            const givenEmail = 'test@gmail.com';
            const parsedEmail = isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(true);
        });
        it('Should return false if email is not from public domain', () => {
            const givenEmail = 'test@test.com';
            const parsedEmail = isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(false);
        });
        it("Should return false if provided string isn't email", () => {
            const givenEmail = 'test';
            const parsedEmail = isEmailPublicDomain(givenEmail);
            expect(parsedEmail).toBe(false);
        });
    });
    describe('validateNumber', () => {
        it("Should return valid phone number with '@expensify.sms' suffix if provided phone number is valid", () => {
            const givenPhone = '+12345678901';
            const parsedPhone = validateNumber(givenPhone);
            expect(parsedPhone).toBe('+12345678901@expensify.sms');
        });
        it('Should return empty string if provided phone number is not valid', () => {
            const givenPhone = '786';
            const parsedPhone = validateNumber(givenPhone);
            expect(parsedPhone).toBe('');
        });
        it('Should return empty string if provided phone number is empty', () => {
            const givenPhone = '';
            const parsedPhone = validateNumber(givenPhone);
            expect(parsedPhone).toBe('');
        });
    });
    describe('getPhoneLogin', () => {
        it('Should return valid phone number with country code if provided phone number is valid and with country code', () => {
            const givenPhone = '+12345678901';
            const countryCode = CONST.DEFAULT_COUNTRY_CODE;
            const parsedPhone = getPhoneLogin(givenPhone, countryCode);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number with country code if provided phone number is valid and without country code', () => {
            const givenPhone = '2345678901';
            const countryCode = CONST.DEFAULT_COUNTRY_CODE;
            const parsedPhone = getPhoneLogin(givenPhone, countryCode);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return empty string if provided phone number is empty', () => {
            const givenPhone = '';
            const countryCode = CONST.DEFAULT_COUNTRY_CODE;
            const parsedPhone = getPhoneLogin(givenPhone, countryCode);
            expect(parsedPhone).toBe('');
        });
    });
    describe('isDomainPublic', () => {
        it('Should return true for public domains', () => {
            expect(isDomainPublic('gmail.com')).toBe(true);
            expect(isDomainPublic('yahoo.com')).toBe(true);
            expect(isDomainPublic('hotmail.com')).toBe(true);
        });

        it('Should return false for private/custom domains', () => {
            expect(isDomainPublic('expensify.com')).toBe(false);
            expect(isDomainPublic('customdomain.com')).toBe(false);
            expect(isDomainPublic('test.org')).toBe(false);
        });

        it('Should return false for empty string', () => {
            expect(isDomainPublic('')).toBe(false);
        });

        it('Should handle case sensitivity correctly', () => {
            expect(isDomainPublic('GMAIL.COM')).toBe(false);
            expect(isDomainPublic('Gmail.Com')).toBe(false);
        });
    });

    describe('getEmailDomain', () => {
        it('Should extract domain from valid email addresses', () => {
            expect(getEmailDomain('user@gmail.com')).toBe('gmail.com');
            expect(getEmailDomain('test@example.org')).toBe('example.org');
            expect(getEmailDomain('admin@company.co.uk')).toBe('company.co.uk');
        });

        it('Should handle emails with multiple dots in domain', () => {
            expect(getEmailDomain('user@sub.domain.com')).toBe('sub.domain.com');
        });

        it('Should return lowercase domain', () => {
            expect(getEmailDomain('user@GMAIL.COM')).toBe('gmail.com');
            expect(getEmailDomain('test@Example.ORG')).toBe('example.org');
        });

        it('Should handle emails with uppercase local part', () => {
            expect(getEmailDomain('USER@gmail.com')).toBe('gmail.com');
        });

        it('Should handle invalid email formats gracefully', () => {
            expect(getEmailDomain('email')).toBe('email');
            expect(getEmailDomain('')).toBe('');
            expect(getEmailDomain('@gmail.com')).toBe('gmail.com');
            expect(getEmailDomain('user@')).toBe('');
        });

        it('Should handle emails with special characters', () => {
            expect(getEmailDomain('user+tag@gmail.com')).toBe('gmail.com');
            expect(getEmailDomain('user.name@example.com')).toBe('example.com');
        });
    });
});
