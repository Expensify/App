import type {Account} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {accountGuideDetailsSelector, canDowngradeSelector, primaryLoginSelector, requiresTwoFactorAuthSelector} from '@selectors/Account';

describe('primaryLoginSelector', () => {
    it('returns primaryLogin when present', () => {
        const account: OnyxEntry<Account> = {primaryLogin: 'user@expensify.com'};
        expect(primaryLoginSelector(account)).toBe('user@expensify.com');
    });

    it('returns undefined when primaryLogin is not set', () => {
        const account: OnyxEntry<Account> = {};
        expect(primaryLoginSelector(account)).toBeUndefined();
    });

    it('returns undefined when account is undefined', () => {
        expect(primaryLoginSelector(undefined)).toBeUndefined();
    });
});

describe('accountGuideDetailsSelector', () => {
    it('returns guideDetails when present', () => {
        const guideDetails = {email: 'guide@expensify.com', calendarLink: 'https://calendly.com/guide'};
        const account: OnyxEntry<Account> = {guideDetails};
        expect(accountGuideDetailsSelector(account)).toEqual(guideDetails);
    });

    it('returns undefined when guideDetails is not set', () => {
        const account: OnyxEntry<Account> = {};
        expect(accountGuideDetailsSelector(account)).toBeUndefined();
    });

    it('returns undefined when account is undefined', () => {
        expect(accountGuideDetailsSelector(undefined)).toBeUndefined();
    });
});

describe('requiresTwoFactorAuthSelector', () => {
    it('returns true when requiresTwoFactorAuth is true', () => {
        const account: OnyxEntry<Account> = {requiresTwoFactorAuth: true};
        expect(requiresTwoFactorAuthSelector(account)).toBe(true);
    });

    it('returns false when requiresTwoFactorAuth is false', () => {
        const account: OnyxEntry<Account> = {requiresTwoFactorAuth: false};
        expect(requiresTwoFactorAuthSelector(account)).toBe(false);
    });

    it('returns undefined when requiresTwoFactorAuth is not set', () => {
        const account: OnyxEntry<Account> = {};
        expect(requiresTwoFactorAuthSelector(account)).toBeUndefined();
    });

    it('returns undefined when account is undefined', () => {
        expect(requiresTwoFactorAuthSelector(undefined)).toBeUndefined();
    });

    it('returns undefined when account has unrelated fields only', () => {
        const account: OnyxEntry<Account> = {primaryLogin: 'test@test.com'};
        expect(requiresTwoFactorAuthSelector(account)).toBeUndefined();
    });
});

describe('canDowngradeSelector', () => {
    it('returns true when canDowngrade is true', () => {
        const account: OnyxEntry<Account> = {canDowngrade: true};
        expect(canDowngradeSelector(account)).toBe(true);
    });

    it('returns false when canDowngrade is false', () => {
        const account: OnyxEntry<Account> = {canDowngrade: false};
        expect(canDowngradeSelector(account)).toBe(false);
    });

    it('returns false when canDowngrade is not set', () => {
        const account: OnyxEntry<Account> = {};
        expect(canDowngradeSelector(account)).toBe(false);
    });

    it('returns false when account is undefined', () => {
        expect(canDowngradeSelector(undefined)).toBe(false);
    });
});
