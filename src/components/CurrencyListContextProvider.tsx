import React, {createContext, useCallback, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type CurrencyListContextProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

type CurrencyListContextProps = {
    /** The currency list from Onyx */
    currencyList: CurrencyList;

    /** Function to get currency symbol for a currency(ISO 4217) Code */
    getCurrencySymbol: (currencyCode: string) => string | undefined;
};

const CurrencyListContext = createContext<CurrencyListContextProps>({
    currencyList: getEmptyObject<CurrencyList>(),
    getCurrencySymbol: () => undefined,
});

function CurrencyListContextProvider({children}: CurrencyListContextProviderProps) {
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});

    const getCurrencySymbol = useCallback(
        (currencyCode: string): string | undefined => {
            return currencyList[currencyCode]?.symbol;
        },
        [currencyList],
    );

    const contextValue = useMemo<CurrencyListContextProps>(
        () => ({
            currencyList,
            getCurrencySymbol,
        }),
        [currencyList, getCurrencySymbol],
    );

    return <CurrencyListContext.Provider value={contextValue}>{children}</CurrencyListContext.Provider>;
}

export {CurrencyListContext, CurrencyListContextProvider};

export type {CurrencyListContextProps};
