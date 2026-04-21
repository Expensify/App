const oldRoutes: Record<string, string> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    '/settings/*/category/*/edit': '/settings/$1/category/$2/category-edit',
    '/settings/workspaces/*': '/workspaces/$1',
    '/settings/workspaces': '/workspaces',
    '/r/*/settings/name': '/r/$1/details/settings/name',
    '/workspaces/*/overview/address': '/workspaces/$1/overview/workspace-address',
    '/workspaces/*/accounting/*/card-reconciliation/account': '/workspaces/$1/accounting/$2/card-reconciliation/account-reconciliation-settings',
    '/workspaces/*/accounting/sage-intacct/export/preferred-exporter': '/workspaces/$1/accounting/sage-intacct/export/sage-preferred-exporter',
    '/workspaces/*/accounting/sage-intacct/export/reimbursable/destination': '/workspaces/$1/accounting/sage-intacct/export/reimbursable-expenses',
    '/workspaces/*/connections/quickbooks-online/advanced/autosync/accounting-method':
        '/workspaces/$1/accounting/quickbooks-online/advanced/quickbooks-online-autosync/quickbooks-online-accounting-method',
    '/workspaces/*/connections/quickbooks-online/advanced/autosync': '/workspaces/$1/accounting/quickbooks-online/advanced/quickbooks-online-autosync',
    '/flag/*/*': '/r/$1/flag/$1/$2',
    '/home-page': '/home',
    /* eslint-enable @typescript-eslint/naming-convention */
};

export default oldRoutes;
