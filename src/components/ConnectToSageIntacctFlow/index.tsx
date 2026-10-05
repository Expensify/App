import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';

import {getAccountingConnectionsRoute} from '@pages/workspace/connections/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useEffect} from 'react';

type ConnectToSageIntacctFlowProps = {
    policyID: string;
};

function ConnectToSageIntacctFlow({policyID}: ConnectToSageIntacctFlowProps) {
    const hasReusablePoliciesConnectedToSageIntacct = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, policyID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const shouldGoToEnterCredentials = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT);
    const {isBetaEnabled} = usePermissions();

    useEffect(() => {
        if (shouldGoToEnterCredentials) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID));
            return;
        }
        if (!hasReusablePoliciesConnectedToSageIntacct) {
            Navigation.navigate(`${getAccountingConnectionsRoute(isBetaEnabled(CONST.BETAS.UNIFIED_CONNECTIONS), policyID)}/${DYNAMIC_ROUTES.SAGE_INTACCT_PREREQUISITES.path}`);
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.getRoute(policyID));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToSageIntacctFlow;
