import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type ConnectToCampfireFlowProps = {
    policyID: string;
};

function ConnectToCampfireFlow({policyID}: ConnectToCampfireFlowProps) {
    const hasReusablePoliciesConnectedToCampfire = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE, policyID);

    useEffect(() => {
        if (hasReusablePoliciesConnectedToCampfire) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXISTING_CONNECTIONS.getRoute(policyID));
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_SETUP.getRoute(policyID));
        // This needs to run once as we will navigate away
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToCampfireFlow;
