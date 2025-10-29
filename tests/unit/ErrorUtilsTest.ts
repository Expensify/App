import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import DateUtils from '@src/libs/DateUtils';
import * as ErrorUtils from '@src/libs/ErrorUtils';
import * as Localize from '@src/libs/Localize';
import type {Errors} from '@src/types/onyx/OnyxCommon';

// Mock DateUtils
jest.mock('@src/libs/DateUtils');

// Mock IntlStore
jest.mock('@src/languages/IntlStore', () => ({
    getCurrentLocale: jest.fn(),
}));

// Mock Localize
jest.mock('@src/libs/Localize', () => ({
    translate: jest.fn(),
    translateLocal: jest.fn(),
}));

describe('ErrorUtils', () => {
    test('should add a new error message for a given inputID', () => {
        const errors: Errors = {};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username cannot be empty');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('should append an error message to an existing error message for a given inputID', () => {
        const errors: Errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must be at least 6 characters long');

        expect(errors).toEqual({username: 'Username cannot be empty\nUsername must be at least 6 characters long'});
    });

    test('should add an error to input which does not contain any errors yet', () => {
        const errors: Errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'password', 'Password cannot be empty');

        expect(errors).toEqual({username: 'Username cannot be empty', password: 'Password cannot be empty'});
    });

    test('should not mutate the errors object when message is empty', () => {
        const errors: Errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', '');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('should not mutate the errors object when inputID is null', () => {
        const errors: Errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, null, 'InputID cannot be null');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('should not mutate the errors object when message is null', () => {
        const errors: Errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', null);

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('should add multiple error messages for the same inputID', () => {
        const errors: Errors = {};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username cannot be empty');
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must be at least 6 characters long');
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must contain at least one letter');

        expect(errors).toEqual({username: 'Username cannot be empty\nUsername must be at least 6 characters long\nUsername must contain at least one letter'});
    });

    test('should append multiple error messages to an existing error message for the same inputID', () => {
        const errors: Errors = {username: 'Username cannot be empty\nUsername must be at least 6 characters long'};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must contain at least one letter');
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must not contain special characters');

        expect(errors).toEqual({
            username: 'Username cannot be empty\nUsername must be at least 6 characters long\nUsername must contain at least one letter\nUsername must not contain special characters',
        });
    });

    describe('getMicroSecondTranslationErrorWithTranslationKey', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should create an error object with microsecond timestamp and translation key', () => {
            const mockMicroseconds = 1234567890123;
            (DateUtils.getMicroseconds as jest.Mock).mockReturnValue(mockMicroseconds);

            const result = ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('passwordForm.error.incorrectLoginOrPassword');

            expect(result).toEqual({
                [mockMicroseconds]: {translationKey: 'passwordForm.error.incorrectLoginOrPassword'},
            });
            expect(DateUtils.getMicroseconds).toHaveBeenCalledTimes(1);
        });

        test('should use provided errorKey instead of generating microsecond timestamp', () => {
            const customErrorKey = 9876543210;
            const result = ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('passwordForm.error.fallback', customErrorKey);

            expect(result).toEqual({
                [customErrorKey]: {translationKey: 'passwordForm.error.fallback'},
            });
            expect(DateUtils.getMicroseconds).not.toHaveBeenCalled();
        });

        test('should handle different translation keys', () => {
            const mockMicroseconds = 1111111111111;
            (DateUtils.getMicroseconds as jest.Mock).mockReturnValue(mockMicroseconds);

            const result = ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('passwordForm.error.incorrectLoginOrPassword');

            expect(result).toEqual({
                [mockMicroseconds]: {translationKey: 'passwordForm.error.incorrectLoginOrPassword'},
            });
        });
    });

    describe('isTranslationKeyError', () => {
        test('should return false for string messages', () => {
            expect(ErrorUtils.isTranslationKeyError('This is a string error')).toBe(false);
            expect(ErrorUtils.isTranslationKeyError('')).toBe(false);
        });

        test('should return false for array messages', () => {
            expect(ErrorUtils.isTranslationKeyError(['error1', 'error2'])).toBe(false);
            expect(ErrorUtils.isTranslationKeyError([])).toBe(false);
        });

        test('should return false for empty objects', () => {
            expect(ErrorUtils.isTranslationKeyError({})).toBe(false);
        });

        test('should return false for objects with multiple keys', () => {
            expect(
                ErrorUtils.isTranslationKeyError({
                    translationKey: 'passwordForm.error.fallback',
                    extraKey: 'extra',
                }),
            ).toBe(false);
        });

        test('should return false for objects without translationKey property', () => {
            expect(ErrorUtils.isTranslationKeyError({error: 'generic error'})).toBe(false);
            expect(ErrorUtils.isTranslationKeyError({message: 'error message'})).toBe(false);
        });

        test('should return true for valid TranslationKeyError objects', () => {
            expect(ErrorUtils.isTranslationKeyError({translationKey: 'passwordForm.error.fallback'})).toBe(true);
            expect(ErrorUtils.isTranslationKeyError({translationKey: 'passwordForm.error.incorrectLoginOrPassword'})).toBe(true);
            expect(ErrorUtils.isTranslationKeyError({translationKey: 'session.offlineMessageRetry'})).toBe(true);
        });

        test('should return false for null and undefined', () => {
            expect(ErrorUtils.isTranslationKeyError(null)).toBe(false);
            expect(ErrorUtils.isTranslationKeyError(undefined)).toBe(false);
        });

        test('should return false for primitive types', () => {
            expect(ErrorUtils.isTranslationKeyError(123)).toBe(false);
            expect(ErrorUtils.isTranslationKeyError(true)).toBe(false);
            expect(ErrorUtils.isTranslationKeyError(false)).toBe(false);
        });
    });

    describe('Integration: getMicroSecondTranslationErrorWithTranslationKey and isTranslationKeyError', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should create translation error objects that are correctly identified by isTranslationKeyError', () => {
            const mockMicroseconds = 1234567890123;
            (DateUtils.getMicroseconds as jest.Mock).mockReturnValue(mockMicroseconds);

            const errorObject = ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('passwordForm.error.incorrectLoginOrPassword');

            // The error object should have one key (the timestamp)
            const keys = Object.keys(errorObject);
            expect(keys).toHaveLength(1);

            // The value at that key should be a valid translation key error
            const errorValue = errorObject[keys[0]];
            expect(ErrorUtils.isTranslationKeyError(errorValue)).toBe(true);
        });

        test('should work with custom error keys', () => {
            const customErrorKey = 9876543210;
            const errorObject = ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('passwordForm.error.fallback', customErrorKey);

            // The error object should have the custom key
            expect(errorObject).toHaveProperty(customErrorKey.toString());

            // The value should be a valid translation key error
            const errorValue = errorObject[customErrorKey];
            expect(ErrorUtils.isTranslationKeyError(errorValue)).toBe(true);
        });

        test('should create objects with multiple errors that are all valid translation key errors', () => {
            const mockMicroseconds1 = 1111111111111;
            const mockMicroseconds2 = 2222222222222;

            (DateUtils.getMicroseconds as jest.Mock).mockReturnValueOnce(mockMicroseconds1).mockReturnValueOnce(mockMicroseconds2);

            const error1 = ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('passwordForm.error.incorrectLoginOrPassword');
            const error2 = ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('session.offlineMessageRetry');

            // Combine the error objects
            const combinedErrors = {...error1, ...error2};

            // All values should be valid translation key errors
            Object.values(combinedErrors).forEach((errorValue) => {
                expect(ErrorUtils.isTranslationKeyError(errorValue)).toBe(true);
            });
        });

        test('should verify the structure of created translation key errors', () => {
            const mockMicroseconds = 5555555555555;
            (DateUtils.getMicroseconds as jest.Mock).mockReturnValue(mockMicroseconds);

            const errorObject = ErrorUtils.getMicroSecondTranslationErrorWithTranslationKey('passwordForm.error.twoFactorAuthenticationEnabled');
            const errorValue = errorObject[mockMicroseconds];

            // Verify the structure matches what isTranslationKeyError expects
            expect(errorValue).toEqual({
                translationKey: 'passwordForm.error.twoFactorAuthenticationEnabled',
            });

            // Verify it passes all the checks in isTranslationKeyError
            expect(typeof errorValue).not.toBe('string');
            expect(Array.isArray(errorValue)).toBe(false);
            expect(Object.keys(errorValue)).toHaveLength(1);
            expect(errorValue.translationKey).toBeDefined();
            expect(ErrorUtils.isTranslationKeyError(errorValue)).toBe(true);
        });
    });

    describe('getErrorMessageWithTranslationData', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should return empty string for null or empty error', () => {
            expect(ErrorUtils.getErrorMessageWithTranslationData(null)).toBe('');
            expect(ErrorUtils.getErrorMessageWithTranslationData('')).toBe('');
        });

        test('should return original error when current locale is English', () => {
            (IntlStore.getCurrentLocale as jest.Mock).mockReturnValue(CONST.LOCALES.EN);
            const errorMessage = CONST.ERROR.BANK_ACCOUNT_SAME_DEPOSIT_AND_WITHDRAWAL_ERROR;

            const result = ErrorUtils.getErrorMessageWithTranslationData(errorMessage);

            expect(result).toBe(errorMessage);
        });

        test('should return translated message for specific error in non-English locale', () => {
            (IntlStore.getCurrentLocale as jest.Mock).mockReturnValue(CONST.LOCALES.ES);
            (Localize.translate as jest.Mock).mockReturnValue('Las cuentas de depósito y retiro son las mismas.');
            const errorMessage = CONST.ERROR.BANK_ACCOUNT_SAME_DEPOSIT_AND_WITHDRAWAL_ERROR;

            const result = ErrorUtils.getErrorMessageWithTranslationData(errorMessage);

            expect(result).toBe('Las cuentas de depósito y retiro son las mismas.');
            expect(Localize.translate).toHaveBeenCalledWith(CONST.LOCALES.ES, 'bankAccount.error.sameDepositAndWithdrawalAccount');
        });

        test('should return original error for non-matching error message in non-English locale', () => {
            (IntlStore.getCurrentLocale as jest.Mock).mockReturnValue(CONST.LOCALES.ES);
            const errorMessage = 'Some other error message';

            const result = ErrorUtils.getErrorMessageWithTranslationData(errorMessage);

            expect(result).toBe(errorMessage);
        });
    });
});
