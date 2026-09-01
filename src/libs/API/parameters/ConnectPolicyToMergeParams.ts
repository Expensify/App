import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';

type ConnectPolicyToMergeParams = {
    /** The ID of the policy to connect */
    policyID: string;

    /** The Merge HR or ATS provider slug identifying which HR or ATS system to integrate with via merge dev */
    integration: MergeHRProviderSlug | MergeATSProviderSlug;
};

export default ConnectPolicyToMergeParams;
