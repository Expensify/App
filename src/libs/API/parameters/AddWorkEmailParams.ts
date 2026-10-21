type AddWorkEmailParams = {
    workEmail: string;

    /** Optimistic action ID for the "add work email" onboarding task, so the CompleteTask Auth forwards reuses it */
    completedTaskReportActionID?: string;
};

export default AddWorkEmailParams;
