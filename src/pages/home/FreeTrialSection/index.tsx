import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import type {DiscountInfo} from '@libs/SubscriptionUtils';
import navigateToSubscriptionPayment from '@pages/home/common/navigateToSubscriptionPayment';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import useFreeTrial from './useFreeTrial';
import type {DiscountType} from './useFreeTrial';

const ILLUSTRATION_SIZE = variables.componentSizeNormal;

function getCountdownSubtitle(translate: ReturnType<typeof useLocalize>['translate'], discountType: DiscountType, discountInfo: DiscountInfo | null): string | undefined {
    if (!discountInfo) {
        return undefined;
    }

    if (discountType === 25 && discountInfo.days > 0) {
        return translate('homePage.freeTrialSection.timeRemainingDays', {count: discountInfo.days});
    }

    return translate('homePage.freeTrialSection.timeRemaining', {
        formattedTime: DateUtils.formatCountdownTimer(translate, discountInfo.hours, discountInfo.minutes, discountInfo.seconds),
    });
}

function FreeTrialSection() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['TreasureChest']);
    const {shouldShowFreeTrialSection, discountType, daysLeft, discountInfo} = useFreeTrial();

    if (!shouldShowFreeTrialSection) {
        return null;
    }

    const title = translate('homePage.freeTrialSection.title', {days: daysLeft});

    let bodyText: string;
    let ctaText: string;
    const onCtaPress = navigateToSubscriptionPayment;

    if (discountType === 50) {
        bodyText = translate('homePage.freeTrialSection.offer50Body');
        ctaText = translate('homePage.freeTrialSection.ctaClaim');
    } else if (discountType === 25) {
        bodyText = translate('homePage.freeTrialSection.offer25Body');
        ctaText = translate('homePage.freeTrialSection.ctaClaim');
    } else {
        bodyText = translate('homePage.freeTrialSection.addCardBody');
        ctaText = translate('homePage.freeTrialSection.ctaAdd');
    }

    const countdownSubtitle = getCountdownSubtitle(translate, discountType, discountInfo);

    return (
        <WidgetContainer
            title={title}
            containerStyles={{backgroundColor: theme.trialBannerBackgroundColor}}
        >
            <PressableWithoutFeedback
                accessibilityLabel={bodyText}
                onPress={onCtaPress}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.WIDGET_ITEM}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pb8, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
                    <Icon
                        src={illustrations.TreasureChest}
                        width={ILLUSTRATION_SIZE}
                        height={ILLUSTRATION_SIZE}
                    />
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>
                        <Text style={styles.widgetItemTitle}>{bodyText}</Text>
                        {!!countdownSubtitle && <Text style={[styles.widgetItemSubtitle, {color: theme.trialTimer}]}>{countdownSubtitle}</Text>}
                    </View>
                    <Button
                        text={ctaText}
                        onPress={onCtaPress}
                        small
                        style={styles.widgetItemButton}
                        success
                    />
                </View>
            </PressableWithoutFeedback>
        </WidgetContainer>
    );
}

export default FreeTrialSection;
