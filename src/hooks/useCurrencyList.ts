import type {CurrencyListActionsContextType, CurrencyListStateContextType} from '@components/CurrencyListContextProvider';
import {CurrencyListActionsContext, CurrencyListStateContext} from '@components/CurrencyListContextProvider';

import {useContext} from 'react';

function useCurrencyListState(): CurrencyListStateContextType {
    return useContext(CurrencyListStateContext);
}

function useCurrencyListActions(): CurrencyListActionsContextType {
    return useContext(CurrencyListActionsContext);
}

export {useCurrencyListState, useCurrencyListActions};
export type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider';
