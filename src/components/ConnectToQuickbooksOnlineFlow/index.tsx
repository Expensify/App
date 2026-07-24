import useEnvironment from '@hooks/useEnvironment';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';

import {openLink} from '@userActions/Link';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';

import {useEffect} from 'react';

import type {ConnectToQuickbooksOnlineFlowProps} from './types';

function ConnectToQuickbooksOnlineFlow({policyID}: ConnectToQuickbooksOnlineFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        enablePolicyTaxes(policyID, false);
        // On web the setup opens OldDot in a new browser tab. Open it inline here (within the connect click's
        // user-gesture window) instead of navigating to a setup screen, otherwise the popup blocker stops the tab.
        openLink(getQuickbooksOnlineSetupLink(policyID), environmentURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToQuickbooksOnlineFlow;
