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
});
