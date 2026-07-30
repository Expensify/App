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

/**
 * The default-currency source figure a cached conversion was computed from, keyed by target currency code. The
 * footer stamps this when it requests a conversion and compares it to the live snapshot value on every render; a
 * mismatch (e.g. after an inline edit) means the cached conversion is stale and must be fetched again.
 */
type SourceByCurrency = Record<string, number>;

/** Cache of converted footer-total figures for the Search footer currency picker, populated by GetTransactionsConvertedAmount */
type SearchFooterConversion = {
    /** Per-transaction converted amounts, keyed by transaction ID then by target currency */
    transactions?: Record<string, ConvertedAmountByCurrency>;

    /** Per-report converted totals, keyed by report ID then by target currency */
    reports?: Record<string, ConvertedAmountByCurrency>;

    /** Per-group converted totals (grouped searches), keyed by group key then by target currency */
    groups?: Record<string, ConvertedAmountByCurrency>;

    /** Whole-search converted totals, keyed by search query hash then by target currency */
    searchTotals?: Record<string, ConvertedTotalByCurrency>;

    /**
     * Target currencies whose most recent conversion request failed. Set when a `GetTransactionsConvertedAmount` read
     * errors and cleared when a fresh request for that currency is issued; lets the footer drop the loading state and
     * fall back to the default total instead of a skeleton that would never resolve.
     */
    failedCurrencies?: Record<string, boolean>;

    /**
     * Source figures the footer stamps the above conversions against, mirroring their keys (transaction ID / report ID /
     * group key / search hash, then target currency). Compared to the live snapshot to detect stale conversions.
     */
    sources?: {
        /** Source figure each transaction conversion was computed from */
        transactions?: Record<string, SourceByCurrency>;

        /** Source figure each report conversion was computed from */
        reports?: Record<string, SourceByCurrency>;

        /** Source figure each group conversion was computed from */
        groups?: Record<string, SourceByCurrency>;

        /** Source figure each whole-search grand total was computed from */
        searchTotals?: Record<string, SourceByCurrency>;
    };
};

export default SearchFooterConversion;
