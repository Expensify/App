import {getCardOrFeedCurrency} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useExpensifyCardUkEuSupported from './useExpensifyCardUkEuSupported';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

export default function useCurrencyForExpensifyCard({policyID, fundID}: {policyID?: string; fundID?: number}) {
    const policy = usePolicy(policyID);
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);

    // The selected feed can belong to a different policy/domain than the one being viewed
    // (e.g. a US feed linked to a GBP policy), so derive the currency from the feed itself.
    if (fundID && cardSettings) {
        return getCardOrFeedCurrency(undefined, cardSettings);
    }

    // If no fund was provided, then use the policy currency, if available
    if (isUkEuCurrencySupported && policy?.outputCurrency) {
        return policy.outputCurrency;
    }

    // Finally, fall back to USD
    return CONST.CURRENCY.USD;
}
