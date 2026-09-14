type UpdatePolicyAddressParams = {
    policyID: string;
    addressStreet: string;
    addressStreet2: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default UpdatePolicyAddressParams;
