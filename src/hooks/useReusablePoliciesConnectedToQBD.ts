import ONYXKEYS from '@src/ONYXKEYS';
import {reusablePoliciesConnectedToQBDSelector} from '@src/selectors/Policy';
import useOnyx from './useOnyx';

function useReusablePoliciesConnectedToQBD(policyID: string | undefined) {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [connectionSyncProgressCollection] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const reusablePoliciesConnectedToQBD = reusablePoliciesConnectedToQBDSelector(policies, policyID);

    return {
        connectionSyncProgressCollection,
        hasReusablePoliciesConnectedToQBD: reusablePoliciesConnectedToQBD.length > 0,
        reusablePoliciesConnectedToQBD,
    };
}

export default useReusablePoliciesConnectedToQBD;
