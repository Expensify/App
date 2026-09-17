import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

describe('stripDynamicRouteSuffixFromPath', () => {
    const suffix = DYNAMIC_ROUTES.VERIFY_ACCOUNT.path;

    it('strips a matching suffix', () => {
        expect(stripDynamicRouteSuffixFromPath('settings/wallet/verify-account', suffix)).toBe('settings/wallet');
    });

    it('returns the path unchanged when the suffix does not match', () => {
        expect(stripDynamicRouteSuffixFromPath('settings/wallet', suffix)).toBe('settings/wallet');
    });

    it('strips a leading slash', () => {
        expect(stripDynamicRouteSuffixFromPath('/settings/wallet', suffix)).toBe('settings/wallet');
    });
});
