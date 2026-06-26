/** A converted amount keyed by target currency code */
type ConvertedAmountByCurrency = Record<string, number>;

/** A whole-search converted total keyed by target currency code */
type ConvertedTotalByCurrency = Record<string, {total: number; count: number}>;

/** Cache of converted footer-total figures for the Search footer currency picker, populated by GetTransactionsConvertedAmount */
type SearchFooterConversion = {
    /** Per-transaction converted amounts, keyed by transaction ID then by target currency */
    transactions?: Record<string, ConvertedAmountByCurrency>;

    /** Whole-search converted totals, keyed by search query hash then by target currency */
    searchTotals?: Record<string, ConvertedTotalByCurrency>;
};

export default SearchFooterConversion;
export type {ConvertedAmountByCurrency, ConvertedTotalByCurrency};
