/**
 * Resolves the accounting export settings route for a given workspace and accounting connection.
 * Falls back to the workspace's Accounting connections page when the connection has no dedicated export route.
 */
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';

import createDynamicRoute from './dynamicRoutesUtils/createDynamicRoute';

function getAccountingExportRoute(policyID: string, connectionName?: ConnectionName): Route {
    const accountingBasePath = ROUTES.WORKSPACE_CONNECTIONS_ACCOUNTING.getRoute(policyID);

    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO:
            return createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.path, accountingBasePath);
        case CONST.POLICY.CONNECTIONS.NAME.XERO:
            return createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.path, accountingBasePath);
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            return createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path, accountingBasePath);
        case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
            return createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.path, accountingBasePath);
        case CONST.POLICY.CONNECTIONS.NAME.QBD:
            return createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.path, accountingBasePath);
        case CONST.POLICY.CONNECTIONS.NAME.CERTINIA:
            return createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_EXPORT.path, accountingBasePath);
        case CONST.POLICY.CONNECTIONS.NAME.RILLET:
            return ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(policyID);
        case CONST.POLICY.CONNECTIONS.NAME.DUALENTRY:
            return ROUTES.POLICY_ACCOUNTING_DUALENTRY_EXPORT.getRoute(policyID);
        case CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE:
            return ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXPORT.getRoute(policyID);
        case CONST.POLICY.CONNECTIONS.NAME.DIGITS:
            return ROUTES.POLICY_ACCOUNTING_DIGITS_EXPORT.getRoute(policyID);
        case CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS:
            return ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_EXPORT.getRoute(policyID);
        case CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL:
            return ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(policyID);
        default:
            return accountingBasePath;
    }
}

export default getAccountingExportRoute;
