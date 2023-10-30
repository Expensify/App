import Onyx from 'react-native-onyx';
import * as LoginUtils from '../../src/libs/LoginUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
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
            const parsedPhone = LoginUtils.appendCountryCode(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number with country code when received a phone without country code', () => {
            const givenPhone = '2345678901';
            const parsedPhone = LoginUtils.appendCountryCode(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
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
            const parsedPhone = LoginUtils.getPhoneLogin(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return valid phone number with country code if provided phone number is valid and without country code', () => {
            const givenPhone = '2345678901';
            const parsedPhone = LoginUtils.getPhoneLogin(givenPhone);
            expect(parsedPhone).toBe('+12345678901');
        });
        it('Should return empty string if provided phone number is empty', () => {
            const givenPhone = '';
            const parsedPhone = LoginUtils.getPhoneLogin(givenPhone);
            expect(parsedPhone).toBe('');
        });
    });
});
