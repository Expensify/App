type EnablePolicyTaxesParams = {
    policyID: string;
    enabled: boolean;
    taxFields?: string;
    /** Stringified sourceRateID to optimistic customUnitRateID map, so the server persists the same IDs. */
    optimisticRateIDs?: string;
};

export default EnablePolicyTaxesParams;
