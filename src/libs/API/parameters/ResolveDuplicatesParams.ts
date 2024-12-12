type ResolveDuplicatesParams = {
    /** The ID of the transaction that we want to keep */
    transactionID: string;

    /** The list of other duplicated transactions */
    transactionIDList: string[];
    created: string;
    merchant: string;
    amount: number;
    currency: string;
    category: string;
    comment: string;
    billable: boolean;
    reimbursable: boolean;
    tag: string;

    /** The reportActionID of the dismissed violation action in the kept transaction thread report */
    dismissedViolationReportActionID: string;

    /** The ID list of the hold report actions corresponding to the transactionIDList */
    reportActionIDList: string[];
};

export default ResolveDuplicatesParams;
