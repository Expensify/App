type CopyPolicySettingsParams = {
    /** Source policy ID we're copying settings from */
    policyID: string;

    /** CSV list of target policy IDs to copy settings into */
    policyIDList: string;

    /** CSV list of feature keys to copy */
    parts: string;
};

export default CopyPolicySettingsParams;
