import React, {useEffect} from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
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

    // Fetch card feed data if not available so custom feed names can be resolved
    useEffect(() => {
        if (cardFeeds !== undefined || !card.fundID || !policy?.workspaceAccountID) {
            return;
        }

        const domainOrWorkspaceAccountID = Number(card.fundID);
        if (domainOrWorkspaceAccountID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }

        const emailList = Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList));
        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID, emailList, translate);
    }, [cardFeeds, card.fundID, policy?.workspaceAccountID, policy?.employeeList, policyID, translate]);

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
