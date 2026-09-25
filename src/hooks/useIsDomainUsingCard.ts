import {getOriginalCompanyFeeds} from '@libs/CardUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, ExpensifyCardSettings} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

function hasExpensifyCardFeedSelector(settings: OnyxEntry<ExpensifyCardSettings>): boolean {
    return !!settings;
}

function hasCompanyCardFeedSelector(cardFeeds: OnyxEntry<CardFeeds>): boolean {
    // Called without feedKeysWithCards on purpose: a connected feed with no assigned cards yet still qualifies.
    return Object.keys(getOriginalCompanyFeeds(cardFeeds)).length > 0;
}

/**
 * Returns whether the domain has any card feed, either an Expensify Card feed or a company card feed, which makes
 * the domain-group "Card preferred workspace" setting eligible to be enabled. Reads the domain-scoped keys so
 * eligibility stays scoped to feeds owned by this domain and avoids cross-domain false positives.
 *
 * `isLoading` is true until both reads resolve, so callers can keep the toggle disabled without showing the
 * "no card feed" error while the domain data is still loading (otherwise a domain that does have a feed would
 * briefly render as locked on a cold load).
 */
function useIsDomainUsingCard(domainAccountID: number): {isDomainUsingCard: boolean; isLoading: boolean} {
    const [hasExpensifyCardFeed, hasExpensifyCardFeedMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`, {
        selector: hasExpensifyCardFeedSelector,
    });
    const [hasCompanyCardFeed, hasCompanyCardFeedMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: hasCompanyCardFeedSelector,
    });

    const isLoading = isLoadingOnyxValue(hasExpensifyCardFeedMetadata, hasCompanyCardFeedMetadata);

    return {isDomainUsingCard: !!hasExpensifyCardFeed || !!hasCompanyCardFeed, isLoading};
}

export default useIsDomainUsingCard;
