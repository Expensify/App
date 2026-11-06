type GetWiseQuoteParams = {
    reportID: string;

    /** False prices only the expenses that are not on hold, which is what PayMoneyRequest pays with full = false */
    full: boolean;

    /** The withdrawal account the payment debits. Without one the server quotes the workspace account */
    bankAccountID?: number;
};

export default GetWiseQuoteParams;
