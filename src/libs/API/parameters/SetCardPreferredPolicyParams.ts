type SetCardPreferredPolicyParams = {
    cardID: number;

    /**
     * '' clears the pin,
     * '0' is an explicit None,
     * otherwise a policyID
     */
    preferredPolicyID: string;
};

export default SetCardPreferredPolicyParams;
