import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type PreferredCurrency = ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;

/**
 * Get user's preferred currency in the following order:
 *
 * 1. Default card currency
 * 2. User's local currency (if it's a valid payment card currency)
 * 3. USD (default currency)
 *
 */
function usePreferredCurrency(): PreferredCurrency {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);

    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.isDefault), [fundList]);

    if (defaultCard?.accountData?.currency) {
        return defaultCard?.accountData?.currency;
    }

    if (!session?.accountID) {
        return CONST.PAYMENT_CARD_CURRENCY.USD;
    }

    const currentUserLocalCurrency = (personalDetails?.[session.accountID]?.localCurrencyCode ?? CONST.PAYMENT_CARD_CURRENCY.USD) as PreferredCurrency;

    if (!Object.values(CONST.PAYMENT_CARD_CURRENCY).includes(currentUserLocalCurrency)) {
        return CONST.PAYMENT_CARD_CURRENCY.USD;
    }

    return currentUserLocalCurrency;
}

export default usePreferredCurrency;
