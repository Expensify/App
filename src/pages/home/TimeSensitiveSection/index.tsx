import React from 'react';
import {View} from 'react-native';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import useTimeSensitiveCards from './hooks/useTimeSensitiveCards';
import useTimeSensitiveOffers from './hooks/useTimeSensitiveOffers';
import ActivateCard from './items/ActivateCard';
import AddShippingAddress from './items/AddShippingAddress';
import Offer25off from './items/Offer25off';
import Offer50off from './items/Offer50off';
import ReviewCardFraud from './items/ReviewCardFraud';

function TimeSensitiveSection() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {shouldShow50off, shouldShow25off, firstDayFreeTrial, discountInfo} = useTimeSensitiveOffers();
    const {shouldShowAddShippingAddress, shouldShowActivateCard, shouldShowReviewCardFraud, cardsNeedingShippingAddress, cardsNeedingActivation, cardsWithFraud} = useTimeSensitiveCards();

    const hasAnyItemToShow = shouldShowReviewCardFraud || shouldShow50off || shouldShow25off || shouldShowAddShippingAddress || shouldShowActivateCard;

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
                {/* Priority order: 1. Fraud, 2. Discounts, 3. Shipping, 4. Activation */}
                {shouldShowReviewCardFraud &&
                    cardsWithFraud.map((card) => (
                        <ReviewCardFraud
                            key={card.cardID}
                            card={card}
                        />
                    ))}
                {shouldShow50off && <Offer50off firstDayFreeTrial={firstDayFreeTrial} />}
                {shouldShow25off && !!discountInfo && <Offer25off days={discountInfo.days} />}
                {shouldShowAddShippingAddress &&
                    cardsNeedingShippingAddress.map((card) => (
                        <AddShippingAddress
                            key={card.cardID}
                            card={card}
                        />
                    ))}
                {shouldShowActivateCard &&
                    cardsNeedingActivation.map((card) => (
                        <ActivateCard
                            key={card.cardID}
                            card={card}
                        />
                    ))}
            </View>
        </WidgetContainer>
    );
}

export default TimeSensitiveSection;
