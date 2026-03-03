import type {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type {CurrencyListActionsContextType, CurrencyListStateContextType} from './types';

const defaultCurrencyListStateContextValue: CurrencyListStateContextType = {
    currencyList: getEmptyObject<CurrencyList>(),
};

const defaultCurrencyListActionsContextValue: CurrencyListActionsContextType = {
    getCurrencySymbol: () => undefined,
    getCurrencyDecimals: () => 2,
};

export {defaultCurrencyListStateContextValue, defaultCurrencyListActionsContextValue};
