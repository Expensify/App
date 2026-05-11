const oldRoutes: Record<string, string> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    '/settings/*/category/*/edit': '/settings/$1/category/$2/category-edit',
    '/settings/workspaces/*': '/workspaces/$1',
    '/settings/workspaces': '/workspaces',
    '/r/*/settings/name': '/r/$1/details/settings/name',
    '/workspaces/*/overview/address': '/workspaces/$1/overview/workspace-address',
    '/workspaces/*/categories/settings': '/workspaces/$1/categories/categories-settings',
    '/workspaces/*/categories/new': '/workspaces/$1/categories/category-new',
    '/workspaces/*/tags/*/edit': '/settings/$1/tags/settings/tag-list-edit/$2',
    '/workspaces/*/tags/new': '/settings/$1/tags/tag-new',
    '/workspaces/*/tag/*/*/edit': '/settings/$1/tags/tag-settings/$2/$3/tag-edit',
    '/workspaces/*/tag/*/*/gl-code': '/settings/$1/tags/tag-settings/$2/$3/tag-gl-code',
    '/workspaces/*/tag/*/*': '/settings/$1/tags/tag-settings/$2/$3',
    '/workspaces/*/accounting/*/card-reconciliation/account': '/workspaces/$1/accounting/$2/card-reconciliation/account-reconciliation-settings',
    '/workspaces/*/connections/netsuite/export/invoice-item-preference/invoice-item/select': '/workspaces/$1/connections/netsuite/export/invoice-item-preference/select/invoice-item/select',
    '/workspaces/*/connections/xero/export/preferred-exporter/select': '/workspaces/$1/accounting/xero/export/xero-preferred-exporter/select',
    '/workspaces/*/connections/quickbooks-online/advanced/autosync/accounting-method':
        '/workspaces/$1/accounting/quickbooks-online/advanced/quickbooks-online-autosync/quickbooks-online-accounting-method',
    '/workspaces/*/connections/quickbooks-online/advanced/autosync': '/workspaces/$1/accounting/quickbooks-online/advanced/quickbooks-online-autosync',
    '/workspaces/*/accounting/quickbooks-desktop/export/company-card-expense-account': '/workspaces/$1/accounting/quickbooks-desktop/export/qbd-company-card-expense-account',
    '/workspaces/*/accounting/quickbooks-desktop/export/company-card-expense-account-select': '/workspaces/$1/accounting/quickbooks-desktop/export/qbd-company-card-expense-account-select',
    '/workspaces/*/accounting/quickbooks-desktop/export/company-card-expense-account/account-select':
        '/workspaces/$1/accounting/quickbooks-desktop/export/qbd-company-card-expense-account-select',
    '/workspaces/*/accounting/quickbooks-desktop/export/out-of-pocket-expense/account-select': '/workspaces/$1/accounting/quickbooks-desktop/export/out-of-pocket-expense/qbd-account-select',
    '/workspaces/*/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select': '/workspaces/$1/accounting/quickbooks-desktop/export/out-of-pocket-expense/qbd-entity-select',
    '/flag/*/*': '/r/$1/flag/$1/$2',
    '/home-page': '/home',
    /* eslint-enable @typescript-eslint/naming-convention */
};

export default oldRoutes;
