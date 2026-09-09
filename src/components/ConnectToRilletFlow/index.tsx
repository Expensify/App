import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type ConnectToRilletFlowProps = {
    policyID: string;
};

function ConnectToRilletFlow({policyID}: ConnectToRilletFlowProps) {
    const hasReusablePoliciesConnectedToRillet = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.RILLET, policyID);

    useEffect(() => {
        if (hasReusablePoliciesConnectedToRillet) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_EXISTING_CONNECTIONS.getRoute(policyID));
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_SETUP.getRoute(policyID));
        // This needs to run once as we will navigate away
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToRilletFlow;
