type ImportCSVTransactionsParams = {
    /** JSON string of the transaction list */
    transactionList: string;

    /** Card ID - passed as string to avoid JS number precision loss with 64-bit integers */
    cardID: string;

    /** Display name for the card */
    cardName: string;

    /** Currency code (e.g., 'USD') */
    currency: string;

    /** Whether transactions are reimbursable */
    reimbursable: boolean;
};

export default ImportCSVTransactionsParams;
