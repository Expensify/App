import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {DiscountInfo} from '@libs/SubscriptionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type EarlyDiscountProps = {
    /** Live discount information used to render the title (discountType) and the live countdown (hours/minutes/seconds). */
    discountInfo: DiscountInfo;
};

const ICON_SIZE = variables.iconSizeNormal;

function EarlyDiscount({discountInfo}: EarlyDiscountProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch']);

    // Match EarlyDiscountBanner: navigate to Account > Subscription (the page itself)
    // rather than the Add Payment Card screen, so the user lands on the subscription
    // overview where they can claim the discount.
    const onCtaPress = () => {
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute()));
    };

    const title = translate('homePage.timeSensitiveSection.earlyDiscount.title', {discountType: discountInfo.discountType});
    const supportingText = translate('homePage.timeSensitiveSection.earlyDiscount.supportingText', {
        hours: discountInfo.hours,
        minutes: discountInfo.minutes,
        seconds: discountInfo.seconds,
    });

    return (
        <PressableWithoutFeedback
            accessibilityLabel={title}
            onPress={onCtaPress}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.WIDGET_ITEM}
        >
            {({hovered}) => (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv3, shouldUseNarrowLayout ? styles.ph5 : styles.ph8, hovered && styles.hoveredComponentBG]}>
                    <View style={styles.getWidgetItemIconContainerStyle(theme.widgetIconBG)}>
                        <Icon
                            src={icons.Stopwatch}
                            width={ICON_SIZE}
                            height={ICON_SIZE}
                            fill={theme.widgetIconFill}
                        />
                    </View>
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>
                        <Text style={styles.widgetItemTitle}>{title}</Text>
                        <Text style={styles.widgetItemSubtitle}>{supportingText}</Text>
                    </View>
                    <Button
                        text={translate('homePage.timeSensitiveSection.earlyDiscount.cta')}
                        onPress={onCtaPress}
                        small
                        style={styles.widgetItemButton}
                        success
                    />
                </View>
            )}
        </PressableWithoutFeedback>
    );
}

export default EarlyDiscount;
