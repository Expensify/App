import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';

import {openLink} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';

import type {ConnectToQuickbooksOnlineFlowProps} from './types';

import BaseConnectToQuickbooksOnlineFlow from './BaseConnectToQuickbooksOnlineFlow';

function ConnectToQuickbooksOnlineFlow({policyID, isIntuitEnterpriseSuite, isSandbox}: ConnectToQuickbooksOnlineFlowProps) {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    return (
        <BaseConnectToQuickbooksOnlineFlow
            policyID={policyID}
            isIntuitEnterpriseSuite={isIntuitEnterpriseSuite}
            isSandbox={isSandbox}
            onConnect={(shouldConnectToSandbox) => {
                // On web the setup opens OldDot in a new browser tab.
                openLink(getQuickbooksOnlineSetupLink(policyID, isIntuitEnterpriseSuite, shouldConnectToSandbox), environmentURL, false, session);
            }}
        />
    );
}

export default ConnectToQuickbooksOnlineFlow;
