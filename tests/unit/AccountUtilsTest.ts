import type {Account} from '../../src/types/onyx';

import AccountUtils from '../../src/libs/AccountUtils';

describe('AccountUtils', () => {
    describe('shouldShowRequire2FAPage', () => {
        it('should return true when the account needs 2FA setup and 2FA is not enabled', () => {
            const account: Account = {
                needsTwoFactorAuthSetup: true,
                requiresTwoFactorAuth: false,
            };

            expect(AccountUtils.shouldShowRequire2FAPage(account, false)).toBe(true);
        });

        it('should return true when setup is in progress, 2FA is not enabled, and guided setup is incomplete', () => {
            const account: Account = {
                twoFactorAuthSetupInProgress: true,
                requiresTwoFactorAuth: false,
            };

            expect(AccountUtils.shouldShowRequire2FAPage(account, false)).toBe(true);
        });

        it('should return false after 2FA completes even if setup progress is still set during handoff', () => {
            const account: Account = {
                requiresTwoFactorAuth: true,
                twoFactorAuthSetupInProgress: true,
            };

            expect(AccountUtils.shouldShowRequire2FAPage(account, false)).toBe(false);
        });
    });

    describe('isForced2FAOnboardingSetup', () => {
        it('should return true when setup is in progress and guided setup is incomplete, even before verify succeeds', () => {
            const account: Account = {
                requiresTwoFactorAuth: false,
                twoFactorAuthSetupInProgress: true,
            };

            expect(AccountUtils.isForced2FAOnboardingSetup(account, false)).toBe(true);
        });

        it('should return true after verify when setup progress remains and guided setup is incomplete', () => {
            const account: Account = {
                requiresTwoFactorAuth: true,
                twoFactorAuthSetupInProgress: true,
            };

            expect(AccountUtils.isForced2FAOnboardingSetup(account, false)).toBe(true);
        });

        it('should return false when guided setup is complete', () => {
            const account: Account = {
                twoFactorAuthSetupInProgress: true,
            };

            expect(AccountUtils.isForced2FAOnboardingSetup(account, true)).toBe(false);
        });
    });

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
