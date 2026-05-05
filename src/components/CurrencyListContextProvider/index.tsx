import React, {createContext, useCallback, useContext, useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import {format} from '@libs/NumberFormatUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import {defaultCurrencyListActionsContextValue, defaultCurrencyListStateContextValue} from './default';
import type {CurrencyListActionsContextType, CurrencyListStateContextType} from './types';

const CurrencyListStateContext = createContext<CurrencyListStateContextType>(defaultCurrencyListStateContextValue);
const CurrencyListActionsContext = createContext<CurrencyListActionsContextType>(defaultCurrencyListActionsContextValue);

function CurrencyListContextProvider({children}: React.PropsWithChildren) {
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const {preferredLocale} = useLocalize();

    const getCurrencySymbol = useCallback(
        (currencyCode: string): string | undefined => {
            return currencyList[currencyCode]?.symbol;
        },
        [currencyList],
    );

    const getCurrencyDecimals = useCallback(
        (currencyCode: string | undefined): number => {
            const decimals = currencyList[currencyCode ?? '']?.decimals;
            return decimals ?? CONST.DEFAULT_CURRENCY_DECIMALS;
        },
        [currencyList],
    );

    const convertToDisplayString = useCallback(
        (amountInCents: number | undefined, currencyCode: string | undefined): string => {
            const decimals = getCurrencyDecimals(currencyCode);
            const convertedAmount = convertToFrontendAmountAsInteger(amountInCents ?? 0, decimals);
            let currencyWithFallback = currencyCode;
            if (!currencyCode) {
                currencyWithFallback = CONST.CURRENCY.USD;
            }
            return format(preferredLocale, convertedAmount, {
                style: 'currency',
                currency: currencyWithFallback,

                // We are forcing the number of decimals because we override the default number of decimals in the backend for some currencies
                // See: https://github.com/Expensify/PHP-Libs/pull/834
                minimumFractionDigits: decimals,
                // For currencies that have decimal places > 2, floor to 2 instead as we don't support more than 2 decimal places.
                maximumFractionDigits: 2,
            });
        },
        [getCurrencyDecimals, preferredLocale],
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
            convertToDisplayString,
        }),
        [getCurrencySymbol, getCurrencyDecimals, convertToDisplayString],
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

export {CurrencyListContextProvider, useCurrencyListState, useCurrencyListActions};
export type {CurrencyListActionsContextType, CurrencyListStateContextType} from './types';
