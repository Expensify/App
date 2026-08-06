type SetWorkspaceDistanceAutoUpdateParams = {
    policyID: string;
    shouldAutoUpdateGovernmentDistanceRates: boolean;

    /** Stringified map of sourceRateID to the customUnitRateID the App generated optimistically, so the server persists the same IDs */
    optimisticRateIDs?: string;
};

export default SetWorkspaceDistanceAutoUpdateParams;
