import ONYXKEYS from '@src/ONYXKEYS';
import {reusablePoliciesConnectedToSelector} from '@src/selectors/Policy';
import type {ReusablePolicyConnectionName} from '@src/selectors/Policy';
import useOnyx from './useOnyx';

function useReusablePoliciesConnectedTo(connectionName: ReusablePolicyConnectionName, policyID: string | undefined) {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const reusablePoliciesConnectedTo = reusablePoliciesConnectedToSelector(policies, connectionName, policyID);

    return {
        hasReusablePoliciesConnectedTo: reusablePoliciesConnectedTo.length > 0,
        reusablePoliciesConnectedTo,
    };
}

export default useReusablePoliciesConnectedTo;
