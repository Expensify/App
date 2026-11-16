// Resolves currency defaults for new Search amount operands without rewriting saved filters.
import type {SearchAmountFilterKeys} from '@components/Search/types';

import {parseAmountFilterValue, supportsAmountFilterCurrency} from '@libs/SearchAmountFilterUtils';

import CONST from '@src/CONST';

import {useState} from 'react';

import useDefaultExpensePolicy from './useDefaultExpensePolicy';

function useAmountFilterCurrency(baseFilterKey: SearchAmountFilterKeys, value?: string) {
    const defaultPolicy = useDefaultExpensePolicy();

    // An empty string keeps Any currency selected. Undefined follows the saved operand or policy default.
    const [selectedCurrency, setCurrency] = useState<string>();
    const savedCurrency = value ? (parseAmountFilterValue(value).currency ?? '') : undefined;
    const currency = supportsAmountFilterCurrency(baseFilterKey) ? (selectedCurrency ?? savedCurrency ?? (defaultPolicy?.outputCurrency || CONST.CURRENCY.USD)) : undefined;

    return {currency, setCurrency};
}

export default useAmountFilterCurrency;
