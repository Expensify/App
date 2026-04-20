const oldRoutes: Record<string, string> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    '/settings/workspaces/*': '/workspaces/$1',
    '/settings/workspaces': '/workspaces',
    '/r/*/settings/name': '/r/$1/details/settings/name',
    '/workspaces/*/overview/address': '/workspaces/$1/overview/workspace-address',
    '/workspaces/*/accounting/*/card-reconciliation/account': '/workspaces/$1/accounting/$2/card-reconciliation/account-reconciliation-settings',
    '/flag/*/*': '/r/$1/flag/$1/$2',
    '/home-page': '/home',
    /* eslint-enable @typescript-eslint/naming-convention */
};

export default oldRoutes;
