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
    /** The reportActionID of the dismiss violation action of the kept transaction thread report */
    optimisticReportActionID: string;
    /** The list ID of hold report action corresponds to transactionIDList */
    reportActionIDList: string[];
};

export default ResolveDuplicatesParams;
