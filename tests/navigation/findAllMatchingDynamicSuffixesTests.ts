import findAllMatchingDynamicSuffixes, {findMatchingDynamicSuffix} from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        VERIFY_ACCOUNT: {path: 'verify-account'},
        ADD_BANK_ACCOUNT_VERIFY_ACCOUNT: {path: 'add-bank-account/verify-account'},
        COUNTRY: {path: 'country', queryParams: {country: true}},
        FLAG_COMMENT: {path: 'flag/:reportID/:reportActionID'},
        MEMBER_DETAILS: {path: 'member-details/:accountID'},
        KEYBOARD_SHORTCUTS: {path: 'keyboard-shortcuts'},
        OPT_TRAILING: {path: 'opt-page/:id?'},
        OPT_MIDDLE: {path: 'wrap/:p?/end'},
        CATEGORY_GL_CODE: {path: 'gl-code'},
        TAG_SETTINGS: {path: 'tag-settings/:orderWeight/:tagName'},
        TAG_APPROVER: {path: 'tag-approver'},
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

    describe('optional path params', () => {
        it('should match trailing-optional pattern when optional is absent', () => {
            expect(findMatchingDynamicSuffix('/r/123/opt-page')).toEqual({
                pattern: 'opt-page/:id?',
                actualSuffix: 'opt-page',
                pathParams: {},
            });
        });

        it('should match trailing-optional pattern when optional is present', () => {
            expect(findMatchingDynamicSuffix('/r/123/opt-page/789')).toEqual({
                pattern: 'opt-page/:id?',
                actualSuffix: 'opt-page/789',
                pathParams: {id: '789'},
            });
        });

        it('should match middle-optional pattern when optional is absent', () => {
            expect(findMatchingDynamicSuffix('/r/123/wrap/end')).toEqual({
                pattern: 'wrap/:p?/end',
                actualSuffix: 'wrap/end',
                pathParams: {},
            });
        });

        it('should match middle-optional pattern when optional is present', () => {
            expect(findMatchingDynamicSuffix('/r/123/wrap/x/end')).toEqual({
                pattern: 'wrap/:p?/end',
                actualSuffix: 'wrap/x/end',
                pathParams: {p: 'x'},
            });
        });

        it('should ignore query params when matching trailing-optional present-form', () => {
            expect(findMatchingDynamicSuffix('/r/123/opt-page/789?tab=details')).toEqual({
                pattern: 'opt-page/:id?',
                actualSuffix: 'opt-page/789',
                pathParams: {id: '789'},
            });
        });

        it('should ignore query params when matching trailing-optional absent-form', () => {
            expect(findMatchingDynamicSuffix('/r/123/opt-page?tab=details')).toEqual({
                pattern: 'opt-page/:id?',
                actualSuffix: 'opt-page',
                pathParams: {},
            });
        });
    });
});

describe('findAllMatchingDynamicSuffixes', () => {
    it('should return an empty array when no suffix matches', () => {
        expect(findAllMatchingDynamicSuffixes('/settings/wallet/unknown-page')).toEqual([]);
    });

    it('should return an empty array for an empty path', () => {
        expect(findAllMatchingDynamicSuffixes('')).toEqual([]);
    });

    it('should return an empty array for undefined', () => {
        expect(findAllMatchingDynamicSuffixes(undefined)).toEqual([]);
    });

    it('should return a single-element array for an unambiguous static path', () => {
        expect(findAllMatchingDynamicSuffixes('settings/wallet/verify-account')).toEqual([{pattern: 'verify-account', actualSuffix: 'verify-account', pathParams: {}}]);
    });

    it('should return both a static and a parametric candidate when a tag name matches a static suffix (gl-code collision)', () => {
        expect(findAllMatchingDynamicSuffixes('/settings/tags/tag-settings/0/gl-code')).toEqual([
            {pattern: 'gl-code', actualSuffix: 'gl-code', pathParams: {}},
            {
                pattern: 'tag-settings/:orderWeight/:tagName',
                actualSuffix: 'tag-settings/0/gl-code',
                pathParams: {orderWeight: '0', tagName: 'gl-code'},
            },
        ]);
    });

    it('should place static candidates before strict parametric candidates (priority order)', () => {
        const results = findAllMatchingDynamicSuffixes('/base/flag/123/verify-account');
        expect(results).toHaveLength(2);
        expect(results.at(0)).toEqual({pattern: 'verify-account', actualSuffix: 'verify-account', pathParams: {}});
        expect(results.at(1)).toEqual({
            pattern: 'flag/:reportID/:reportActionID',
            actualSuffix: 'flag/123/verify-account',
            pathParams: {reportID: '123', reportActionID: 'verify-account'},
        });
    });

    it('should place static candidates before optional parametric candidates (priority order)', () => {
        const results = findAllMatchingDynamicSuffixes('/base/opt-page/verify-account');
        expect(results).toHaveLength(2);
        expect(results.at(0)).toEqual({pattern: 'verify-account', actualSuffix: 'verify-account', pathParams: {}});
        expect(results.at(1)).toEqual({
            pattern: 'opt-page/:id?',
            actualSuffix: 'opt-page/verify-account',
            pathParams: {id: 'verify-account'},
        });
    });

    it('should return a single-element array when only one candidate exists (tag-approver at the end)', () => {
        expect(findAllMatchingDynamicSuffixes('/settings/tags/tag-settings/0/tagname/tag-approver')).toEqual([{pattern: 'tag-approver', actualSuffix: 'tag-approver', pathParams: {}}]);
    });
});
