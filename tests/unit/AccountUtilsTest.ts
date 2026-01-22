import AccountUtils from '../../src/libs/AccountUtils';
import type {Account} from '../../src/types/onyx';

describe('AccountUtils', () => {
    describe('hasValidateCodeExtendedAccess', () => {
        it('should return true when timestamp is valid and not expired', () => {
            // Create a timestamp 1 hour in the future (in microseconds)
            const futureTimestamp = (Date.now() + 60 * 60 * 1000) * 1000;
            const account: Account = {
                validateCodeExtendedAccessExpires: futureTimestamp,
            };

            expect(AccountUtils.hasValidateCodeExtendedAccess(account)).toBe(true);
        });

        it('should return false when timestamp is expired', () => {
            // Create a timestamp 1 hour in the past (in microseconds)
            const pastTimestamp = (Date.now() - 60 * 60 * 1000) * 1000;
            const account: Account = {
                validateCodeExtendedAccessExpires: pastTimestamp,
            };

            expect(AccountUtils.hasValidateCodeExtendedAccess(account)).toBe(false);
        });

        it('should return false when account is undefined', () => {
            expect(AccountUtils.hasValidateCodeExtendedAccess(undefined)).toBe(false);
        });

        it('should return false when validateCodeExtendedAccessExpires is not set', () => {
            const account: Account = {};

            expect(AccountUtils.hasValidateCodeExtendedAccess(account)).toBe(false);
        });
    });
});
