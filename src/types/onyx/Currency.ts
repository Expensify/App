type Currency = {
    /** Symbol for the currency */
    symbol: string;

    /** Name of the currency */
    name: string;

    /** ISO4217 Code for the currency */
    ISO4217: string;

    /** Number of decimals the currency can have, if this is missing, we assume it has 2 decimals */
    decimals?: number;
};

export default Currency;
