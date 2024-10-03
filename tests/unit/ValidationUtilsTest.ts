import {addDays, format, startOfDay, subYears} from 'date-fns';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import * as ValidationUtils from '@src/libs/ValidationUtils';

describe('ValidationUtils', () => {
    describe('isValidDate', () => {
        test('Should return true for a valid date within the range', () => {
            const validDate = '2023-07-18';
            const isValid = ValidationUtils.isValidDate(validDate);
            expect(isValid).toBe(true);
        });

        test('Should return false for an invalid date', () => {
            const invalidDate = '2023-07-32';
            const isValid = ValidationUtils.isValidDate(invalidDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for an empty date', () => {
            const invalidDate = '';
            const isValid = ValidationUtils.isValidDate(invalidDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for a date after the range', () => {
            const futureDate = '3042-07-18';
            const isValid = ValidationUtils.isValidDate(futureDate);
            expect(isValid).toBe(false);
        });
    });

    describe('isValidPastDate', () => {
        test('Should return true for a valid past date within the range', () => {
            const validPastDate = '1990-01-01';
            const isValid = ValidationUtils.isValidPastDate(validPastDate);
            expect(isValid).toBe(true);
        });

        test('Should return false for an invalid date', () => {
            const invalidDate = '2023-07-32';
            const isValid = ValidationUtils.isValidPastDate(invalidDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for an empty date', () => {
            const emptyDate = '';
            const isValid = ValidationUtils.isValidPastDate(emptyDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for a future date', () => {
            const futureDate = format(addDays(new Date(), 1), CONST.DATE.FNS_FORMAT_STRING);
            const isValid = ValidationUtils.isValidPastDate(futureDate);
            expect(isValid).toBe(false);
        });
    });

    describe('isRequiredFulfilled', () => {
        test('Should return true for a non-empty string value', () => {
            const stringValue = 'Test';
            const isFulfilled = ValidationUtils.isRequiredFulfilled(stringValue);
            expect(isFulfilled).toBe(true);
        });

        test('Should return false for an empty string value', () => {
            const emptyStringValue = '';
            const isFulfilled = ValidationUtils.isRequiredFulfilled(emptyStringValue);
            expect(isFulfilled).toBe(false);
        });

        test('Should return false for a whitespace string value', () => {
            const whitespaceStringValue = '   ';
            const isFulfilled = ValidationUtils.isRequiredFulfilled(whitespaceStringValue);
            expect(isFulfilled).toBe(false);
        });

        test('Should return true for a valid date value', () => {
            const dateValue = new Date();
            const isFulfilled = ValidationUtils.isRequiredFulfilled(dateValue);
            expect(isFulfilled).toBe(true);
        });

        test('Should return false for an invalid date value', () => {
            const invalidDateValue = new Date('2023-07-33');
            const isFulfilled = ValidationUtils.isRequiredFulfilled(invalidDateValue);
            expect(isFulfilled).toBe(false);
        });

        test('Should return true for a non-empty array value', () => {
            const arrayValue = [1, 2, 3];
            const isFulfilled = ValidationUtils.isRequiredFulfilled(arrayValue);
            expect(isFulfilled).toBe(true);
        });

        test('Should return false for an empty array value', () => {
            const emptyArrayValue: string[] = [];
            const isFulfilled = ValidationUtils.isRequiredFulfilled(emptyArrayValue);
            expect(isFulfilled).toBe(false);
        });

        test('Should return true for a non-empty object value', () => {
            const objectValue = {key: 'value'};
            const isFulfilled = ValidationUtils.isRequiredFulfilled(objectValue);
            expect(isFulfilled).toBe(true);
        });

        test('Should return false for an empty object value', () => {
            const emptyObjectValue = {};
            const isFulfilled = ValidationUtils.isRequiredFulfilled(emptyObjectValue);
            expect(isFulfilled).toBe(false);
        });
    });

    describe('isValidExpirationDate', () => {
        test('Should return true for a valid formats expiration date in the future', () => {
            const firstFutureExpirationDate = '12/25'; // MM/YY format, in the future
            const secondFutureExpirationDate = '12/2025'; // MM/YYYY format, in the future
            const thirdFutureExpirationDate = '1225'; // MMYY format, in the future
            const fourthFutureExpirationDate = '122025'; // MMYYYY format, in the future
            expect(ValidationUtils.isValidExpirationDate(firstFutureExpirationDate)).toBe(true);
            expect(ValidationUtils.isValidExpirationDate(secondFutureExpirationDate)).toBe(true);
            expect(ValidationUtils.isValidExpirationDate(thirdFutureExpirationDate)).toBe(true);
            expect(ValidationUtils.isValidExpirationDate(fourthFutureExpirationDate)).toBe(true);
        });

        test('Should return false for a valid expiration date, but in the past', () => {
            const pastExpirationDate = '06/20'; // MM/YY format, in the past
            const isValid = ValidationUtils.isValidExpirationDate(pastExpirationDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for an invalid expiration date format', () => {
            const invalidExpirationDate = '2006'; // Invalid format, missing YYMM
            const isValid = ValidationUtils.isValidExpirationDate(invalidExpirationDate);
            expect(isValid).toBe(false);
        });
    });

    describe('meetsMinimumAgeRequirement', () => {
        test('Should return true for a date that meets the minimum age requirement', () => {
            const validDate = format(subYears(new Date(), 18), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 18 years ago
            const meetsRequirement = ValidationUtils.meetsMinimumAgeRequirement(validDate);
            expect(meetsRequirement).toBe(true);
        });

        test('Should return false for a date that does not meet the minimum age requirement', () => {
            const invalidDate = format(subYears(new Date(), 17), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 17 years ago
            const meetsRequirement = ValidationUtils.meetsMinimumAgeRequirement(invalidDate);
            expect(meetsRequirement).toBe(false);
        });

        test('Should return false for an invalid date', () => {
            const invalidDate = '2023-07-32'; // Invalid date
            const meetsRequirement = ValidationUtils.meetsMinimumAgeRequirement(invalidDate);
            expect(meetsRequirement).toBe(false);
        });
    });

    describe('meetsMaximumAgeRequirement', () => {
        test('Should return true for a date that meets the maximum age requirement', () => {
            const validDate = format(subYears(new Date(), 65), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 65 years ago
            const meetsRequirement = ValidationUtils.meetsMaximumAgeRequirement(validDate);
            expect(meetsRequirement).toBe(true);
        });

        test('Should return false for a date that does not meet the maximum age requirement', () => {
            const invalidDate = format(subYears(new Date(), 151), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 151 years ago
            const meetsRequirement = ValidationUtils.meetsMaximumAgeRequirement(invalidDate);
            expect(meetsRequirement).toBe(false);
        });

        test('Should return false for an invalid date', () => {
            const invalidDate = '2023-07-32'; // Invalid date
            const meetsRequirement = ValidationUtils.meetsMaximumAgeRequirement(invalidDate);
            expect(meetsRequirement).toBe(false);
        });
    });

    describe('getAgeRequirementError', () => {
        test('Should return an empty string for a date within the specified range', () => {
            const validDate: string = format(subYears(new Date(), 30), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 30 years ago
            const error = ValidationUtils.getAgeRequirementError(validDate, 18, 150);
            expect(error).toBe('');
        });

        test('Should return an error message for a date before the minimum age requirement', () => {
            const invalidDate: string = format(subYears(new Date(), 17), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 17 years ago
            const error = ValidationUtils.getAgeRequirementError(invalidDate, 18, 150);
            expect(error).toEqual(
                Localize.translateLocal('privatePersonalDetails.error.dateShouldBeBefore', {dateString: format(startOfDay(subYears(new Date(), 18)), CONST.DATE.FNS_FORMAT_STRING)}),
            );
        });

        test('Should return an error message for a date after the maximum age requirement', () => {
            const invalidDate: string = format(subYears(new Date(), 160), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 160 years ago
            const error = ValidationUtils.getAgeRequirementError(invalidDate, 18, 150);
            expect(error).toEqual(
                Localize.translateLocal('privatePersonalDetails.error.dateShouldBeAfter', {dateString: format(startOfDay(subYears(new Date(), 150)), CONST.DATE.FNS_FORMAT_STRING)}),
            );
        });

        test('Should return an error message for an invalid date', () => {
            const invalidDate = '2023-07-32'; // Invalid date
            const error = ValidationUtils.getAgeRequirementError(invalidDate, 18, 150);
            expect(error).toBe(Localize.translateLocal('common.error.dateInvalid'));
        });
    });

    describe('isValidTwoFactorCode', () => {
        test('numeric two-factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('123456')).toBe(true);
        });

        test('numeric two-factor code with leading zeroes', () => {
            expect(ValidationUtils.isValidTwoFactorCode('000001')).toBe(true);
        });

        test('alphanumeric two-factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('abc123')).toBe(false);
        });

        test('special characters two-factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('!@#$%^')).toBe(false);
        });

        test('partial special characters two-factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('123$%^')).toBe(false);
        });
    });

    describe('isValidRoomName', () => {
        test('room name without #', () => {
            expect(ValidationUtils.isValidRoomName('test')).toBe(false);
        });

        test('room name with upper case letters', () => {
            expect(ValidationUtils.isValidRoomName('#Test')).toBe(false);
        });

        test('room name with special character other than dash', () => {
            expect(ValidationUtils.isValidRoomName('#test_room')).toBe(false);
        });

        test('room name with less than one character', () => {
            expect(ValidationUtils.isValidRoomName('#')).toBe(false);
        });

        test('room name with 101 characters', () => {
            expect(ValidationUtils.isValidRoomName('#12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901')).toBe(false);
        });

        test('room name with lowercase letters, numbers, and dashes', () => {
            expect(ValidationUtils.isValidRoomName('#this-is-a-room1')).toBe(true);
        });

        test('room name with spanish Accented letters and dashes', () => {
            expect(ValidationUtils.isValidRoomName('#sala-de-opinión')).toBe(true);
        });

        test('room name with division sign (÷)', () => {
            expect(ValidationUtils.isValidRoomName('#room-name-with-÷-sign')).toBe(false);
        });

        test('room name with Greek alphabets and Cyrillic alphabets', () => {
            expect(ValidationUtils.isValidRoomName('#σοβαρός-серьезный')).toBe(true);
        });
    });

    describe('isValidWebsite', () => {
        test('Valid URLs with https protocol', () => {
            expect(ValidationUtils.isValidWebsite('https://www.expensify.com')).toBe(true);
            expect(ValidationUtils.isValidWebsite('https://expensify.com/inbox/')).toBe(true);
            expect(ValidationUtils.isValidWebsite('https://we.are.expensify.com/how-we-got-here')).toBe(true);
            expect(ValidationUtils.isValidWebsite('https://blog.google')).toBe(true);
            expect(ValidationUtils.isValidWebsite('https://blog.google:65535')).toBe(true);
        });

        test('Valid URLs with http protocol', () => {
            expect(ValidationUtils.isValidWebsite('http://www.expensify.com')).toBe(true);
            expect(ValidationUtils.isValidWebsite('http://use.expensify.com')).toBe(true);
        });

        test('Valid URL with ftp protocol', () => {
            expect(ValidationUtils.isValidWebsite('ftp://expensify.com/files')).toBe(true);
        });

        test('Invalid URLs', () => {
            expect(ValidationUtils.isValidWebsite('expensify')).toBe(false);
            expect(ValidationUtils.isValidWebsite('expensify.')).toBe(false);
            expect(ValidationUtils.isValidWebsite('192.168.0.1')).toBe(false);
            expect(ValidationUtils.isValidWebsite('www.googlecom')).toBe(false);
            expect(ValidationUtils.isValidWebsite('www.google.com:65536')).toBe(false);
        });

        test('Invalid URLs without protocols', () => {
            expect(ValidationUtils.isValidWebsite('www.expensify.com')).toBe(false);
            expect(ValidationUtils.isValidWebsite('expensify.com')).toBe(false);
        });

        test('Invalid URLs with special characters and emojis', () => {
            expect(ValidationUtils.isValidWebsite('www.~expensify.com')).toBe(false);
            expect(ValidationUtils.isValidWebsite('https://www.expen$ify.com')).toBe(false);
            expect(ValidationUtils.isValidWebsite('www.expensify😄.com')).toBe(false);
        });
    });

    describe('ValidateAccountRoute', () => {
        test('Valid account route', () => {
            expect(ValidationUtils.isValidAccountRoute(123123)).toBe(true);
            expect(ValidationUtils.isValidAccountRoute(5612)).toBe(true);
        });
    });

    describe('ValidatePersonName', () => {
        test('Valid person name', () => {
            expect(ValidationUtils.isValidPersonName('test name')).toBe(true);
            expect(ValidationUtils.isValidPersonName('X Æ A test')).toBe(true);
            expect(ValidationUtils.isValidPersonName('a hyphenated-name')).toBe(true);
        });

        test('Invalid person name', () => {
            expect(ValidationUtils.isValidPersonName('123 test')).toBe(false);
            expect(ValidationUtils.isValidPersonName('test #$')).toBe(false);
            expect(ValidationUtils.isValidPersonName('test123$')).toBe(false);
        });
    });

    describe('ValidateLegalName', () => {
        test('Valid legal name', () => {
            expect(ValidationUtils.isValidLegalName('test name')).toBe(true);
            expect(ValidationUtils.isValidLegalName('X Æ A test')).toBe(true);
        });

        test('Invalid legal name', () => {
            expect(ValidationUtils.isValidLegalName('a hyphenated-name')).toBe(false);
            expect(ValidationUtils.isValidLegalName('άλφα')).toBe(false);
        });
    });
});
