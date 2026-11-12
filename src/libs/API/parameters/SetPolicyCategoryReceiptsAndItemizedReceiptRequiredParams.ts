type SetPolicyCategoryReceiptsAndItemizedReceiptRequiredParams = {
    policyID: string;
    categoryName: string;
    maxExpenseAmountNoReceipt: number;
    maxExpenseAmountNoItemizedReceipt: number;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyCategoryReceiptsAndItemizedReceiptRequiredParams;
