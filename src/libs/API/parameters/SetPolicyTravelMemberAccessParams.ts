type SetPolicyTravelMemberAccessParams = {
    policyID: string;

    /** Comma-separated accountIDs of the members to update. Supports individual and bulk updates. */
    employeeAccountIDList: string;

    /** True lets the members book travel, false stops them from opening Expensify Travel. */
    enabled: boolean;
};

export default SetPolicyTravelMemberAccessParams;
