import {createPoliciesSelector} from '@selectors/Policy';
import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import useOnyx from './useOnyx';

type PolicySelector = Pick<Policy, 'id' | 'type' | 'autoReporting'>;

const policySelector = (policy: OnyxEntry<Policy>): PolicySelector =>
    (policy && {
        id: policy.id,
        type: policy.type,
        autoReporting: policy.autoReporting,
    }) as PolicySelector;

const allPoliciesSelector = (policies: OnyxCollection<Policy>) => createPoliciesSelector(policies, policySelector);

function usePersonalPolicy() {
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: allPoliciesSelector, canBeMissing: true});
    const personalPolicy = useMemo(() => Object.values(allPolicies ?? {}).find((policy) => policy?.type === CONST.POLICY.TYPE.PERSONAL), [allPolicies]);
    return personalPolicy;
}

export default usePersonalPolicy;
