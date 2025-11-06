type AddReportApproverParams = {
    /** Expense reportID */
    reportID: string;
    /** Workspace member email */
    newApproverEmail: string;
    /** Action ID for optimistic took control action */
    reportActionID: string;
};

export default AddReportApproverParams;
