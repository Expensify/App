type PayMoneyRequestOnSearchParams = {
    hash: number;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{reportID: string, amount: number, paymentMethod: string}>
     */
    paymentData: string;
};

export default PayMoneyRequestOnSearchParams;
