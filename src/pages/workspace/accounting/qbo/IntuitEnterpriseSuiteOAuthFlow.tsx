import useEnvironment from '@hooks/useEnvironment';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';

import {openLink} from '@userActions/Link';

import {useEffect} from 'react';

type IntuitEnterpriseSuiteOAuthFlowProps = {
    /** ID of the policy whose IES connection is being authorized. */
    policyID: string;

    /** Whether to target the Intuit sandbox environment. */
    isSandbox: boolean;
};

function IntuitEnterpriseSuiteOAuthFlow({policyID, isSandbox}: IntuitEnterpriseSuiteOAuthFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        openLink(getQuickbooksOnlineSetupLink(policyID, true, isSandbox), environmentURL);
    }, [environmentURL, isSandbox, policyID]);

    return null;
}

export default IntuitEnterpriseSuiteOAuthFlow;
