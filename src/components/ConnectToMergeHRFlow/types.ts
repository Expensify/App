import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';

type ConnectToMergeHRFlowProps = {
    /** The ID of the policy to connect to Merge HR */
    policyID: string;

    /** The Merge HR provider slug identifying which HR system to integrate with */
    integration: MergeHRProviderSlug;
};

export default ConnectToMergeHRFlowProps;
