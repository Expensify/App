import {useContext} from 'react';
import type {CurrencyListContextProps} from '@components/CurrencyListContextProvider';
import {CurrencyListContext} from '@components/CurrencyListContextProvider';

export default function useCurrencyList(): CurrencyListContextProps {
    return useContext(CurrencyListContext);
}
