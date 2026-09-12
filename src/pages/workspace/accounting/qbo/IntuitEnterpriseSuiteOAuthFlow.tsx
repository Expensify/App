import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';

import {openLink} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

type IntuitEnterpriseSuiteOAuthFlowProps = {
    /** ID of the policy whose IES connection is being authorized. */
    policyID: string;

    /** Whether to target the Intuit sandbox environment. */
    isSandbox: boolean;
};

function IntuitEnterpriseSuiteOAuthFlow({policyID, isSandbox}: IntuitEnterpriseSuiteOAuthFlowProps) {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    useEffect(() => {
        openLink(getQuickbooksOnlineSetupLink(policyID, true, isSandbox), environmentURL, false, session);
    }, [environmentURL, isSandbox, policyID, session]);

    return null;
}

export default IntuitEnterpriseSuiteOAuthFlow;
