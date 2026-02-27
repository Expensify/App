type PayMoneyRequestOnSearchParams = {
    hash: number;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{reportID: string, amount: number, paymentType: string}>
     */
    paymentData: string;
};

export default PayMoneyRequestOnSearchParams;
