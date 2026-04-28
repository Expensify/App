import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasReusablePoliciesConnectedToSelector} from '@src/selectors/Policy';
import type {ReusablePolicyConnectionName} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useHasReusablePoliciesConnectedTo(connectionName: ReusablePolicyConnectionName, policyID: string | undefined) {
    const selector = (policies: OnyxCollection<Policy>) => hasReusablePoliciesConnectedToSelector(policies, connectionName, policyID);
    const [hasReusablePoliciesConnectedTo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    return !!hasReusablePoliciesConnectedTo;
}

export default useHasReusablePoliciesConnectedTo;
