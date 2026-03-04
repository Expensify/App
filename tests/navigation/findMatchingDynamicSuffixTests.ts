import findMatchingDynamicSuffix from '@libs/Navigation/helpers/findMatchingDynamicSuffix';

describe('findMatchingDynamicSuffix', () => {
    it('should match a single-segment dynamic suffix', () => {
        expect(findMatchingDynamicSuffix('settings/wallet/verify-account')).toBe('verify-account');
    });

    it('should match when the path has a leading slash', () => {
        expect(findMatchingDynamicSuffix('/settings/wallet/verify-account')).toBe('verify-account');
    });

    it('should return undefined for a path with no matching suffix', () => {
        expect(findMatchingDynamicSuffix('/settings/wallet/unknown-page')).toBeUndefined();
    });

    it('should return undefined for an empty path', () => {
        expect(findMatchingDynamicSuffix('')).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
        expect(findMatchingDynamicSuffix(undefined)).toBeUndefined();
    });

    it('should ignore query parameters when matching', () => {
        expect(findMatchingDynamicSuffix('settings/wallet/verify-account?sortBy=date')).toBe('verify-account');
    });

    it('should handle trailing slashes', () => {
        expect(findMatchingDynamicSuffix('settings/wallet/verify-account/')).toBe('verify-account');
    });

    it('should not match a suffix that appears in the middle of the path', () => {
        expect(findMatchingDynamicSuffix('/verify-account/settings/wallet')).toBeUndefined();
    });

    it('should match a suffix when path has suffix-specific query params', () => {
        expect(findMatchingDynamicSuffix('settings/profile/address/country?country=US')).toBe('country');
    });
});
