import useOnyx from '@hooks/useOnyx';

import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type ConnectToBusinessCentralFlowProps = {
    policyID: string;
};

function ConnectToBusinessCentralFlow({policyID}: ConnectToBusinessCentralFlowProps) {
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const hasAuthenticationError = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL);

    useEffect(() => {
        // An admin re-entering credentials after an authentication failure has already met the prerequisites
        if (hasAuthenticationError) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_SETUP.getRoute(policyID));
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_PREREQUISITES.getRoute(policyID));
        // This needs to run once as we will navigate away
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToBusinessCentralFlow;
