import useEnvironment from '@hooks/useEnvironment';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';

import {openLink} from '@userActions/Link';

import type {ConnectToQuickbooksOnlineFlowProps} from './types';

import BaseConnectToQuickbooksOnlineFlow from './BaseConnectToQuickbooksOnlineFlow';

function ConnectToQuickbooksOnlineFlow({policyID, isIntuitEnterpriseSuite}: ConnectToQuickbooksOnlineFlowProps) {
    const {environmentURL} = useEnvironment();

    return (
        <BaseConnectToQuickbooksOnlineFlow
            policyID={policyID}
            isIntuitEnterpriseSuite={isIntuitEnterpriseSuite}
            onConnect={(isSandbox) => {
                // On web the setup opens OldDot in a new browser tab.
                openLink(getQuickbooksOnlineSetupLink(policyID, isIntuitEnterpriseSuite, isSandbox), environmentURL);
            }}
        />
    );
}

export default ConnectToQuickbooksOnlineFlow;
