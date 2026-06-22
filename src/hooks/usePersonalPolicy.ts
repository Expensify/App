import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import useOnyx from './useOnyx';

type PolicySelector = Pick<Policy, 'id' | 'type' | 'autoReporting' | 'outputCurrency'>;

function computePersonalPolicy(policy: OnyxEntry<Policy>): PolicySelector | undefined {
    if (!policy) {
        return undefined;
    }
    return {
        id: policy.id,
        type: policy.type,
        autoReporting: policy.autoReporting,
        outputCurrency: policy.outputCurrency,
    };
}

function usePersonalPolicy() {
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [personalPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`, {selector: computePersonalPolicy});
    return personalPolicy;
}

export default usePersonalPolicy;
export {computePersonalPolicy};
export type {PolicySelector};
