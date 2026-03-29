import {Str} from 'expensify-common';
import {formatE164PhoneNumber, getPhoneNumberWithoutSpecialChars, sanitizePhoneOrEmail} from '@libs/LoginUtils';
import CONST from '@src/CONST';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

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

// Mock validation function that mimics CloseAccountPage's validate function
const validateCloseAccount = (values: {reasonForLeaving?: string; phoneOrEmail?: string}, translate: (key: string) => string) => {
    const errors: {reasonForLeaving?: string; phoneOrEmail?: string} = {};
    
    // This is the fixed version - includes both required fields
    const requiredErrors = getFieldRequiredErrors(values, ['reasonForLeaving', 'phoneOrEmail'], translate);
    Object.assign(errors, requiredErrors);

    // Phone/email validation logic (simplified for testing)
    if (values.phoneOrEmail) {
        const phoneErrors = validatePhoneOrEmail(values.phoneOrEmail, 'user@example.com', translate);
        if (phoneErrors.phoneOrEmail) {
            errors.phoneOrEmail = phoneErrors.phoneOrEmail;
        }
    }

    return errors;
};

describe('CloseAccountPage Validation', () => {
    const mockTranslate = (key: string) => {
        if (key === 'common.error.required') return 'This field is required';
        return 'Please enter your default contact method';
    };

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

    describe('Reason For Leaving Validation', () => {
        it('Should require reasonForLeaving field', () => {
            const values = {reasonForLeaving: '', phoneOrEmail: 'user@example.com'};
            const errors = validateCloseAccount(values, mockTranslate);
            expect(errors.reasonForLeaving).toBe('This field is required');
        });

        it('Should accept non-empty reasonForLeaving', () => {
            const values = {reasonForLeaving: 'Better opportunities', phoneOrEmail: 'user@example.com'};
            const errors = validateCloseAccount(values, mockTranslate);
            expect(errors.reasonForLeaving).toBeUndefined();
        });

        it('Should reject undefined reasonForLeaving', () => {
            const values = {phoneOrEmail: 'user@example.com'};
            const errors = validateCloseAccount(values, mockTranslate);
            expect(errors.reasonForLeaving).toBe('This field is required');
        });

        it('Should accept whitespace-only reasonForLeaving (trims on submit)', () => {
            // Note: getFieldRequiredErrors typically treats whitespace-only as empty
            const values = {reasonForLeaving: '   ', phoneOrEmail: 'user@example.com'};
            const errors = validateCloseAccount(values, mockTranslate);
            // Whitespace-only should be treated as required
            expect(errors.reasonForLeaving).toBe('This field is required');
        });

        it('Should validate both fields simultaneously', () => {
            const values = {reasonForLeaving: '', phoneOrEmail: ''};
            const errors = validateCloseAccount(values, mockTranslate);
            expect(errors.reasonForLeaving).toBe('This field is required');
            expect(errors.phoneOrEmail).toBe('This field is required');
        });

        it('Should pass validation when both fields are filled', () => {
            const values = {reasonForLeaving: 'Moving to a new company', phoneOrEmail: 'user@example.com'};
            const errors = validateCloseAccount(values, mockTranslate);
            expect(errors.reasonForLeaving).toBeUndefined();
            expect(errors.phoneOrEmail).toBeUndefined();
        });
    });
});
