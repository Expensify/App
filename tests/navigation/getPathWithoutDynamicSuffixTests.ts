import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';

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

    it('should strip suffix-specific query params derived from DYNAMIC_ROUTES.getRoute', () => {
        const result = getPathWithoutDynamicSuffix('/settings/profile/address/country?country=US', 'country');

        expect(result).toBe('/settings/profile/address');
    });

    it('should strip only suffix-specific params and preserve base path params', () => {
        const result = getPathWithoutDynamicSuffix('/settings/profile/address/country?baseParam=1&country=US', 'country');

        expect(result).toBe('/settings/profile/address?baseParam=1');
    });

    it('should strip parametric suffix by actual value length', () => {
        const result = getPathWithoutDynamicSuffix('/r/123/flag/456/abc', 'flag/456/abc');

        expect(result).toBe('/r/123');
    });

    it('should strip single-param suffix', () => {
        const result = getPathWithoutDynamicSuffix('/r/123/members/member-details/456', 'member-details/456');

        expect(result).toBe('/r/123/members');
    });

    it('should strip parametric suffix and preserve query params', () => {
        const result = getPathWithoutDynamicSuffix('/r/123/flag/456/abc?tab=details', 'flag/456/abc');

        expect(result).toBe('/r/123?tab=details');
    });

    it('should return empty when parametric suffix covers entire path', () => {
        const result = getPathWithoutDynamicSuffix('/flag/123/abc', 'flag/123/abc');

        expect(result).toBe('');
    });
});
