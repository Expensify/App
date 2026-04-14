const oldRoutes: Record<string, string> = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '/settings/workspaces/*': '/workspaces/$1',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '/settings/workspaces': '/workspaces',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '/r/*/settings/name': '/r/$1/details/settings/name',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '/workspaces/*/overview/address': '/workspaces/$1/overview/workspace-address',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '/workspaces/*/accounting/*/card-reconciliation/account': '/workspaces/$1/accounting/$2/card-reconciliation/account-reconciliation-settings',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '/flag/*/*': '/r/$1/flag/$1/$2',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '/home-page': '/home',
};

export default oldRoutes;
