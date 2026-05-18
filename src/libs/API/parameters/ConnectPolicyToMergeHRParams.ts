import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';

type ConnectPolicyToMergeHRParams = {
    /** The ID of the policy to connect */
    policyID: string;

    /** The Merge HR provider slug identifying which HR system to integrate with via merge dev */
    providerSlug: MergeHRProviderSlug;
};

export default ConnectPolicyToMergeHRParams;
