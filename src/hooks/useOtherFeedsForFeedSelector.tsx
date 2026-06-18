import {Str} from 'expensify-common';
import React from 'react';
import Icon from '@components/Icon';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import type {ListItem} from '@components/SelectionList/types';
import {getVisibleCompanyCardFeedsForSelector} from '@libs/CardFeedUtils';
import {getCardFeedIcon, getCardFeedWithDomainID, getCustomOrFormattedFeedName, getPlaidInstitutionIconUrl} from '@libs/CardUtils';
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
        for (const feed of visibleFeeds) {
            // Feeds linked to the active policy are shown as available feeds, not under "From other workspaces".
            if (feed?.linkedPolicyIDs?.includes(policyID)) {
                continue;
            }
            // Skip feeds already present in the active policy's available list to avoid duplicate rows across the two lists.
            const feedValueForActivePolicy = getCardFeedWithDomainID(feed.feed, Number(feed.fundID)) as CompanyCardFeedWithDomainID;
            if (companyCardFeeds?.[feedValueForActivePolicy as CompanyCardFeedWithNumber]) {
                continue;
            }
            const feedName = feed.feed;
            const plaidUrl = getPlaidInstitutionIconUrl(feedName);
            const domain = allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${feed.fundID}`];
            const firstLinkedPolicyID = feed?.linkedPolicyIDs?.at(0);
            const linkedPolicy = firstLinkedPolicyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${firstLinkedPolicyID}`] : undefined;
            const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;
            const shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feed.id];

            otherPolicyFeeds.push({
                value: feed.id as CompanyCardFeedWithDomainID,
                feed: feedName as CompanyCardFeedWithNumber,
                fundID: Number(feed.fundID),
                country: feed?.country,
                alternateText: domainName ?? linkedPolicy?.name,
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
