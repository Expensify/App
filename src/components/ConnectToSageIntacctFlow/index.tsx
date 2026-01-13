import {useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import {isAuthenticationError} from '@libs/actions/connections';
import {getAdminPoliciesConnectedToSageIntacct} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type ConnectToSageIntacctFlowProps = {
    policyID: string;
};

function ConnectToSageIntacctFlow({policyID}: ConnectToSageIntacctFlowProps) {
    const hasPoliciesConnectedToSageIntacct = !!getAdminPoliciesConnectedToSageIntacct().length;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const shouldGoToEnterCredentials = isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT);

    useEffect(() => {
        if (shouldGoToEnterCredentials) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID));
            return;
        }
        if (!hasPoliciesConnectedToSageIntacct) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.getRoute(policyID));
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToSageIntacctFlow;
