type GetWiseQuoteParams = {
    reportID: string;

    /** False when the admin pays only the expenses that are not on hold, so Wise prices that amount */
    full: boolean;
};

export default GetWiseQuoteParams;
