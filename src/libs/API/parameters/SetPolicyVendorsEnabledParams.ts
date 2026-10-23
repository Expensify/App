type SetPolicyVendorsEnabledParams = {
    policyID: string;
    /**
     * Stringified JSON array of vendor IDs, e.g.:
     * string[]
     */
    vendorIDs: string;
    enabled: boolean;
};

export default SetPolicyVendorsEnabledParams;
