type AddReportApproverParams = {
    /** Expense reportID */
    reportID: string;
    /** Workspace memeber email */
    newApproverEmail: string;
    /** Action ID for optimistic took control action */
    reportActionID: string;
};

export default AddReportApproverParams;
