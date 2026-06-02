import React from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type SpendRulesCurrencyBaseProps = {
    currencies: string[];
    onCurrenciesChange: (currencies: string[]) => void;
};

export default function SpendRulesCurrencyBase({currencies, onCurrenciesChange}: SpendRulesCurrencyBaseProps) {
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST);

    return <></>;
}
