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

    it('redirects old NetSuite invoice item preference path to the new dynamic suffix shape', () => {
        expect(getMatchingNewRoute('/workspaces/abc/connections/netsuite/export/invoice-item-preference/invoice-item/select')).toBe(
            '/workspaces/abc/connections/netsuite/export/invoice-item-preference/select/invoice-item/select',
        );
    });

    it('preserves query params when redirecting old NetSuite invoice item preference path', () => {
        expect(getMatchingNewRoute('/workspaces/abc/connections/netsuite/export/invoice-item-preference/invoice-item/select?backTo=/home')).toBe(
            '/workspaces/abc/connections/netsuite/export/invoice-item-preference/select/invoice-item/select?backTo=/home',
        );
    });
    it('redirects old settings category edit path to the new dynamic suffix shape', () => {
        expect(getMatchingNewRoute('/settings/abc/category/Meals/edit')).toBe('/settings/abc/category/Meals/category-edit');
    });

    it('preserves query params when redirecting old settings category edit path', () => {
        expect(getMatchingNewRoute('/settings/abc/category/Meals/edit?backTo=/home')).toBe('/settings/abc/category/Meals/category-edit?backTo=/home');
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

    it('redirects legacy QuickBooks Online connections autosync paths to dynamic routes', () => {
        expect(getMatchingNewRoute('/workspaces/p123/connections/quickbooks-online/advanced/autosync')).toBe(
            '/workspaces/p123/accounting/quickbooks-online/advanced/quickbooks-online-autosync',
        );
        expect(getMatchingNewRoute('/workspaces/p123/connections/quickbooks-online/advanced/autosync/accounting-method')).toBe(
            '/workspaces/p123/accounting/quickbooks-online/advanced/quickbooks-online-autosync/quickbooks-online-accounting-method',
        );
        expect(getMatchingNewRoute('/workspaces/p123/connections/quickbooks-online/advanced/autosync?backTo=/x')).toBe(
            '/workspaces/p123/accounting/quickbooks-online/advanced/quickbooks-online-autosync?backTo=/x',
        );
    });
});
