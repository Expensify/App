import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getCustomOrFormattedFeedName} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';
import type {CompanyCardFeed} from '@src/types/onyx/CardFeeds';

type FixCompanyCardConnectionProps = {
    /** The card with broken connection */
    card: Card;

    /** The policy ID associated with this card */
    policyID: string;
};

function FixCompanyCardConnection({card, policyID}: FixCompanyCardConnectionProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Connect'] as const);

    // Get the card feeds data to access custom nicknames
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${card.fundID}`, {canBeMissing: true});
    const customFeedName = cardFeeds?.settings?.companyCardNicknames?.[card.bank as CompanyCardFeed];
    const feedName = getCustomOrFormattedFeedName(translate, card.bank as CompanyCardFeed, customFeedName, false) ?? '';

    return (
        <BaseWidgetItem
            icon={icons.Connect}
            iconBackgroundColor={colors.tangerine100}
            iconFill={colors.tangerine700}
            title={translate('homePage.timeSensitiveSection.fixCompanyCardConnection.title', {feedName})}
            subtitle={translate('homePage.timeSensitiveSection.fixCompanyCardConnection.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID))}
            buttonProps={{danger: true}}
        />
    );
}

export default FixCompanyCardConnection;
