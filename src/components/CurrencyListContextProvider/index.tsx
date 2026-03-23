import React, {createContext, useCallback, useContext, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import {setCurrentCurrencyList} from '@libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import {defaultCurrencyListActionsContextValue, defaultCurrencyListStateContextValue} from './default';
import type {CurrencyListActionsContextType, CurrencyListStateContextType} from './types';

const CurrencyListStateContext = createContext<CurrencyListStateContextType>(defaultCurrencyListStateContextValue);
const CurrencyListActionsContext = createContext<CurrencyListActionsContextType>(defaultCurrencyListActionsContextValue);

function CurrencyListContextProvider({children}: React.PropsWithChildren) {
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST);

    // Keep the shared formatter fallback in sync for callers that have not been migrated
    // to receive currencyList explicitly yet.
    setCurrentCurrencyList(currencyList);

    const getCurrencySymbol = useCallback(
        (currencyCode: string): string | undefined => {
            return currencyList[currencyCode.toUpperCase()]?.symbol;
        },
        [currencyList],
    );

    const getCurrencyDecimals = useCallback(
        (currencyCode: string | undefined): number => {
            const decimals = currencyList[currencyCode?.toUpperCase() ?? '']?.decimals;
            return decimals ?? 2;
        },
        [currencyList],
    );

    const stateValue = useMemo<CurrencyListStateContextType>(
        () => ({
            currencyList,
        }),
        [currencyList],
    );

    const actionsValue = useMemo<CurrencyListActionsContextType>(
        () => ({
            getCurrencySymbol,
            getCurrencyDecimals,
        }),
        [getCurrencySymbol, getCurrencyDecimals],
    );

    return (
        <CurrencyListStateContext.Provider value={stateValue}>
            <CurrencyListActionsContext.Provider value={actionsValue}>{children}</CurrencyListActionsContext.Provider>
        </CurrencyListStateContext.Provider>
    );
}

function useCurrencyListState(): CurrencyListStateContextType {
    return useContext(CurrencyListStateContext);
}

function useCurrencyListActions(): CurrencyListActionsContextType {
    return useContext(CurrencyListActionsContext);
}

export {CurrencyListContextProvider, CurrencyListStateContext, CurrencyListActionsContext, useCurrencyListState, useCurrencyListActions};
export type {CurrencyListActionsContextType, CurrencyListStateContextType} from './types';
