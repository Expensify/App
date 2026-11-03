type UpdateWorkspaceGeneralSettingsParams = {
    policyID: string;
    workspaceName: string;
    currency: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;

    /** Country whose government mileage rates to enable for a shared (EUR) currency, applied by the backend in the same command */
    governmentRateCountry?: string;

    /** JSON map of source rate ID to client-side optimistic rate ID, so the backend persists the rates with the same IDs */
    optimisticRateIDs?: string;
};

export default UpdateWorkspaceGeneralSettingsParams;
