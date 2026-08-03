type SubmitReportParams = {
    reportID: string;
    managerAccountID?: number;
    reportActionID: string;
    managerEmail?: string;

    /** New Draft report the held transactions are split onto (mirrors ApproveMoneyRequest). */
    optimisticHoldReportID?: string;

    /** Report-preview action added to the parent chat for the new held report. */
    optimisticHoldActionID?: string;

    /**
     * Stringified JSON of the moved money-request actions, one entry per held transaction:
     * Array<{optimisticReportActionID: string; oldReportActionID: string}>
     */
    optimisticHoldReportExpenseActionIDs?: string;
};

export default SubmitReportParams;
