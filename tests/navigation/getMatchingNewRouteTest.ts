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

    it('redirects old report settings root path to dynamic report settings', () => {
        expect(getMatchingNewRoute('/r/123/settings')).toBe('/r/123/details/report-settings');
    });

    it('preserves query params when redirecting report settings root', () => {
        expect(getMatchingNewRoute('/r/123/settings?backTo=/home')).toBe('/r/123/details/report-settings?backTo=/home');
    });

    it('redirects old task title path', () => {
        expect(getMatchingNewRoute('/r/123/title')).toBe('/r/123/title');
    });

    it('redirects old report description path', () => {
        expect(getMatchingNewRoute('/r/123/description')).toBe('/r/123/description');
    });

    it('redirects old room members path to report details dynamic suffix', () => {
        expect(getMatchingNewRoute('/r/123/members')).toBe('/r/123/details/members');
    });

    it('preserves query params when redirecting old room members path', () => {
        expect(getMatchingNewRoute('/r/123/members?backTo=/home')).toBe('/r/123/details/members?backTo=/home');
    });

    it('redirects old room member details path to report details dynamic suffix', () => {
        expect(getMatchingNewRoute('/r/123/members/456')).toBe('/r/123/details/members/room-member-details/456');
    });

    it('preserves query params when redirecting old room member details path', () => {
        expect(getMatchingNewRoute('/r/123/members/456?backTo=/home')).toBe('/r/123/details/members/room-member-details/456?backTo=/home');
    });

    it('redirects old room invite path to report details dynamic suffix', () => {
        expect(getMatchingNewRoute('/r/123/invite')).toBe('/r/123/details/room-invite');
    });

    it('preserves query params when redirecting old room invite path', () => {
        expect(getMatchingNewRoute('/r/123/invite?backTo=/home')).toBe('/r/123/details/room-invite?backTo=/home');
    });

    it('redirects old task assignee path', () => {
        expect(getMatchingNewRoute('/r/123/assignee')).toBe('/r/123/assignee');
    });

    it('redirects old private notes edit path to the new dynamic suffix shape', () => {
        expect(getMatchingNewRoute('/r/123/notes/456/edit')).toBe('/r/123/notes-edit/456');
    });

    it('redirects old report participants invite path to the dynamic route', () => {
        expect(getMatchingNewRoute('/r/123/participants/invite')).toBe('/r/123/participants/participants-invite');
    });

    it('preserves query params when redirecting report participant routes', () => {
        expect(getMatchingNewRoute('/r/123/participants/invite?backTo=/home')).toBe('/r/123/participants/participants-invite?backTo=/home');
        expect(getMatchingNewRoute('/r/123/participants/456/role?backTo=/home')).toBe('/r/123/participants/participants-details/456/participants-role?backTo=/home');
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

    it('redirects old QuickBooks Desktop out-of-pocket selector paths to new dynamic routes', () => {
        expect(getMatchingNewRoute('/workspaces/p123/accounting/quickbooks-desktop/export/out-of-pocket-expense/account-select')).toBe(
            '/workspaces/p123/accounting/quickbooks-desktop/export/qbd-out-of-pocket-expense/qbd-account-select',
        );
        expect(getMatchingNewRoute('/workspaces/p123/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select')).toBe(
            '/workspaces/p123/accounting/quickbooks-desktop/export/qbd-out-of-pocket-expense/qbd-entity-select',
        );
    });

    it('preserves query params when redirecting old QuickBooks Desktop out-of-pocket selector paths', () => {
        expect(getMatchingNewRoute('/workspaces/p123/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select?backTo=/home')).toBe(
            '/workspaces/p123/accounting/quickbooks-desktop/export/qbd-out-of-pocket-expense/qbd-entity-select?backTo=/home',
        );
    });

    it('preserves query params when redirecting old NetSuite invoice item preference path', () => {
        expect(getMatchingNewRoute('/workspaces/abc/connections/netsuite/export/invoice-item-preference/invoice-item/select?backTo=/home')).toBe(
            '/workspaces/abc/connections/netsuite/export/invoice-item-preference/select/invoice-item/select?backTo=/home',
        );
    });
    it('redirects old settings category path to the new dynamic suffix shape', () => {
        expect(getMatchingNewRoute('/settings/abc/category/Meals')).toBe('/settings/abc/categories/category-settings/Meals');
    });

    it('preserves query params when redirecting old settings category path', () => {
        expect(getMatchingNewRoute('/settings/abc/category/Meals?backTo=/home')).toBe('/settings/abc/categories/category-settings/Meals?backTo=/home');
    });

    it('redirects old settings category edit path to the new dynamic suffix shape', () => {
        expect(getMatchingNewRoute('/settings/abc/category/Meals/edit')).toBe('/settings/abc/categories/category-settings/Meals/category-edit');
    });

    it('preserves query params when redirecting old settings category edit path', () => {
        expect(getMatchingNewRoute('/settings/abc/category/Meals/edit?backTo=/home')).toBe('/settings/abc/categories/category-settings/Meals/category-edit?backTo=/home');
    });

    it('redirects old settings tag routes to the new dynamic suffix shape', () => {
        expect(getMatchingNewRoute('/settings/p123/tags/10/edit')).toBe('/settings/p123/tags/settings-tags-edit/10');
        expect(getMatchingNewRoute('/settings/p123/tags/settings')).toBe('/settings/p123/tags/settings-tags-settings');
        expect(getMatchingNewRoute('/settings/p123/tags/settings/edit/10')).toBe('/settings/p123/tags/settings-tags-settings/settings-tags-edit/10');
        expect(getMatchingNewRoute('/settings/p123/tags/tag-list/0/edit/0')).toBe('/settings/p123/tags/tag-list/0/settings-tags-edit/0');
        expect(getMatchingNewRoute('/settings/p123/tags/new')).toBe('/settings/p123/tags/tag-new');
        expect(getMatchingNewRoute('/settings/p123/tag/10/Meals')).toBe('/settings/p123/tags/tag-settings/10/Meals');
        expect(getMatchingNewRoute('/settings/p123/tag/10/Meals/edit')).toBe('/settings/p123/tags/tag-settings/10/Meals/tag-edit/10/Meals');
        expect(getMatchingNewRoute('/settings/p123/tag/10/Meals/gl-code')).toBe('/settings/p123/tags/tag-settings/10/Meals/gl-code/10/Meals');
    });

    it('preserves query params when redirecting old settings tag routes', () => {
        expect(getMatchingNewRoute('/settings/p123/tags/10/edit?backTo=/home')).toBe('/settings/p123/tags/settings-tags-edit/10?backTo=/home');
        expect(getMatchingNewRoute('/settings/p123/tags/settings?backTo=/home')).toBe('/settings/p123/tags/settings-tags-settings?backTo=/home');
        expect(getMatchingNewRoute('/settings/p123/tag/10/Meals?parentTagsFilter=Food')).toBe('/settings/p123/tags/tag-settings/10/Meals?parentTagsFilter=Food');
    });

    it('redirects old workspace tag routes to the new dynamic suffix shape', () => {
        expect(getMatchingNewRoute('/workspaces/p123/tags/settings')).toBe('/workspaces/p123/tags/tags-settings');
        expect(getMatchingNewRoute('/workspaces/p123/tags/new')).toBe('/workspaces/p123/tags/tag-create');
        expect(getMatchingNewRoute('/workspaces/p123/tag-list/0')).toBe('/workspaces/p123/tags/workspace-tag-list/0');
        expect(getMatchingNewRoute('/workspaces/p123/tags/import')).toBe('/workspaces/p123/tags/workspace-tags-import');
        expect(getMatchingNewRoute('/workspaces/p123/tags/imported')).toBe('/workspaces/p123/tags/workspace-tags-imported');
        expect(getMatchingNewRoute('/workspaces/p123/tags/10/edit')).toBe('/workspaces/p123/tags/tags-settings/workspace-edit-tags/10');
        expect(getMatchingNewRoute('/workspaces/p123/tag/10/Meals')).toBe('/workspaces/p123/tags/workspace-tag-settings/10/Meals');
        expect(getMatchingNewRoute('/workspaces/p123/tag/10/Meals/edit')).toBe('/workspaces/p123/tags/workspace-tag-settings/10/Meals/workspace-tag-edit');
        expect(getMatchingNewRoute('/workspaces/p123/tag/10/Meals/gl-code')).toBe('/workspaces/p123/tags/workspace-tag-settings/10/Meals/workspace-tag-gl-code');
        expect(getMatchingNewRoute('/workspaces/p123/tag/10/Meals/approver')).toBe('/workspaces/p123/tags/workspace-tag-settings/10/Meals/workspace-tag-approver');
    });

    it('preserves query params when redirecting old workspace tag routes', () => {
        expect(getMatchingNewRoute('/workspaces/p123/tags/settings?backTo=/home')).toBe('/workspaces/p123/tags/tags-settings?backTo=/home');
        expect(getMatchingNewRoute('/workspaces/p123/tags/new?backTo=/home')).toBe('/workspaces/p123/tags/tag-create?backTo=/home');
        expect(getMatchingNewRoute('/workspaces/p123/tag-list/0?backTo=/home')).toBe('/workspaces/p123/tags/workspace-tag-list/0?backTo=/home');
        expect(getMatchingNewRoute('/workspaces/p123/tags/import?backTo=/home')).toBe('/workspaces/p123/tags/workspace-tags-import?backTo=/home');
        expect(getMatchingNewRoute('/workspaces/p123/tags/imported?backTo=/home')).toBe('/workspaces/p123/tags/workspace-tags-imported?backTo=/home');
        expect(getMatchingNewRoute('/workspaces/p123/tags/10/edit?backTo=/home')).toBe('/workspaces/p123/tags/tags-settings/workspace-edit-tags/10?backTo=/home');
        expect(getMatchingNewRoute('/workspaces/p123/tag/10/Meals?parentTagsFilter=Food')).toBe('/workspaces/p123/tags/workspace-tag-settings/10/Meals?parentTagsFilter=Food');
    });

    it('does not redirect the new workspace tag dynamic routes', () => {
        expect(getMatchingNewRoute('/workspaces/p123/tags/tags-settings')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/p123/tags/tag-create')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/p123/tags/workspace-tag-list/0')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/p123/tags/workspace-tags-import')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/p123/tags/workspace-tags-imported')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/p123/tags/tags-settings/workspace-edit-tags/10')).toBe(undefined);
        expect(getMatchingNewRoute('/workspaces/p123/tags/workspace-tag-settings/10/Meals')).toBe(undefined);
    });

    it('does not redirect the new settings tag dynamic routes', () => {
        expect(getMatchingNewRoute('/settings/p123/tags/settings-tags-edit/10')).toBe(undefined);
        expect(getMatchingNewRoute('/settings/p123/tags/settings-tags-settings')).toBe(undefined);
        expect(getMatchingNewRoute('/settings/p123/tags/tag-list/0/settings-tags-edit/0')).toBe(undefined);
    });

    it('redirects old flag comment path to report-based dynamic route', () => {
        expect(getMatchingNewRoute('/flag/123/456')).toBe('/r/123/flag/123/456');
    });

    it('redirects old report Share Code paths to the new dynamic suffix', () => {
        expect(getMatchingNewRoute('/r/123/details/shareCode')).toBe('/r/123/share-code');
        expect(getMatchingNewRoute('/e/123/details/shareCode')).toBe('/e/123/share-code');
    });

    it('redirects legacy standalone referral routes to a dynamic route with a home base', () => {
        expect(getMatchingNewRoute('/referral/shareCode')).toBe('/home/referral/shareCode');
    });

    it('redirects old travel upgrade path to dynamic route', () => {
        expect(getMatchingNewRoute('/travel/upgrade')).toBe('/travel/travel-upgrade');
        expect(getMatchingNewRoute('/travel/upgrade?backTo=/home')).toBe('/travel/travel-upgrade?backTo=/home');
    });

    it('redirects legacy profile avatar path to new avatar route', () => {
        expect(getMatchingNewRoute('/a/123/avatar')).toBe('/avatar/123');
    });

    it('preserves query params when redirecting legacy profile avatar path', () => {
        expect(getMatchingNewRoute('/a/123/avatar?backTo=/home')).toBe('/avatar/123?backTo=/home');
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

    describe('redirects old enable-payments substeps to their new routes', () => {
        const enablePaymentsCases = [
            {oldRoute: '/settings/wallet/enable-payments/plaid', expectedRoute: '/settings/wallet/enable-payments/add-bank-account/plaid'},
            {oldRoute: '/settings/wallet/enable-payments/bank-account-confirmation', expectedRoute: '/settings/wallet/enable-payments/add-bank-account/confirmation'},
            {oldRoute: '/settings/wallet/enable-payments/legal-name', expectedRoute: '/settings/wallet/enable-payments/personal-info/legal-name'},
            {oldRoute: '/settings/wallet/enable-payments/date-of-birth', expectedRoute: '/settings/wallet/enable-payments/personal-info/date-of-birth'},
            {oldRoute: '/settings/wallet/enable-payments/address', expectedRoute: '/settings/wallet/enable-payments/personal-info/address'},
            {oldRoute: '/settings/wallet/enable-payments/phone-number', expectedRoute: '/settings/wallet/enable-payments/personal-info/phone-number'},
            {oldRoute: '/settings/wallet/enable-payments/ssn', expectedRoute: '/settings/wallet/enable-payments/personal-info/ssn'},
            {oldRoute: '/settings/wallet/enable-payments/personal-info-confirmation', expectedRoute: '/settings/wallet/enable-payments/personal-info/confirmation'},
            {oldRoute: '/settings/wallet/enable-payments/fees', expectedRoute: '/settings/wallet/enable-payments/fees-and-terms/fees'},
            {oldRoute: '/settings/wallet/enable-payments/terms', expectedRoute: '/settings/wallet/enable-payments/fees-and-terms/terms'},
        ];

        it.each(enablePaymentsCases)('redirects $oldRoute to $expectedRoute', ({oldRoute, expectedRoute}) => {
            expect(getMatchingNewRoute(oldRoute)).toBe(expectedRoute);
        });

        it.each(enablePaymentsCases)('preserves query params when redirecting $oldRoute', ({oldRoute, expectedRoute}) => {
            expect(getMatchingNewRoute(`${oldRoute}?policyID=123`)).toBe(`${expectedRoute}?policyID=123`);
        });
    });

    it('does not redirect the new enable-payments fees-and-terms page', () => {
        expect(getMatchingNewRoute('/settings/wallet/enable-payments/fees-and-terms')).toBe(undefined);
        expect(getMatchingNewRoute('/settings/wallet/enable-payments/fees-and-terms/fees')).toBe(undefined);
        expect(getMatchingNewRoute('/settings/wallet/enable-payments/fees-and-terms/terms')).toBe(undefined);
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

    it('redirects legacy workspace company card details paths to dynamic routes', () => {
        expect(getMatchingNewRoute('/workspaces/D56D50B841F69B0E/company-cards/oauth.mockbank.com%2322298108/6421535706958904')).toBe(
            '/workspaces/D56D50B841F69B0E/company-cards/company-card-details/oauth.mockbank.com%2322298108/6421535706958904',
        );
        expect(getMatchingNewRoute('/workspaces/p123/company-cards/oauth.chase%2099999/456/edit/export')).toBe(
            '/workspaces/p123/company-cards/company-card-details/oauth.chase%2099999/456/edit/export',
        );
    });

    it('does not rewrite already-migrated workspace company card details paths', () => {
        expect(getMatchingNewRoute('/workspaces/D56D50B841F69B0E/company-cards/company-card-details/oauth.mockbank.com%2322298108/6421535706958904')).toBe(
            '/workspaces/D56D50B841F69B0E/company-cards/company-card-details/oauth.mockbank.com%2322298108/6421535706958904',
        );
        expect(getMatchingNewRoute('/workspaces/p123/company-cards/company-card-details/oauth.chase%2099999/456/edit/export')).toBe(
            '/workspaces/p123/company-cards/company-card-details/oauth.chase%2099999/456/edit/export',
        );
    });

    it('does not rewrite workspace company card static child pages', () => {
        expect(getMatchingNewRoute('/workspaces/p123/company-cards/oauth.chase%2099999/456/edit/name')).toBe('/workspaces/p123/company-cards/oauth.chase%2099999/456/edit/name');
        expect(getMatchingNewRoute('/workspaces/p123/company-cards/oauth.chase%2099999/456/edit/transaction-start-date')).toBe(
            '/workspaces/p123/company-cards/oauth.chase%2099999/456/edit/transaction-start-date',
        );
        expect(getMatchingNewRoute('/workspaces/p123/company-cards/oauth.chase%2099999/broken-card-feed-connection')).toBe(
            '/workspaces/p123/company-cards/oauth.chase%2099999/broken-card-feed-connection',
        );
        expect(getMatchingNewRoute('/workspaces/p123/company-cards/oauth.chase%2099999/assign-card/456/card-selection')).toBe(
            '/workspaces/p123/company-cards/oauth.chase%2099999/assign-card/456/card-selection',
        );
    });

    it('does not rewrite dynamic assign-card assignee paths', () => {
        expect(getMatchingNewRoute('/workspaces/D56D50B841F69B0E/company-cards/assign-card/oauth.mockbank.com%2322298108/Mock%20Credit%20Card%20-%201234/assignee')).toBe(
            '/workspaces/D56D50B841F69B0E/company-cards/assign-card/oauth.mockbank.com%2322298108/Mock%20Credit%20Card%20-%201234/assignee',
        );
    });

    it('redirects corrupted company-card-details assign-card paths to the correct dynamic assign route', () => {
        expect(
            getMatchingNewRoute('/workspaces/D56D50B841F69B0E/company-cards/company-card-details/assign-card/oauth.mockbank.com%2322298108/Mock%20Credit%20Card%20-%201234/assignee'),
        ).toBe('/workspaces/D56D50B841F69B0E/company-cards/assign-card/oauth.mockbank.com%2322298108/Mock%20Credit%20Card%20-%201234/assignee');
    });
});
