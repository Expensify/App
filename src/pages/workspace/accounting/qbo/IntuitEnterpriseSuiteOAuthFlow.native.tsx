import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type IntuitEnterpriseSuiteOAuthFlowProps = {
    /** ID of the policy whose IES connection is being authorized. */
    policyID: string;

    /** Whether to target the Intuit sandbox environment. */
    isSandbox: boolean;
};

function IntuitEnterpriseSuiteOAuthFlow({policyID, isSandbox}: IntuitEnterpriseSuiteOAuthFlowProps) {
    useEffect(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_SETUP.getRoute(policyID, true, isSandbox));
    }, [isSandbox, policyID]);

    return null;
}

export default IntuitEnterpriseSuiteOAuthFlow;
