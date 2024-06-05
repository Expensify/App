import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type PreferredCurrency = {
    name: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;
    symbol?: string;
};

function usePreferredCurrency(): PreferredCurrency {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);

    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.isDefault), [fundList]);

    if (defaultCard?.accountData?.currency) {
        return {
            name: defaultCard?.accountData?.currency,
            symbol: getCurrencySymbol(defaultCard?.accountData?.currency),
        };
    }

    if (!session?.accountID) {
        return {
            name: CONST.PAYMENT_CARD_CURRENCY.USD,
            symbol: getCurrencySymbol(CONST.PAYMENT_CARD_CURRENCY.USD),
        };
    }

    const currentUserLocalCurrency = personalDetails?.[session.accountID]?.localCurrencyCode ?? CONST.PAYMENT_CARD_CURRENCY.USD;

    if (!(Object.values(CONST.PAYMENT_CARD_CURRENCY) as string[]).includes(currentUserLocalCurrency)) {
        return {
            name: CONST.PAYMENT_CARD_CURRENCY.USD,
            symbol: getCurrencySymbol(CONST.PAYMENT_CARD_CURRENCY.USD),
        };
    }

    return {
        name: currentUserLocalCurrency,
        symbol: getCurrencySymbol(currentUserLocalCurrency),
    } as PreferredCurrency;
}

export default usePreferredCurrency;
