type SetPolicyCommuterExclusionsParams = {
    policyID: string;
    /**
     * Exclusion method - currently only "fixedDistance" is supported. R2 will add "homeAndOffice".
     * Named `commuterExclusionMethod` (not `method`) because the Web-Expensify WAF restricts the
     * plain `method` parameter to payment values; see Web-Expensify/_inputrules.php.
     */
    commuterExclusionMethod: string;
    /** Distance to exclude per claim. Must be > 0 when commuterExclusionMethod is "fixedDistance". */
    distance: number;
};

export default SetPolicyCommuterExclusionsParams;
