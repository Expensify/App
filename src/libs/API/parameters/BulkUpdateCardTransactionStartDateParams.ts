type BulkUpdateCardTransactionStartDateParams = {
    /** JSON-encoded array of card IDs */
    cardIDs: string;

    /** Earliest date to import transactions from, or an empty string to import from the beginning */
    startDate: string;
};

export default BulkUpdateCardTransactionStartDateParams;
