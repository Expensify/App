type ImportCSVTransactionsParams = {
    /** JSON string of the transaction list */
    transactionList: string;

    /** Card ID (0 for new card) */
    cardID: number;

    /** Display name for the card */
    cardName: string;

    /** Currency code (e.g., 'USD') */
    currency: string;

    /** Whether transactions are reimbursable */
    reimbursable: boolean;

    /** Mapping of transaction attributes (amount, merchant, category, date) to column names */
    columnMappings: string;
};

export default ImportCSVTransactionsParams;
