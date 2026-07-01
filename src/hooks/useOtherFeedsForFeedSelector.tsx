import {Str} from 'expensify-common';
import React from 'react';
import Icon from '@components/Icon';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import type {ListItem} from '@components/SelectionList/types';
import {getVisibleCompanyCardFeedsForSelector} from '@libs/CardFeedUtils';
import {getCardFeedIcon, getCardFeedWithDomainID, getCustomOrFormattedFeedName, getDomainByFundID, getPlaidInstitutionIconUrl} from '@libs/CardUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import useCardFeedErrors from './useCardFeedErrors';
import {useCompanyCardFeedIcons} from './useCompanyCardIcons';
import useCompanyCards from './useCompanyCards';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useFeedKeysWithAssignedCards from './useFeedKeysWithAssignedCards';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useThemeIllustrations from './useThemeIllustrations';
import useThemeStyles from './useThemeStyles';

type CardFeedListItem = ListItem & {
    /** Combined feed key */
    value: CompanyCardFeedWithDomainID;
    /** Card feed value */
    feed: CompanyCardFeedWithNumber;
    /** Feed fund value */
    fundID?: number;
    /** Feed country value */
    country?: string;
};

/**
 * Returns feed list items for card feeds from other workspaces (not the current policy),
 * excluding feeds already linked to the current policy. Used in the workspace company card feed selector.
 */
function useOtherFeedsForFeedSelector(policyID: string): CardFeedListItem[] {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const {feedName: selectedFeedName, companyCardFeeds} = useCompanyCards({policyID});
    const {shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();

    const visibleFeeds = getVisibleCompanyCardFeedsForSelector(allFeeds, translate, feedKeysWithCards, allPolicies, allDomains, currentUserAccountID);

    const getOtherFeeds = () => {
        const otherPolicyFeeds: CardFeedListItem[] = [];
        // `policyID` is stable for this hook invocation, so uppercase it once instead of per feed/linked-policy evaluation.
        const upperPolicyID = policyID.toUpperCase();
        for (const feed of visibleFeeds) {
            // Feeds linked to the active policy are shown as available feeds, not under "From other workspaces".
            // Linked policy IDs can differ in casing, so compare case-insensitively (matches the Expensify-card path).
            if (feed?.linkedPolicyIDs?.filter(Boolean).some((linkedPolicyID) => linkedPolicyID.toUpperCase() === upperPolicyID)) {
                continue;
            }
            // Skip feeds already present in the active policy's available list to avoid duplicate rows across the two lists.
            // `companyCardFeeds` is keyed at runtime by the domain-ID-suffixed feed value (`${feed}${separator}${fundID}`),
            // so a membership check on that value avoids an unsafe assertion to the narrower `CompanyCardFeedWithNumber` key type.
            const feedValueForActivePolicy = getCardFeedWithDomainID(feed.feed, Number(feed.fundID));
            if (companyCardFeeds && feedValueForActivePolicy in companyCardFeeds) {
                continue;
            }
            const feedName = feed.feed;
            const plaidUrl = getPlaidInstitutionIconUrl(feedName);
            // Use the same fundID-aware domain lookup as the visibility logic (`getVisibleCompanyCardFeedsForSelector`)
            // so the domain email resolves even when the domains collection isn't keyed by fundID.
            const domain = getDomainByFundID(allDomains, Number(feed.fundID));
            const firstLinkedPolicyID = feed?.linkedPolicyIDs?.at(0);
            // POLICY collection entries are keyed by uppercase policy IDs, so we uppercase before indexing (matches the Expensify-card path).
            const linkedPolicy = firstLinkedPolicyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${firstLinkedPolicyID.toUpperCase()}`] : undefined;
            const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;
            const shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feed.id];

            otherPolicyFeeds.push({
                value: feed.id as CompanyCardFeedWithDomainID,
                feed: feedName as CompanyCardFeedWithNumber,
                fundID: Number(feed.fundID),
                country: feed?.country,
                alternateText: domainName ?? linkedPolicy?.name ?? firstLinkedPolicyID,
                text: getCustomOrFormattedFeedName(translate, feedName, feed.name),
                // feed.id (`${fundID}_${feed}`) is unique per feed, so a stable key avoids duplicate rows.
                keyForList: feed.id,
                isSelected: feed.id === selectedFeedName,
                brickRoadIndicator: shouldShowRBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                canShowSeveralIndicators: shouldShowRBR,
                leftElement: plaidUrl ? (
                    <PlaidCardFeedIcon
                        plaidUrl={plaidUrl}
                        style={styles.mr3}
                    />
                ) : (
                    <Icon
                        src={getCardFeedIcon(feed.feed, illustrations, companyCardFeedIcons)}
                        height={variables.cardIconHeight}
                        width={variables.cardIconWidth}
                        additionalStyles={[styles.mr3, styles.cardIcon]}
                    />
                ),
            });
        }
        return otherPolicyFeeds;
    };
    return getOtherFeeds();
}

export default useOtherFeedsForFeedSelector;
export type {CardFeedListItem};
