import CONST from '@src/CONST';

import shouldSuppressPromotionalUISelector from '@selectors/PromotionalUI';

describe('shouldSuppressPromotionalUISelector', () => {
    it('returns false for a normal session', () => {
        expect(shouldSuppressPromotionalUISelector({email: 'user@example.com'}, {})).toBe(false);
    });

    it('returns true during a supportal session', () => {
        expect(shouldSuppressPromotionalUISelector({authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT}, {})).toBe(true);
    });

    it('returns true when acting as a copilot', () => {
        expect(shouldSuppressPromotionalUISelector({}, {delegatedAccess: {delegate: 'copilot@expensify.com'}})).toBe(true);
    });
});
