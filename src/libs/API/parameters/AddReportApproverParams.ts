type AddReportApproverParams = {
    /** Expense reportID */
    reportID: string;
    /** Workspace member email */
    newApproverEmail: string;
    /** Action ID for optimistic took control action */
    reportActionID: string;
    /** Whether the new approver replaces the current one instead of being added to the workflow */
    isReassignment?: boolean;
};

export default AddReportApproverParams;
