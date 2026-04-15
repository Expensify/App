import getMatchingNewRoute from '@navigation/helpers/getMatchingNewRoute';

describe('getBestMatchingPath', () => {
    it('returns mapped base path when input matches the exact pattern', () => {
        expect(getMatchingNewRoute('/settings/workspaces/')).toBe('/workspaces/');
    });

    it('returns mapped base path when input matches the exact pattern', () => {
        expect(getMatchingNewRoute('/settings/workspaces')).toBe('/workspaces');
    });

    it('returns mapped path when input matches the pattern and have more content', () => {
        expect(getMatchingNewRoute('/settings/workspaces/anything/more')).toBe('/workspaces/anything/more');
    });

    it('returns undefined when input does not match any pattern - similar prefix but different ending', () => {
        expect(getMatchingNewRoute('/settings/anything/')).toBe(undefined);
    });

    it('returns undefined when input is unrelated to any pattern', () => {
        expect(getMatchingNewRoute('/anything/workspaces/')).toBe(undefined);
        expect(getMatchingNewRoute('/anything/anything/')).toBe(undefined);
        expect(getMatchingNewRoute('/anything/anything/anything')).toBe(undefined);
    });

    it('redirects old report settings name path to report details', () => {
        expect(getMatchingNewRoute('/r/123/settings/name')).toBe('/r/123/details/settings/name');
    });

    it('preserves query params when redirecting report settings name', () => {
        expect(getMatchingNewRoute('/r/123/settings/name?backTo=/home')).toBe('/r/123/details/settings/name?backTo=/home');
    });

    it('redirects old workspace overview address path', () => {
        expect(getMatchingNewRoute('/workspaces/abc/overview/address')).toBe('/workspaces/abc/overview/workspace-address');
    });

    it('redirects old card reconciliation account path with two wildcards', () => {
        expect(getMatchingNewRoute('/workspaces/abc/accounting/xero/card-reconciliation/account')).toBe(
            '/workspaces/abc/accounting/xero/card-reconciliation/account-reconciliation-settings',
        );
        expect(getMatchingNewRoute('/workspaces/abc/accounting/netsuite/card-reconciliation/account')).toBe(
            '/workspaces/abc/accounting/netsuite/card-reconciliation/account-reconciliation-settings',
        );
    });

    it('redirects old flag comment path to report-based dynamic route', () => {
        expect(getMatchingNewRoute('/flag/123/456')).toBe('/r/123/flag/123/456');
    });

    it('does not redirect paths that look similar but do not match migrated patterns', () => {
        expect(getMatchingNewRoute('/r/123/settings/visibility')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/abc/overview/plan')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/abc/accounting/xero/card-reconciliation/settings')).toBe(undefined);
    });

    it('does not match extensions of exact patterns', () => {
        expect(getMatchingNewRoute('/home-page2')).toBe(undefined);
        expect(getMatchingNewRoute('/home-page/extra')).toBe(undefined);
        expect(getMatchingNewRoute('/r/123/settings/name-extra')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/abc/overview/address/sub')).toBe(undefined);
    });

    it('preserves fragment when redirecting', () => {
        expect(getMatchingNewRoute('/home-page?backTo=r/123')).toBe('/home?backTo=r/123');
    });
});
