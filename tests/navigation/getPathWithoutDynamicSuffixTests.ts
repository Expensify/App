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

    describe('stacked dynamic suffixes', () => {
        it("should keep the query params the base path's own dynamic suffix declares", () => {
            // `expense-report` and `expense-tag` both declare action/iouType/transactionID/reportID, so stripping
            // `expense-tag`'s params wholesale would leave the `expense-report` base without the params it needs.
            const result = getPathWithoutDynamicSuffix('/search/view/123/expense-report/expense-tag?action=edit&iouType=submit&transactionID=1&reportID=2&orderWeight=0', 'expense-tag');

            expect(result).toBe('/search/view/123/expense-report?action=edit&iouType=submit&transactionID=1&reportID=2');
        });

        it('should still strip the params only the suffix declares', () => {
            // `orderWeight` belongs to `expense-tag` alone, so it must not survive on the `expense-report` base.
            const result = getPathWithoutDynamicSuffix(
                '/search/view/123/expense-report/expense-tag?action=edit&iouType=submit&transactionID=1&reportID=2&orderWeight=0&reportActionID=9',
                'expense-tag',
            );

            expect(result).toBe('/search/view/123/expense-report?action=edit&iouType=submit&transactionID=1&reportID=2&reportActionID=9');
        });

        it('should strip every suffix param when the base path is not itself a dynamic route', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/expense-tag?action=edit&iouType=submit&transactionID=1&reportID=2&orderWeight=0', 'expense-tag');

            expect(result).toBe('/r/123');
        });

        it('should keep params owned by any suffix the base path could match, not just the first one', () => {
            // `/r/123/merge/1/details` matches several registered suffixes: `details` (owns `reportID`) comes first,
            // but `merge/:transactionID/details` is the one that owns `isOnSearch`. We can't tell which candidate is
            // the real one without the navigation state, so we keep the union - dropping `isOnSearch` here would
            // strip a param the base path still needs.
            const result = getPathWithoutDynamicSuffix('/r/123/merge/1/details/merge/2/confirmation?isOnSearch=true&reportID=5', 'merge/2/confirmation', 'merge/:transactionID/confirmation');

            expect(result).toBe('/r/123/merge/1/details?isOnSearch=true&reportID=5');
        });
    });

    describe('actualSuffix shorter than registered pattern (optional absent)', () => {
        it('strips only the actualSuffix length when trailing optional is absent', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/opt-page', 'opt-page', 'opt-page/:id?');

            expect(result).toBe('/r/123');
        });

        it('strips actualSuffix when middle optional is absent', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/wrap/end', 'wrap/end', 'wrap/:p?/end');

            expect(result).toBe('/r/123');
        });

        it('preserves query params when stripping shorter actualSuffix', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/opt-page?baseParam=1', 'opt-page', 'opt-page/:id?');

            expect(result).toBe('/r/123?baseParam=1');
        });

        it('preserves query params when stripping full optional present-form', () => {
            const result = getPathWithoutDynamicSuffix('/r/123/opt-page/789?baseParam=1', 'opt-page/789', 'opt-page/:id?');

            expect(result).toBe('/r/123?baseParam=1');
        });
    });
});
