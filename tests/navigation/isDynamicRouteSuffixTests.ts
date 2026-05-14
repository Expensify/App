import isDynamicRouteSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteSuffix';

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        VERIFY_ACCOUNT: {path: 'verify-account'},
        ADD_BANK_ACCOUNT_VERIFY_ACCOUNT: {path: 'add-bank-account/verify-account'},
        FLAG_COMMENT: {path: 'flag/:reportID/:reportActionID'},
        MEMBER_DETAILS: {path: 'member-details/:accountID'},
        OPT_TRAILING: {path: 'opt-page/:id?'},
        OPT_MIDDLE: {path: 'wrap/:p?/end'},
    },
}));

describe('isDynamicRouteSuffix', () => {
    it('should return true for exact static suffix', () => {
        expect(isDynamicRouteSuffix('verify-account')).toBe(true);
    });

    it('should return true for exact static multi-segment suffix', () => {
        expect(isDynamicRouteSuffix('add-bank-account/verify-account')).toBe(true);
    });

    it('should return false for unknown static suffix', () => {
        expect(isDynamicRouteSuffix('unknown-page')).toBe(false);
    });

    it('should return true for suffix matching single-param pattern', () => {
        expect(isDynamicRouteSuffix('member-details/456')).toBe(true);
    });

    it('should return true for suffix matching multi-param pattern', () => {
        expect(isDynamicRouteSuffix('flag/123/abc')).toBe(true);
    });

    it('should return false for suffix with wrong static prefix', () => {
        expect(isDynamicRouteSuffix('other/123/abc')).toBe(false);
    });

    it('should return false for suffix with wrong segment count', () => {
        expect(isDynamicRouteSuffix('flag/123')).toBe(false);
    });

    it('should return false for empty string', () => {
        expect(isDynamicRouteSuffix('')).toBe(false);
    });

    it('should return false for suffix with extra segments beyond pattern', () => {
        expect(isDynamicRouteSuffix('flag/123/abc/extra')).toBe(false);
    });

    it('should return true for trailing-optional pattern with optional absent', () => {
        expect(isDynamicRouteSuffix('opt-page')).toBe(true);
    });

    it('should return true for trailing-optional pattern with optional present', () => {
        expect(isDynamicRouteSuffix('opt-page/123')).toBe(true);
    });

    it('should return false when trailing-optional pattern has too many segments', () => {
        expect(isDynamicRouteSuffix('opt-page/123/extra')).toBe(false);
    });

    it('should return true for middle-optional pattern with optional absent', () => {
        expect(isDynamicRouteSuffix('wrap/end')).toBe(true);
    });

    it('should return true for middle-optional pattern with optional present', () => {
        expect(isDynamicRouteSuffix('wrap/x/end')).toBe(true);
    });

    it('should return false when middle-optional pattern has too many segments', () => {
        expect(isDynamicRouteSuffix('wrap/x/y/end')).toBe(false);
    });

    it('should return false when middle-optional pattern misses required suffix', () => {
        expect(isDynamicRouteSuffix('wrap/x')).toBe(false);
    });
});
