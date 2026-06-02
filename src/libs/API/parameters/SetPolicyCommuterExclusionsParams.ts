type SetPolicyCommuterExclusionsParams = {
    policyID: string;
    /** Exclusion method - currently only "fixedDistance" is supported. R2 will add "homeAndOffice". */
    method: string;
    /** Distance to exclude per claim. Must be > 0 when method is "fixedDistance". */
    distance: number;
};

export default SetPolicyCommuterExclusionsParams;
