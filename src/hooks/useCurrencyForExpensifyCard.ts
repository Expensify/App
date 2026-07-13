import type {CardProgramKey} from '@libs/CardUtils';
import {getCardOrFeedCurrency, getCardSettings} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useExpensifyCardUkEuSupported from './useExpensifyCardUkEuSupported';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

// `programKey` is required (not optional) so callers can't silently fall back to the collapsed, US-first currency on a
// feed that also holds a GB program. Pass the selected program (`useSelectedExpensifyCardProgram`) for feed-level currency,
// or the card's own program (`getProgramKeyForCard`) for a specific card.
export default function useCurrencyForExpensifyCard({policyID, fundID, programKey}: {policyID?: string; fundID?: number; programKey: CardProgramKey}) {
    const policy = usePolicy(policyID);
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);

    // The selected feed can belong to a different policy/domain than the one being viewed
    // (e.g. a US feed linked to a GBP policy), so derive the currency from the feed itself.
    // A feed can also hold more than one program (US/GB) — when a program is given, read that program's currency
    // so, for example, the US row shows USD even when a GB program is also provisioned on the same feed.
    if (fundID && cardSettings) {
        const programSettings = getCardSettings(cardSettings, programKey);
        if (programSettings?.currency) {
            return programSettings.currency;
        }
        return getCardOrFeedCurrency(undefined, cardSettings);
    }

    // If no fund was provided, then use the policy currency, if available
    if (isUkEuCurrencySupported && policy?.outputCurrency) {
        return policy.outputCurrency;
    }

    // Finally, fall back to USD
    return CONST.CURRENCY.USD;
}
