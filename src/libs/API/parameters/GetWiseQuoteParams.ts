type GetWiseQuoteParams = {
    reportID: string;

    /** False when the admin pays only the expenses that are not on hold, so Wise prices that amount */
    full: boolean;

    /** The account the admin pays from, which Wise prices the transfer for */
    bankAccountID: number;
};

export default GetWiseQuoteParams;
