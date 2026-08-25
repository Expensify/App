type SelectIntuitEnterpriseSuiteEntityParams = {
    /** ID of the policy whose active IES entity is being changed. */
    policyID: string;

    /** Realm ID of the Intuit company being selected as the active entity. */
    realmId: string;
};

export default SelectIntuitEnterpriseSuiteEntityParams;
