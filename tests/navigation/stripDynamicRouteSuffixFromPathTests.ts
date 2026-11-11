import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

describe('stripDynamicRouteSuffixFromPath', () => {
    const suffix = DYNAMIC_ROUTES.VERIFY_ACCOUNT.path;
    const parametricSuffix = DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.path;
    const feed = 'oauth.mockbank.com%2322709230';
    const cardID = '2406988247305323';
    const cardDetailsPath = `workspaces/ABC123/company-cards/company-card-details/${feed}/${cardID}`;

    it('strips a matching suffix', () => {
        expect(stripDynamicRouteSuffixFromPath('settings/wallet/verify-account', suffix)).toBe('settings/wallet');
    });

    it('strips a parametric suffix', () => {
        expect(stripDynamicRouteSuffixFromPath(`${cardDetailsPath}/edit/export/${feed}/${cardID}`, parametricSuffix)).toBe(cardDetailsPath);
    });

    it('returns the path unchanged when the suffix does not match', () => {
        expect(stripDynamicRouteSuffixFromPath('settings/wallet', suffix)).toBe('settings/wallet');
    });

    it('strips a leading slash', () => {
        expect(stripDynamicRouteSuffixFromPath('/settings/wallet', suffix)).toBe('settings/wallet');
    });
});
