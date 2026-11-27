import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';

/** Returns the decimals and symbol of a currency for the amount form adapters */
function useAmountFormCurrency(currency: string, decimalsOverride?: number) {
    const {preferredLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();

    return {
        decimals: decimalsOverride ?? getCurrencyDecimals(currency),
        symbol: getLocalizedCurrencySymbol(preferredLocale, currency) ?? '',
    };
}

export default useAmountFormCurrency;
