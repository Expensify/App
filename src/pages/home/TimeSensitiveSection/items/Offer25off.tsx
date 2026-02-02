import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type Offer25offProps = {
    days: number;
};

function Offer25off({days}: Offer25offProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['TreasureChest'] as const);

    const subtitle = translate('homePage.timeSensitiveSection.offer25off.subtitle', {days});

    return (
        <BaseWidgetItem
            icon={icons.TreasureChest}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.offer25off.title')}
            subtitle={subtitle}
            ctaText={translate('homePage.timeSensitiveSection.cta')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(ROUTES.HOME))}
        />
    );
}

export default Offer25off;
