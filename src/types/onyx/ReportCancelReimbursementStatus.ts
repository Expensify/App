/** Whether the backend can still cancel a report's bank reimbursement, from GetReportCancelReimbursementStatus */
type ReportCancelReimbursementStatus = {
    /** Whether the reimbursement can still be canceled */
    canCancel?: boolean;

    /** Whether the reimbursement is waiting for the credit to post */
    isWaitingForCreditToPost?: boolean;
};

export default ReportCancelReimbursementStatus;
