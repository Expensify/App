import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import {getBankName} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
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
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCardExclamation'] as const);

    const bankName = getBankName(card.bank as CompanyCardFeed);

    return (
        <BaseWidgetItem
            icon={icons.CreditCardExclamation}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.fixCompanyCardConnection.title', {bankName})}
            subtitle={translate('homePage.timeSensitiveSection.fixCompanyCardConnection.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID))}
        />
    );
}

export default FixCompanyCardConnection;
