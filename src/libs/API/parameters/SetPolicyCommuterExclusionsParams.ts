type SetPolicyCommuterExclusionsParams = {
    policyID: string;
    /**
     * Exclusion method - either "fixedDistance" or "homeAndOffice".
     * Named `commuterExclusionMethod` (not `method`) because the Web-Expensify WAF restricts the
     * plain `method` parameter to payment values.
     */
    commuterExclusionMethod: string;
    /** Distance to exclude per claim. Required and > 0 when commuterExclusionMethod is "fixedDistance"; omitted for "homeAndOffice". */
    distance?: number;
};

export default SetPolicyCommuterExclusionsParams;
