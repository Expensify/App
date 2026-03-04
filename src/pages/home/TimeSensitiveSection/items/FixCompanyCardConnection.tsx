import React, {useCallback, useEffect} from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {openPolicyCompanyCardsPage} from '@libs/actions/CompanyCards';
import {getCustomOrFormattedFeedName} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';
import type {CompanyCardFeed} from '@src/types/onyx/CardFeeds';
import FixCompanyCardConnectionSkeleton from './FixCompanyCardConnectionSkeleton';

// Tracks in-flight fundID fetches to prevent duplicate API calls when multiple
// broken cards share the same fundID and mount in the same render cycle.
const pendingFundIDFetches = new Set<string>();

type FixCompanyCardConnectionProps = {
    /** The card with broken connection */
    card: Card;

    /** The policy ID associated with this card */
    policyID: string;

    /** The policy name associated with this card */
    policyName: string;
};

function FixCompanyCardConnection({card, policyID, policyName}: FixCompanyCardConnectionProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Connect']);
    const policy = usePolicy(policyID);

    // Get the card feeds data to access custom nicknames
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${card.fundID}`);

    const fetchCardFeeds = useCallback(() => {
        if (cardFeeds !== undefined || !card.fundID || !policy?.workspaceAccountID) {
            return;
        }

        const domainOrWorkspaceAccountID = Number(card.fundID);
        if (domainOrWorkspaceAccountID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }

        if (pendingFundIDFetches.has(card.fundID)) {
            return;
        }
        pendingFundIDFetches.add(card.fundID);

        const emailList = Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList));
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID, emailList, translate);
    }, [cardFeeds, card.fundID, policy?.workspaceAccountID, policy?.employeeList, policyID, translate]);

    const {isOffline} = useNetwork({
        onReconnect: fetchCardFeeds,
    });

    useEffect(() => {
        if (isOffline) {
            return;
        }
        fetchCardFeeds();
    }, [fetchCardFeeds, isOffline]);

    // Clear deduplication tracking when card feed data arrives so future
    // reconnect retries are not blocked.
    useEffect(() => {
        if (cardFeeds === undefined || !card.fundID) {
            return;
        }
        pendingFundIDFetches.delete(card.fundID);
    }, [cardFeeds, card.fundID]);

    if (!cardFeeds || cardFeeds.isLoading) {
        return <FixCompanyCardConnectionSkeleton />;
    }

    const customFeedName = cardFeeds?.settings?.companyCardNicknames?.[card.bank as CompanyCardFeed];
    const feedName = getCustomOrFormattedFeedName(translate, card.bank as CompanyCardFeed, customFeedName, false) ?? '';
    const subtitle = policyName
        ? translate('homePage.timeSensitiveSection.fixCompanyCardConnection.subtitle', {policyName})
        : translate('homePage.timeSensitiveSection.fixCompanyCardConnection.defaultSubtitle');

    return (
        <BaseWidgetItem
            icon={icons.Connect}
            iconBackgroundColor={colors.tangerine100}
            iconFill={colors.tangerine500}
            title={translate('homePage.timeSensitiveSection.fixCompanyCardConnection.title', {feedName})}
            subtitle={subtitle}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID))}
            buttonProps={{danger: true}}
        />
    );
}

export default FixCompanyCardConnection;
