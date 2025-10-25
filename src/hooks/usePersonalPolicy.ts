import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useOnyx from './useOnyx';

type PolicySelector = Pick<Policy, 'id' | 'type' | 'autoReporting'>;

const policySelector = (policy: OnyxEntry<Policy>): PolicySelector =>
    (policy && {
        id: policy.id,
        type: policy.type,
        autoReporting: policy.autoReporting,
    }) as PolicySelector;

function usePersonalPolicy() {
    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (c) => mapOnyxCollectionItems(c, policySelector), canBeMissing: true});
    const personalPolicy = useMemo(() => Object.values(allPolicies ?? {}).find((policy) => policy?.type === CONST.POLICY.TYPE.PERSONAL), [allPolicies]);
    return personalPolicy;
}

export default usePersonalPolicy;
