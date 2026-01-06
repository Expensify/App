import {Str} from 'expensify-common';
import {formatE164PhoneNumber, getPhoneNumberWithoutSpecialChars} from '@libs/LoginUtils';
import CONST from '@src/CONST';

const sanitizePhoneOrEmail = (value: string) => value.replaceAll(/\s/g, '').toLowerCase();

const validatePhoneOrEmail = (inputValue: string, storedValue: string, translate: (key: string) => string, countryCode?: number) => {
    const errors: {phoneOrEmail?: string} = {};

    if (inputValue && storedValue) {
        let isValid = false;

        if (Str.isValidEmail(storedValue)) {
            isValid = sanitizePhoneOrEmail(storedValue) === sanitizePhoneOrEmail(inputValue);
        } else {
            const normalizedStored = formatE164PhoneNumber(getPhoneNumberWithoutSpecialChars(storedValue), countryCode ?? CONST.DEFAULT_COUNTRY_CODE) ?? '';
            const normalizedInput = formatE164PhoneNumber(getPhoneNumberWithoutSpecialChars(inputValue), countryCode ?? CONST.DEFAULT_COUNTRY_CODE) ?? '';
            isValid = normalizedStored === normalizedInput;
        }

        if (!isValid) {
            errors.phoneOrEmail = translate('closeAccountPage.enterYourDefaultContactMethod');
        }
    }

    return errors;
};

describe('CloseAccountPage Validation', () => {
    const mockTranslate = () => 'Please enter your default contact method';

    describe('Phone Number Validation', () => {
        it('Should validate matching phone numbers in different formats', () => {
            const storedPhone = '+1 (234) 567-8901';
            const testCases = ['+1 (234) 567-8901', '+12345678901', '+1 234 567 8901'];
            const countryCode = 1;

            for (const inputPhone of testCases) {
                const errors = validatePhoneOrEmail(inputPhone, storedPhone, mockTranslate, countryCode);
                expect(errors.phoneOrEmail).toBeUndefined();
            }
        });

        it('Should reject non-matching phone numbers', () => {
            const storedPhone = '+1 (234) 567-8901';
            const wrongNumbers = ['+1 (234) 567-8902', '+1 (555) 123-4567', '+44 20 8759 9036'];
            const countryCode = 1;

            for (const inputPhone of wrongNumbers) {
                const errors = validatePhoneOrEmail(inputPhone, storedPhone, mockTranslate, countryCode);
                expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
            }
        });

        it('Should handle international phone numbers', () => {
            const storedPhone = '+44 20 8759 9036';
            const validInputs = ['+44 20 8759 9036', '+442087599036', '44 20 8759 9036'];
            const countryCode = 44;

            for (const inputPhone of validInputs) {
                const errors = validatePhoneOrEmail(inputPhone, storedPhone, mockTranslate, countryCode);
                expect(errors.phoneOrEmail).toBeUndefined();
            }
        });
    });

    describe('Email Validation', () => {
        it('Should validate matching emails with different casing and spacing', () => {
            const storedEmail = 'user@example.com';
            const testCases = ['user@example.com', 'USER@EXAMPLE.COM', ' user@example.com ', 'User@Example.Com'];

            for (const inputEmail of testCases) {
                const errors = validatePhoneOrEmail(inputEmail, storedEmail, mockTranslate);
                expect(errors.phoneOrEmail).toBeUndefined();
            }
        });

        it('Should reject non-matching emails', () => {
            const storedEmail = 'user@example.com';
            const wrongEmails = ['different@example.com', 'user@different.com', 'user@example.net'];

            for (const inputEmail of wrongEmails) {
                const errors = validatePhoneOrEmail(inputEmail, storedEmail, mockTranslate);
                expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
            }
        });
    });

    describe('Mixed Validation', () => {
        it('Should reject phone input when stored value is email', () => {
            const storedEmail = 'user@example.com';
            const phoneInput = '+1 (234) 567-8901';

            const errors = validatePhoneOrEmail(phoneInput, storedEmail, mockTranslate);
            expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
        });

        it('Should reject email input when stored value is phone', () => {
            const storedPhone = '+1 (234) 567-8901';
            const emailInput = 'user@example.com';

            const errors = validatePhoneOrEmail(emailInput, storedPhone, mockTranslate);
            expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
        });
    });

    describe('Edge Cases', () => {
        it('Should handle empty inputs', () => {
            const errors = validatePhoneOrEmail('', 'user@example.com', mockTranslate);
            expect(errors.phoneOrEmail).toBeUndefined();
        });

        it('Should handle invalid phone number formats', () => {
            const storedPhone = '+1 (234) 567-8901';
            const invalidInputs = ['invalid-phone', '123', 'not-a-number'];

            for (const inputPhone of invalidInputs) {
                const errors = validatePhoneOrEmail(inputPhone, storedPhone, mockTranslate);
                expect(errors.phoneOrEmail).toBe('Please enter your default contact method');
            }
        });
    });
});
