type SetWorkspaceDistanceAutoUpdateParams = {
    policyID: string;
    shouldAutoUpdateGovernmentDistanceRates: boolean;

    /** Stringified sourceRateID -> optimistic customUnitRateID map, so the server persists the same IDs */
    optimisticRateIDs?: string;

    /** ISO country code an EUR workspace auto-updates government rates for, since the currency is shared by several supported countries */
    countryCode?: string;
};

export default SetWorkspaceDistanceAutoUpdateParams;
