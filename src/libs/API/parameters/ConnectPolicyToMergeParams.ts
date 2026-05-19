import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';

type ConnectPolicyToMergeParams = {
    /** The ID of the policy to connect */
    policyID: string;

    /** The Merge HR provider slug identifying which HR system to integrate with via merge dev */
    integration: MergeHRProviderSlug;
};

export default ConnectPolicyToMergeParams;
