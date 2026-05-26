import {Str} from 'expensify-common';
import React from 'react';
import Icon from '@components/Icon';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import type {ListItem} from '@components/SelectionList/types';
import {getCardFeedIcon, getCustomOrFormattedFeedName, getPlaidInstitutionIconUrl} from '@libs/CardUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import useCardFeedErrors from './useCardFeedErrors';
import useCardFeedsForActivePolicies from './useCardFeedsForActivePolicies';
import {useCompanyCardFeedIcons} from './useCompanyCardIcons';
import useCompanyCards from './useCompanyCards';
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
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {cardFeedsByPolicy} = useCardFeedsForActivePolicies();
    const {feedName: selectedFeedName} = useCompanyCards({policyID});
    const {shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();

    const getOtherFeeds = () => {
        const otherPolicyFeeds: CardFeedListItem[] = [];
        for (const [feedPolicyID, cardFeeds] of Object.entries(cardFeedsByPolicy ?? {})) {
            for (const feed of cardFeeds) {
                if (feed?.linkedPolicyIDs?.includes(policyID)) {
                    continue;
                }
                const feedName = feed.feed;
                const plaidUrl = getPlaidInstitutionIconUrl(feedName);
                const domain = allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${feed.fundID}`];
                const feedPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${feed?.linkedPolicyIDs?.[0] ?? feedPolicyID}`];
                const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;
                const shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feed.id];

                otherPolicyFeeds.push({
                    value: feed.id as CompanyCardFeedWithDomainID,
                    feed: feedName as CompanyCardFeedWithNumber,
                    fundID: Number(feed.fundID),
                    country: feed?.country,
                    alternateText: domainName ?? feedPolicy?.name,
                    text: getCustomOrFormattedFeedName(translate, feedName, feed.name),
                    // Composite key so rows stay distinct if the same feed id appears under multiple policies
                    keyForList: `${feedPolicyID}_${feed.id}`,
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
        }
        return otherPolicyFeeds;
    };
    return getOtherFeeds();
}

export default useOtherFeedsForFeedSelector;
export type {CardFeedListItem};
