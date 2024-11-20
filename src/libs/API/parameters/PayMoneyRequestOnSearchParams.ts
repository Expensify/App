type PayMoneyRequestOnSearchParams = {
    hash: number;
    paymentType: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{reportID: string, amount: number}>
     */
    reportsAndAmounts: string;
};

export default PayMoneyRequestOnSearchParams;
