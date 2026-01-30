import React from 'react';
import {View} from 'react-native';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ActivateCard from './items/ActivateCard';
import AddShippingAddress from './items/AddShippingAddress';
import Offer25off from './items/Offer25off';
import Offer50off from './items/Offer50off';
import useTimeSensitiveCards from './hooks/useTimeSensitiveCards';
import useTimeSensitiveOffers from './hooks/useTimeSensitiveOffers';

function TimeSensitiveSection() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {shouldShow50off, shouldShow25off, firstDayFreeTrial, discountInfo} = useTimeSensitiveOffers();
    const {shouldShowAddShippingAddress, shouldShowActivateCard, cardsNeedingShippingAddress, cardsNeedingActivation} = useTimeSensitiveCards();

    const hasAnyItemToShow = shouldShow50off || shouldShow25off || shouldShowAddShippingAddress || shouldShowActivateCard;

    if (!hasAnyItemToShow) {
        return null;
    }

    return (
        <WidgetContainer
            icon={icons.Stopwatch}
            iconWidth={variables.iconSizeNormal}
            iconHeight={variables.iconSizeNormal}
            iconFill={theme.danger}
            title={translate('homePage.timeSensitiveSection.title')}
            titleColor={theme.danger}
        >
            <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
                {shouldShow50off && <Offer50off firstDayFreeTrial={firstDayFreeTrial} />}
                {shouldShow25off && !!discountInfo && <Offer25off days={discountInfo.days} />}
                {shouldShowAddShippingAddress && cardsNeedingShippingAddress.map((card) => <AddShippingAddress key={card.cardID} card={card} />)}
                {shouldShowActivateCard && cardsNeedingActivation.map((card) => <ActivateCard key={card.cardID} card={card} />)}
            </View>
        </WidgetContainer>
    );
}

export default TimeSensitiveSection;
