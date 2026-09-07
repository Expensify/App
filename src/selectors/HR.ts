/** Selects same-provider Merge HR connections without accounting-specific sync-health restrictions. */
import {isArchivedOrPendingDeletePolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

function isReusableMergeHRPolicy(policy: OnyxEntry<Policy>, currentPolicyID: string): policy is Policy {
    return !!policy && policy.id !== currentPolicyID && policy.role === CONST.POLICY.ROLE.ADMIN && !isArchivedOrPendingDeletePolicy(policy);
}

function reusableMergeHRPoliciesSelector(policies: OnyxCollection<Policy>, currentPolicyID: string, providerSlug: string | undefined): Policy[] {
    if (!providerSlug || !Object.hasOwn(MERGE_HR_PROVIDERS, providerSlug)) {
        return [];
    }

    return Object.values(policies ?? {}).filter(
        (policy): policy is Policy => isReusableMergeHRPolicy(policy, currentPolicyID) && policy.connections?.merge_hris?.config?.integration === providerSlug,
    );
}

/** Returns only provider slugs so unrelated policy updates do not re-render the HR cards. */
function reusableMergeHRProviderSlugsSelector(policies: OnyxCollection<Policy>, currentPolicyID: string): MergeHRProviderSlug[] {
    const providerSlugs = new Set<MergeHRProviderSlug>();
    for (const policy of Object.values(policies ?? {})) {
        if (!isReusableMergeHRPolicy(policy, currentPolicyID)) {
            continue;
        }
        const providerSlug = policy.connections?.merge_hris?.config?.integration;
        if (providerSlug && Object.hasOwn(MERGE_HR_PROVIDERS, providerSlug)) {
            providerSlugs.add(providerSlug);
        }
    }
    return [...providerSlugs].sort();
}

export {reusableMergeHRProviderSlugsSelector};
export default reusableMergeHRPoliciesSelector;
