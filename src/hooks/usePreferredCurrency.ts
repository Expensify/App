import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import {useMemo} from 'react';

import useOnyx from './useOnyx';
import {usePersonalDetail} from './usePersonalDetails';

type PreferredCurrency = ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;

/**
 * Get user's preferred currency in the following order:
 *
 * 1. Payment card currency
 * 2. User's local currency (if it's a valid payment card currency)
 * 3. USD (default currency)
 *
 */
function usePreferredCurrency(): PreferredCurrency {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [currentUserPersonalDetail] = usePersonalDetail(session?.accountID);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);

    const paymentCardCurrency = useMemo(() => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard)?.accountData?.currency, [fundList]);

    if (paymentCardCurrency) {
        return paymentCardCurrency;
    }

    const currentUserLocalCurrency = (currentUserPersonalDetail?.localCurrencyCode ?? CONST.PAYMENT_CARD_CURRENCY.USD) as PreferredCurrency;

    return Object.values(CONST.PAYMENT_CARD_CURRENCY).includes(currentUserLocalCurrency) ? currentUserLocalCurrency : CONST.PAYMENT_CARD_CURRENCY.USD;
}

export default usePreferredCurrency;
export type {PreferredCurrency};
