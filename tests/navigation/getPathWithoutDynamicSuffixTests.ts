import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/getPathWithoutDynamicSuffix';

describe('getPathWithoutDynamicSuffix', () => {
    it('should remove a single-segment suffix from a simple path', () => {
        const result = getPathWithoutDynamicSuffix('/settings/wallet/verify-account', 'verify-account');

        expect(result).toBe('/settings/wallet');
    });

    it('should preserve query params after removing the suffix', () => {
        const result = getPathWithoutDynamicSuffix('/settings/wallet/verify-account?param=value&other=1', 'verify-account');

        expect(result).toBe('/settings/wallet?param=value&other=1');
    });

    it('should remove a multi-segment suffix', () => {
        const result = getPathWithoutDynamicSuffix('/settings/profile/address/country', 'address/country');

        expect(result).toBe('/settings/profile');
    });

    it('should return root path when suffix covers the entire path', () => {
        const result = getPathWithoutDynamicSuffix('/verify-account', 'verify-account');

        expect(result).toBe('');
    });

    it('should handle path without query params and not append question mark', () => {
        const result = getPathWithoutDynamicSuffix('/reports/details', 'details');

        expect(result).toBe('/reports');
    });

    it('should handle path with trailing slash before stripping suffix', () => {
        const result = getPathWithoutDynamicSuffix('/settings/wallet/verify-account/', 'verify-account');

        expect(result).toBe('/settings/wallet');
    });
});
