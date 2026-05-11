type CopyPolicySettingsParams = {
    sourcePolicyID: string;

    /** CSV list of target policy IDs to copy settings into */
    policyIDList: string;

    /** CSV list of feature keys to copy */
    parts: string;
};

export default CopyPolicySettingsParams;
