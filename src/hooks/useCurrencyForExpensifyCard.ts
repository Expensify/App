import CONST from '@src/CONST';
import useExpensifyCardUkEuSupported from './useExpensifyCardUkEuSupported';
import usePolicy from './usePolicy';

export default function useCurrencyForExpensifyCard({policyID}: {policyID?: string}) {
    const policy = usePolicy(policyID);
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);

    return isUkEuCurrencySupported ? policy?.outputCurrency : CONST.CURRENCY.USD;
}
