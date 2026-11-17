type EnableDistanceRequestTaxParams = {
    policyID: string;
    customUnit: string;
    /** Stringified sourceRateID to optimistic customUnitRateID map, so the server persists the same IDs. */
    optimisticRateIDs?: string;
};

export default EnableDistanceRequestTaxParams;
