import type {CurrencyList} from '@src/types/onyx';

type CurrencyListStateContextType = {
    /** The currency list from Onyx */
    currencyList: CurrencyList;
};

type CurrencyListActionsContextType = {
    /** Function to get currency symbol for a currency(ISO 4217) Code */
    getCurrencySymbol: (currencyCode: string) => string | undefined;

    /** Function to get number of digits after the decimal separator for a specific currency */
    getCurrencyDecimals: (currencyCode: string | undefined) => number;
};

export type {CurrencyListStateContextType, CurrencyListActionsContextType};
