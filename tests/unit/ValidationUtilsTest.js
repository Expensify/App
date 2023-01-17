const ValidationUtils = require('../../src/libs/ValidationUtils');

describe('ValidationUtils', () => {
    describe('isValidTwoFactorCode', () => {
        test('numeric two factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('123456')).toBe(true);
        });

        test('numeric two factor code with leading zeroes', () => {
            expect(ValidationUtils.isValidTwoFactorCode('000001')).toBe(true);
        });

        test('alphanumeric two factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('abc123')).toBe(false);
        });

        test('special characters two factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('!@#$%^')).toBe(false);
        });

        test('partial special characters two factor code', () => {
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

        test('room name with 81 characters', () => {
            expect(ValidationUtils.isValidRoomName('#123456789012345678901234567890123456789012345678901234567890123456789012345678901')).toBe(false);
        });

        test('room name with lowercase letters, numbers, and dashes', () => {
            expect(ValidationUtils.isValidRoomName('#this-is-a-room1')).toBe(true);
        });
    });

    describe('isValidWebsite', () => {
        test('Valid URLs with https protocol', () => {
            expect(ValidationUtils.isValidWebsite('https://www.expensify.com')).toBe(true);
            expect(ValidationUtils.isValidWebsite('https://expensify.com/inbox/')).toBe(true);
            expect(ValidationUtils.isValidWebsite('https://we.are.expensify.com/how-we-got-here')).toBe(true);
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
        });

        test('Invalid URLs without protocols', () => {
            expect(ValidationUtils.isValidWebsite('www.expensify.com')).toBe(false);
            expect(ValidationUtils.isValidWebsite('expensify.com')).toBe(false);
        });

        test('Invalid URLs with special characters and emojis', () => {
            expect(ValidationUtils.isValidWebsite('www.~expensify.com')).toBe(false);
            expect(ValidationUtils.isValidWebsite('www.expen$ify.com')).toBe(false);
            expect(ValidationUtils.isValidWebsite('www.expensify😄.com')).toBe(false);
        });
    });
});
