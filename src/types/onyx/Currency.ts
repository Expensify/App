/** Model of currency */
type Currency = {
    symbol: string;

    name: string;

    /** ISO4217 Code for the currency */
    ISO4217: string;

    /** Number of decimals the currency can have, if this is missing, we assume it has 2 decimals */
    decimals?: number;

    retired?: boolean;

    retirementDate?: string;

    cacheBurst?: number;

    /** Countries based on ISO4217 code */
    countries?: string[];
};

/** Record of currencies, index by currency code */
type CurrencyList = Record<string, Currency | null>;

export default Currency;
export type {CurrencyList};
