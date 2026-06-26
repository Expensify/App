/** A converted amount keyed by target currency code */
type ConvertedAmountByCurrency = Record<string, number>;

/** A whole-search converted total in a single target currency */
type ConvertedTotal = {
    /** Converted total amount */
    total: number;

    /** Number of transactions the total covers */
    count: number;
};

/** A whole-search converted total keyed by target currency code */
type ConvertedTotalByCurrency = Record<string, ConvertedTotal>;

/** Cache of converted footer-total figures for the Search footer currency picker, populated by GetTransactionsConvertedAmount */
type SearchFooterConversion = {
    /** Per-transaction converted amounts, keyed by transaction ID then by target currency */
    transactions?: Record<string, ConvertedAmountByCurrency>;

    /** Per-report converted totals, keyed by report ID then by target currency */
    reports?: Record<string, ConvertedAmountByCurrency>;

    /** Whole-search converted totals, keyed by search query hash then by target currency */
    searchTotals?: Record<string, ConvertedTotalByCurrency>;
};

export default SearchFooterConversion;
