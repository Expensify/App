import getAccountingExportRoute from '@libs/Navigation/helpers/getAccountingExportRoute';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';

const POLICY_ID = 'policy123';

describe('getAccountingExportRoute', () => {
    it.each<[ConnectionName, string]>([
        [CONST.POLICY.CONNECTIONS.NAME.QBO, `workspaces/${POLICY_ID}/connections/accounting/quickbooks-online/export`],
        [CONST.POLICY.CONNECTIONS.NAME.XERO, `workspaces/${POLICY_ID}/connections/accounting/xero/export`],
        [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, `workspaces/${POLICY_ID}/connections/accounting/sage-intacct/export`],
        [CONST.POLICY.CONNECTIONS.NAME.NETSUITE, `workspaces/${POLICY_ID}/connections/accounting/connections/netsuite/export`],
        [CONST.POLICY.CONNECTIONS.NAME.QBD, `workspaces/${POLICY_ID}/connections/accounting/quickbooks-desktop/export`],
        [CONST.POLICY.CONNECTIONS.NAME.CERTINIA, `workspaces/${POLICY_ID}/connections/accounting/certinia/export`],
        [CONST.POLICY.CONNECTIONS.NAME.RILLET, ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(POLICY_ID)],
        [CONST.POLICY.CONNECTIONS.NAME.DUALENTRY, ROUTES.POLICY_ACCOUNTING_DUALENTRY_EXPORT.getRoute(POLICY_ID)],
        [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE, ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXPORT.getRoute(POLICY_ID)],
        [CONST.POLICY.CONNECTIONS.NAME.DIGITS, ROUTES.POLICY_ACCOUNTING_DIGITS_EXPORT.getRoute(POLICY_ID)],
        [CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS, ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_EXPORT.getRoute(POLICY_ID)],
        [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL, ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(POLICY_ID)],
    ])('resolves the export settings route for %s', (connectionName, expectedRoute) => {
        // Given a workspace with a specific accounting connection
        // When resolving the accounting export settings route
        const route = getAccountingExportRoute(POLICY_ID, connectionName);

        // Then the route targets that connection's export settings page
        expect(route).toBe(expectedRoute);
    });

    it('falls back to the workspace accounting connections route when connectionName is undefined', () => {
        // Given a workspace with no known accounting connection name
        // When resolving the accounting export settings route
        const route = getAccountingExportRoute(POLICY_ID, undefined);

        // Then it falls back to the workspace accounting connections page
        expect(route).toBe(ROUTES.WORKSPACE_CONNECTIONS_ACCOUNTING.getRoute(POLICY_ID));
    });
});
