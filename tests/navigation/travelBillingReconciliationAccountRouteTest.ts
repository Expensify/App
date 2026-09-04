import {getRouteParamForConnection} from '@libs/AccountingUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import RECONCILIATION_ACCOUNT_SETTINGS_TYPE from '@pages/workspace/accounting/reconciliation/constants';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

const POLICY_ID = '1234567890123456';
const ACCOUNTING_PATH = ROUTES.POLICY_ACCOUNTING.getRoute(POLICY_ID);

function getFocusedRouteName(state: PartialState<NavigationState>): string | undefined {
    let current: PartialState<NavigationState> | undefined = state;
    let name: string | undefined;

    while (current?.routes) {
        const nextRoute = current.routes.at(current.index ?? current.routes.length - 1);
        name = nextRoute?.name;
        current = nextRoute?.state;
    }

    return name;
}

describe('travel billing reconciliation account route', () => {
    it.each([
        [CONST.POLICY.CONNECTIONS.NAME.QBO, ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_BILLING_CONFIGURATION.getRoute(POLICY_ID) as string],
        [CONST.POLICY.CONNECTIONS.NAME.NETSUITE, ROUTES.POLICY_ACCOUNTING_NETSUITE_TRAVEL_BILLING_CONFIGURATION.getRoute(POLICY_ID) as string],
        [
            CONST.POLICY.CONNECTIONS.NAME.XERO,
            `${ACCOUNTING_PATH}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.path}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_TRAVEL_BILLING_CONFIGURATION.path}`,
        ],
        [
            CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
            `${ACCOUNTING_PATH}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TRAVEL_BILLING_CONFIGURATION.path}`,
        ],
    ])('opens from the %s travel invoicing page', (connectionName, travelBillingPath) => {
        const url = createDynamicRoute(
            `${DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.path}?connection=${getRouteParamForConnection(connectionName)}&reconciliationAccountSettingsType=${
                RECONCILIATION_ACCOUNT_SETTINGS_TYPE.TRAVEL_BILLING
            }`,
            travelBillingPath,
        );

        expect(getFocusedRouteName(getStateFromPath(url))).toBe(SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_RECONCILIATION_ACCOUNT_SETTINGS);
    });
});
