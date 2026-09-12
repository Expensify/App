import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';

import {openLink} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ConnectToQuickbooksOnlineFlowProps} from './types';

import BaseConnectToQuickbooksOnlineFlow from './BaseConnectToQuickbooksOnlineFlow';

function ConnectToQuickbooksOnlineFlow({policyID, isIntuitEnterpriseSuite}: ConnectToQuickbooksOnlineFlowProps) {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    return (
        <BaseConnectToQuickbooksOnlineFlow
            policyID={policyID}
            isIntuitEnterpriseSuite={isIntuitEnterpriseSuite}
            onConnect={(isSandbox) => {
                // On web the setup opens OldDot in a new browser tab.
                openLink(getQuickbooksOnlineSetupLink(policyID, isIntuitEnterpriseSuite, isSandbox), environmentURL, false, session);
            }}
        />
    );
}

export default ConnectToQuickbooksOnlineFlow;
