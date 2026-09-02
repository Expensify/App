import {getOriginalCompanyFeeds} from '@libs/CardUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, ExpensifyCardSettings} from '@src/types/onyx';

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
 * Returns whether the domain has any card feed – an Expensify Card feed OR a company card feed – which makes
 * the domain-group "Card preferred workspace" setting eligible to be enabled. Reads the domain-scoped keys so
 * eligibility stays scoped to feeds owned by this domain and avoids cross-domain false positives.
 */
function useIsDomainUsingCard(domainAccountID: number): boolean {
    const [hasExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`, {
        selector: hasExpensifyCardFeedSelector,
    });
    const [hasCompanyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: hasCompanyCardFeedSelector,
    });

    return !!hasExpensifyCardFeed || !!hasCompanyCardFeed;
}

export default useIsDomainUsingCard;
