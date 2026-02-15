import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import useOnyx from './useOnyx';

type PolicySelector = Pick<Policy, 'id' | 'type' | 'autoReporting' | 'outputCurrency'>;

const policySelector = (policy: OnyxEntry<Policy>): PolicySelector =>
    (policy && {
        id: policy.id,
        type: policy.type,
        autoReporting: policy.autoReporting,
        outputCurrency: policy.outputCurrency,
    }) as PolicySelector;

function usePersonalPolicy() {
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const [personalPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`, {selector: policySelector, canBeMissing: true});
    return personalPolicy;
}

export default usePersonalPolicy;
