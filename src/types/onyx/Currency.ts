/** Model of currency */
type Currency = {
    /** Symbol for the currency */
    symbol: string;

    /** Name of the currency */
    name: string;

    /** ISO4217 Code for the currency */
    ISO4217: string;

    /** Number of decimals the currency can have, if this is missing, we assume it has 2 decimals */
    decimals?: number;

    /** If currency is retired */
    retired?: boolean;

    /** Retirement date of the currency */
    retirementDate?: string;

    /** Cache burst */
    cacheBurst?: number;

    /** Countries based on ISO4217 code */
    countries?: string[];
};

/** Record of currencies, index by currency code */
type CurrencyList = Record<string, Currency | null>;

export default Currency;
export type {CurrencyList};
