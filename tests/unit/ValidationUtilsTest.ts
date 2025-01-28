import {addDays, format, startOfDay, subYears} from 'date-fns';
import {translateLocal} from '@libs/Localize';
import CONST from '@src/CONST';
import {
    getAgeRequirementError,
    isRequiredFulfilled,
    isValidAccountRoute,
    isValidDate,
    isValidExpirationDate,
    isValidLegalName,
    isValidPastDate,
    isValidPaymentZipCode,
    isValidPersonName,
    isValidRoomName,
    isValidTwoFactorCode,
    isValidWebsite,
    meetsMaximumAgeRequirement,
    meetsMinimumAgeRequirement,
} from '@src/libs/ValidationUtils';

jest.mock('@libs/fileDownload/FileUtils', () => ({
    readFileAsync: jest.fn(),
}));

describe('ValidationUtils', () => {
    describe('isValidDate', () => {
        test('Should return true for a valid date within the range', () => {
            const validDate = '2023-07-18';
            const isValid = isValidDate(validDate);
            expect(isValid).toBe(true);
        });

        test('Should return false for an invalid date', () => {
            const invalidDate = '2023-07-32';
            const isValid = isValidDate(invalidDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for an empty date', () => {
            const invalidDate = '';
            const isValid = isValidDate(invalidDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for a date after the range', () => {
            const futureDate = '3042-07-18';
            const isValid = isValidDate(futureDate);
            expect(isValid).toBe(false);
        });
    });

    describe('isValidPastDate', () => {
        test('Should return true for a valid past date within the range', () => {
            const validPastDate = '1990-01-01';
            const isValid = isValidPastDate(validPastDate);
            expect(isValid).toBe(true);
        });

        test('Should return false for an invalid date', () => {
            const invalidDate = '2023-07-32';
            const isValid = isValidPastDate(invalidDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for an empty date', () => {
            const emptyDate = '';
            const isValid = isValidPastDate(emptyDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for a future date', () => {
            const futureDate = format(addDays(new Date(), 1), CONST.DATE.FNS_FORMAT_STRING);
            const isValid = isValidPastDate(futureDate);
            expect(isValid).toBe(false);
        });
    });

    describe('isRequiredFulfilled', () => {
        test('Should return true for a non-empty string value', () => {
            const stringValue = 'Test';
            const isFulfilled = isRequiredFulfilled(stringValue);
            expect(isFulfilled).toBe(true);
        });

        test('Should return false for an empty string value', () => {
            const emptyStringValue = '';
            const isFulfilled = isRequiredFulfilled(emptyStringValue);
            expect(isFulfilled).toBe(false);
        });

        test('Should return false for a whitespace string value', () => {
            const whitespaceStringValue = '   ';
            const isFulfilled = isRequiredFulfilled(whitespaceStringValue);
            expect(isFulfilled).toBe(false);
        });

        test('Should return true for a valid date value', () => {
            const dateValue = new Date();
            const isFulfilled = isRequiredFulfilled(dateValue);
            expect(isFulfilled).toBe(true);
        });

        test('Should return false for an invalid date value', () => {
            const invalidDateValue = new Date('2023-07-33');
            const isFulfilled = isRequiredFulfilled(invalidDateValue);
            expect(isFulfilled).toBe(false);
        });

        test('Should return true for a non-empty array value', () => {
            const arrayValue = [1, 2, 3];
            const isFulfilled = isRequiredFulfilled(arrayValue);
            expect(isFulfilled).toBe(true);
        });

        test('Should return false for an empty array value', () => {
            const emptyArrayValue: string[] = [];
            const isFulfilled = isRequiredFulfilled(emptyArrayValue);
            expect(isFulfilled).toBe(false);
        });

        test('Should return true for a non-empty object value', () => {
            const objectValue = {key: 'value'};
            const isFulfilled = isRequiredFulfilled(objectValue);
            expect(isFulfilled).toBe(true);
        });

        test('Should return false for an empty object value', () => {
            const emptyObjectValue = {};
            const isFulfilled = isRequiredFulfilled(emptyObjectValue);
            expect(isFulfilled).toBe(false);
        });
    });

    describe('isValidExpirationDate', () => {
        test('Should return true for a valid formats expiration date in the future', () => {
            const firstFutureExpirationDate = '12/25'; // MM/YY format, in the future
            const secondFutureExpirationDate = '12/2025'; // MM/YYYY format, in the future
            const thirdFutureExpirationDate = '1225'; // MMYY format, in the future
            const fourthFutureExpirationDate = '122025'; // MMYYYY format, in the future
            expect(isValidExpirationDate(firstFutureExpirationDate)).toBe(true);
            expect(isValidExpirationDate(secondFutureExpirationDate)).toBe(true);
            expect(isValidExpirationDate(thirdFutureExpirationDate)).toBe(true);
            expect(isValidExpirationDate(fourthFutureExpirationDate)).toBe(true);
        });

        test('Should return false for a valid expiration date, but in the past', () => {
            const pastExpirationDate = '06/20'; // MM/YY format, in the past
            const isValid = isValidExpirationDate(pastExpirationDate);
            expect(isValid).toBe(false);
        });

        test('Should return false for an invalid expiration date format', () => {
            const invalidExpirationDate = '2006'; // Invalid format, missing YYMM
            const isValid = isValidExpirationDate(invalidExpirationDate);
            expect(isValid).toBe(false);
        });
    });

    describe('meetsMinimumAgeRequirement', () => {
        test('Should return true for a date that meets the minimum age requirement', () => {
            const validDate = format(subYears(new Date(), 18), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 18 years ago
            const meetsRequirement = meetsMinimumAgeRequirement(validDate);
            expect(meetsRequirement).toBe(true);
        });

        test('Should return false for a date that does not meet the minimum age requirement', () => {
            const invalidDate = format(subYears(new Date(), 17), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 17 years ago
            const meetsRequirement = meetsMinimumAgeRequirement(invalidDate);
            expect(meetsRequirement).toBe(false);
        });

        test('Should return false for an invalid date', () => {
            const invalidDate = '2023-07-32'; // Invalid date
            const meetsRequirement = meetsMinimumAgeRequirement(invalidDate);
            expect(meetsRequirement).toBe(false);
        });
    });

    describe('meetsMaximumAgeRequirement', () => {
        test('Should return true for a date that meets the maximum age requirement', () => {
            const validDate = format(subYears(new Date(), 65), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 65 years ago
            const meetsRequirement = meetsMaximumAgeRequirement(validDate);
            expect(meetsRequirement).toBe(true);
        });

        test('Should return false for a date that does not meet the maximum age requirement', () => {
            const invalidDate = format(subYears(new Date(), 151), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 151 years ago
            const meetsRequirement = meetsMaximumAgeRequirement(invalidDate);
            expect(meetsRequirement).toBe(false);
        });

        test('Should return false for an invalid date', () => {
            const invalidDate = '2023-07-32'; // Invalid date
            const meetsRequirement = meetsMaximumAgeRequirement(invalidDate);
            expect(meetsRequirement).toBe(false);
        });
    });

    describe('getAgeRequirementError', () => {
        test('Should return an empty string for a date within the specified range', () => {
            const validDate: string = format(subYears(new Date(), 30), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 30 years ago
            const error = getAgeRequirementError(validDate, 18, 150);
            expect(error).toBe('');
        });

        test('Should return an error message for a date before the minimum age requirement', () => {
            const invalidDate: string = format(subYears(new Date(), 17), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 17 years ago
            const error = getAgeRequirementError(invalidDate, 18, 150);
            expect(error).toEqual(
                translateLocal('privatePersonalDetails.error.dateShouldBeBefore', {dateString: format(startOfDay(subYears(new Date(), 18)), CONST.DATE.FNS_FORMAT_STRING)}),
            );
        });

        test('Should return an error message for a date after the maximum age requirement', () => {
            const invalidDate: string = format(subYears(new Date(), 160), CONST.DATE.FNS_FORMAT_STRING); // Date of birth 160 years ago
            const error = getAgeRequirementError(invalidDate, 18, 150);
            expect(error).toEqual(
                translateLocal('privatePersonalDetails.error.dateShouldBeAfter', {dateString: format(startOfDay(subYears(new Date(), 150)), CONST.DATE.FNS_FORMAT_STRING)}),
            );
        });

        test('Should return an error message for an invalid date', () => {
            const invalidDate = '2023-07-32'; // Invalid date
            const error = getAgeRequirementError(invalidDate, 18, 150);
            expect(error).toBe(translateLocal('common.error.dateInvalid'));
        });
    });

    describe('isValidTwoFactorCode', () => {
        test('numeric two-factor code', () => {
            expect(isValidTwoFactorCode('123456')).toBe(true);
        });

        test('numeric two-factor code with leading zeroes', () => {
            expect(isValidTwoFactorCode('000001')).toBe(true);
        });

        test('alphanumeric two-factor code', () => {
            expect(isValidTwoFactorCode('abc123')).toBe(false);
        });

        test('special characters two-factor code', () => {
            expect(isValidTwoFactorCode('!@#$%^')).toBe(false);
        });

        test('partial special characters two-factor code', () => {
            expect(isValidTwoFactorCode('123$%^')).toBe(false);
        });
    });

    describe('isValidRoomName', () => {
        test('room name without #', () => {
            expect(isValidRoomName('test')).toBe(false);
        });

        test('room name with upper case letters', () => {
            expect(isValidRoomName('#Test')).toBe(false);
        });

        test('room name with special character other than dash', () => {
            expect(isValidRoomName('#test_room')).toBe(false);
        });

        test('room name with less than one character', () => {
            expect(isValidRoomName('#')).toBe(false);
        });

        test('room name with 101 characters', () => {
            expect(isValidRoomName('#12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901')).toBe(false);
        });

        test('room name with lowercase letters, numbers, and dashes', () => {
            expect(isValidRoomName('#this-is-a-room1')).toBe(true);
        });

        test('room name with spanish Accented letters and dashes', () => {
            expect(isValidRoomName('#sala-de-opinión')).toBe(true);
        });

        test('room name with division sign (÷)', () => {
            expect(isValidRoomName('#room-name-with-÷-sign')).toBe(false);
        });

        test('room name with Greek alphabets and Cyrillic alphabets', () => {
            expect(isValidRoomName('#σοβαρός-серьезный')).toBe(true);
        });
    });

    describe('isValidWebsite', () => {
        test('Valid URLs with https protocol', () => {
            expect(isValidWebsite('https://www.expensify.com')).toBe(true);
            expect(isValidWebsite('https://expensify.com/inbox/')).toBe(true);
            expect(isValidWebsite('https://we.are.expensify.com/how-we-got-here')).toBe(true);
            expect(isValidWebsite('https://blog.google')).toBe(true);
            expect(isValidWebsite('https://blog.google:65535')).toBe(true);
        });

        test('Valid URLs with http protocol', () => {
            expect(isValidWebsite('http://www.expensify.com')).toBe(true);
            expect(isValidWebsite('http://use.expensify.com')).toBe(true);
        });

        test('Valid URL with ftp protocol', () => {
            expect(isValidWebsite('ftp://expensify.com/files')).toBe(true);
        });

        test('Invalid URLs', () => {
            expect(isValidWebsite('expensify')).toBe(false);
            expect(isValidWebsite('expensify.')).toBe(false);
            expect(isValidWebsite('192.168.0.1')).toBe(false);
            expect(isValidWebsite('www.googlecom')).toBe(false);
            expect(isValidWebsite('www.google.com:65536')).toBe(false);
        });

        test('Invalid URLs without protocols', () => {
            expect(isValidWebsite('www.expensify.com')).toBe(false);
            expect(isValidWebsite('expensify.com')).toBe(false);
        });

        test('Invalid URLs with special characters and emojis', () => {
            expect(isValidWebsite('www.~expensify.com')).toBe(false);
            expect(isValidWebsite('https://www.expen$ify.com')).toBe(false);
            expect(isValidWebsite('www.expensify😄.com')).toBe(false);
        });
    });

    describe('ValidateAccountRoute', () => {
        test('Valid account route', () => {
            expect(isValidAccountRoute(123123)).toBe(true);
            expect(isValidAccountRoute(5612)).toBe(true);
        });
    });

    describe('ValidatePersonName', () => {
        test('Valid person name', () => {
            expect(isValidPersonName('test name')).toBe(true);
            expect(isValidPersonName(`X Æ A test`)).toBe(true);
            expect(isValidPersonName(`a hyphenated-name`)).toBe(true);
        });

        test('Invalid person name', () => {
            expect(isValidPersonName('123 test')).toBe(false);
            expect(isValidPersonName('test #$')).toBe(false);
            expect(isValidPersonName('test123$')).toBe(false);
        });
    });

    describe('ValidateLegalName', () => {
        test('Valid legal name', () => {
            expect(isValidLegalName('test name')).toBe(true);
            expect(isValidLegalName(`X Æ A test`)).toBe(true);
        });

        test('Invalid legal name', () => {
            expect(isValidLegalName(`a hyphenated-name`)).toBe(false);
            expect(isValidLegalName('άλφα')).toBe(false);
        });
    });

    describe('isValidPaymentZipCode', () => {
        test('Is valid US zip code format (v1)', () => {
            const validZip = '12345';
            const isValid = isValidPaymentZipCode(validZip);
            expect(isValid).toBe(true);
        });

        test('Is valid US zip code format with hyphen (v2)', () => {
            const validZip = '12345-6789';
            const isValid = isValidPaymentZipCode(validZip);
            expect(isValid).toBe(true);
        });

        test('Is valid UK zip code format with space (v1)', () => {
            const invalidDate = 'AB1 2CD';
            const isValid = isValidPaymentZipCode(invalidDate);
            expect(isValid).toBe(true);
        });

        test('Is valid UK zip code format with space (v2)', () => {
            const invalidDate = 'AB12 3CD';
            const isValid = isValidPaymentZipCode(invalidDate);
            expect(isValid).toBe(true);
        });

        test('Is valid UK zip code format (v3)', () => {
            const invalidDate = 'AB12CD';
            const isValid = isValidPaymentZipCode(invalidDate);
            expect(isValid).toBe(true);
        });

        test('Is valid AU / NZ zip code format', () => {
            const invalidDate = '1234';
            const isValid = isValidPaymentZipCode(invalidDate);
            expect(isValid).toBe(true);
        });

        test('Is invalid zip code (other special characters)', () => {
            const futureDate = "@ , : ; ' &";
            const isValid = isValidPaymentZipCode(futureDate);
            expect(isValid).toBe(false);
        });
    });
});
