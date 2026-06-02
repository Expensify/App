import {useCurrencyListState} from '@hooks/useCurrencyList';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type SpendRulesCurrencyBaseProps = {};

export default function SpendRulesCurrencyBase({}: SpendRulesCurrencyBaseProps) {
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST);

    return <></>;
}
