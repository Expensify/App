type SetWorkspaceDistanceAutoUpdateParams = {
    policyID: string;
    shouldAutoUpdateGovernmentDistanceRates: boolean;

    /** Stringified sourceRateID -> optimistic customUnitRateID map, so the server persists the same IDs */
    optimisticRateIDs?: string;
};

export default SetWorkspaceDistanceAutoUpdateParams;
