type DeletePolicyDistanceRatesParams = {
    policyID: string;
    customUnitID: string;
    customUnitRateID: string[];
    /** JSON-encoded array of auto-selected transaction updates when only one valid value remains. */
    transactionAutoSelections?: string;
};

export default DeletePolicyDistanceRatesParams;
