/** Maps transaction attributes to their column names from the CSV */
type ColumnMappings = {
    /** Column name for the transaction amount */
    amount?: string;

    /** Column name for the merchant/description */
    merchant?: string;

    /** Column name for the category */
    category?: string;

    /** Column name for the date */
    date?: string;
};

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

    /** Optional mapping of transaction attributes to column names */
    columnMappings?: string;
};

export default ImportCSVTransactionsParams;
