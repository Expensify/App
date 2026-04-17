import findMatchingDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/findMatchingDynamicSuffix';

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        VERIFY_ACCOUNT: {path: 'verify-account'},
        ADD_BANK_ACCOUNT_VERIFY_ACCOUNT: {path: 'add-bank-account/verify-account'},
        COUNTRY: {path: 'country', queryParams: {country: true}},
        FLAG_COMMENT: {path: 'flag/:reportID/:reportActionID'},
        MEMBER_DETAILS: {path: 'member-details/:accountID'},
        KEYBOARD_SHORTCUTS: {path: 'keyboard-shortcuts'},
    },
}));

describe('findMatchingDynamicSuffix', () => {
    it('should match a single-segment dynamic suffix', () => {
        expect(findMatchingDynamicSuffix('settings/wallet/verify-account')).toEqual({
            pattern: 'verify-account',
            actualSuffix: 'verify-account',
            pathParams: {},
        });
    });

    it('should match when the path has a leading slash', () => {
        expect(findMatchingDynamicSuffix('/settings/wallet/verify-account')).toEqual({
            pattern: 'verify-account',
            actualSuffix: 'verify-account',
            pathParams: {},
        });
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
        expect(findMatchingDynamicSuffix('settings/wallet/verify-account?sortBy=date')).toEqual({
            pattern: 'verify-account',
            actualSuffix: 'verify-account',
            pathParams: {},
        });
    });

    it('should handle trailing slashes', () => {
        expect(findMatchingDynamicSuffix('settings/wallet/verify-account/')).toEqual({
            pattern: 'verify-account',
            actualSuffix: 'verify-account',
            pathParams: {},
        });
    });

    it('should not match a suffix that appears in the middle of the path', () => {
        expect(findMatchingDynamicSuffix('/verify-account/settings/wallet')).toBeUndefined();
    });

    it('should match a suffix when path has suffix-specific query params', () => {
        expect(findMatchingDynamicSuffix('settings/profile/address/country?country=US')).toEqual({
            pattern: 'country',
            actualSuffix: 'country',
            pathParams: {},
        });
    });

    it('should prefer longer multi-segment static match over shorter', () => {
        expect(findMatchingDynamicSuffix('/settings/wallet/add-bank-account/verify-account')).toEqual({
            pattern: 'add-bank-account/verify-account',
            actualSuffix: 'add-bank-account/verify-account',
            pathParams: {},
        });
    });

    it('should match parametric suffix and extract params', () => {
        expect(findMatchingDynamicSuffix('/r/123/flag/456/abc')).toEqual({
            pattern: 'flag/:reportID/:reportActionID',
            actualSuffix: 'flag/456/abc',
            pathParams: {reportID: '456', reportActionID: 'abc'},
        });
    });

    it('should match single-param suffix', () => {
        expect(findMatchingDynamicSuffix('/r/123/members/member-details/456')).toEqual({
            pattern: 'member-details/:accountID',
            actualSuffix: 'member-details/456',
            pathParams: {accountID: '456'},
        });
    });

    it('should not match parametric suffix in the middle of path', () => {
        expect(findMatchingDynamicSuffix('/flag/123/abc/settings/wallet')).toBeUndefined();
    });

    it('should return undefined when no parametric pattern matches', () => {
        expect(findMatchingDynamicSuffix('/r/123/unknown/456/abc')).toBeUndefined();
    });

    it('should handle query params alongside parametric suffix', () => {
        expect(findMatchingDynamicSuffix('/r/123/flag/456/abc?tab=details')).toEqual({
            pattern: 'flag/:reportID/:reportActionID',
            actualSuffix: 'flag/456/abc',
            pathParams: {reportID: '456', reportActionID: 'abc'},
        });
    });

    it('should match keyboard-shortcuts dynamic suffix', () => {
        expect(findMatchingDynamicSuffix('settings/about/keyboard-shortcuts')).toEqual({
            pattern: 'keyboard-shortcuts',
            actualSuffix: 'keyboard-shortcuts',
            pathParams: {},
        });
    });
});
