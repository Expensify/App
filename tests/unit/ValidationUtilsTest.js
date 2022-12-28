const ValidationUtils = require('../../src/libs/ValidationUtils');

describe('ValidationUtils', () => {
    describe('isValidTwoFactorCode', () => {
        test('numeric two factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('123456')).toBe(true);
        });

        test('alphanumeric two factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('abc123')).toBe(true);
        });

        test('special characters two factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('!@#$%^')).toBe(false);
        });

        test('partial special characters two factor code', () => {
            expect(ValidationUtils.isValidTwoFactorCode('abc!@#')).toBe(false);
        });
    });
});
