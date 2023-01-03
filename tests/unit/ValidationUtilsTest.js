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
});
