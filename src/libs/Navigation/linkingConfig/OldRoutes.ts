const oldRoutes: Record<string, string> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    '/settings/*/category/*/edit': '/settings/$1/category/$2/category-edit',
    '/settings/workspaces/*': '/workspaces/$1',
    '/settings/workspaces': '/workspaces',
    '/r/*/settings/name': '/r/$1/details/settings/name',
    '/workspaces/*/overview/address': '/workspaces/$1/overview/workspace-address',
    '/workspaces/*/accounting/*/card-reconciliation/account': '/workspaces/$1/accounting/$2/card-reconciliation/account-reconciliation-settings',
    '/workspaces/*/connections/netsuite/export/invoice-item-preference/invoice-item/select': '/workspaces/$1/connections/netsuite/export/invoice-item-preference/select/invoice-item/select',
    '/workspaces/*/connections/quickbooks-online/advanced/autosync/accounting-method':
        '/workspaces/$1/accounting/quickbooks-online/advanced/quickbooks-online-autosync/quickbooks-online-accounting-method',
    '/workspaces/*/connections/quickbooks-online/advanced/autosync': '/workspaces/$1/accounting/quickbooks-online/advanced/quickbooks-online-autosync',
    '/flag/*/*': '/r/$1/flag/$1/$2',
    '/home-page': '/home',
    /* eslint-enable @typescript-eslint/naming-convention */
};

export default oldRoutes;
