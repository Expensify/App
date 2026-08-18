import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import type {ConnectToQuickbooksOnlineFlowProps} from './types';

import BaseConnectToQuickbooksOnlineFlow from './BaseConnectToQuickbooksOnlineFlow';

function ConnectToQuickbooksOnlineFlow({policyID, isIntuitEnterpriseSuite}: ConnectToQuickbooksOnlineFlowProps) {
    return (
        <BaseConnectToQuickbooksOnlineFlow
            policyID={policyID}
            isIntuitEnterpriseSuite={isIntuitEnterpriseSuite}
            onConnect={(isSandbox) => {
                // On native the setup opens in an in-app WebView.
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_SETUP.getRoute(policyID, isIntuitEnterpriseSuite, isSandbox));
            }}
        />
    );
}

export default ConnectToQuickbooksOnlineFlow;
