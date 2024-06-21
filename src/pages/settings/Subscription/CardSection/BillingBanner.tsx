import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type BillingBannerProps = {
    title?: string;
    subtitle?: string;
    isError?: boolean;
    shouldShowRedDotIndicator?: boolean;
    shouldShowGreenDotIndicator?: boolean;
    isTrialActive?: boolean;
};

function BillingBanner({title, subtitle, isError, shouldShowRedDotIndicator, shouldShowGreenDotIndicator, isTrialActive}: BillingBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const backgroundStyle = isTrialActive ? styles.trialBannerBackgroundColor : styles.hoveredComponentBG;

    const subtitleStyle = isTrialActive ? [] : styles.textSupporting;

    return (
        <View style={[styles.pv4, styles.ph5, styles.flexRow, styles.gap3, styles.w100, styles.alignItemsCenter, backgroundStyle]}>
            <Icon
                src={isError ? Illustrations.CreditCardEyes : Illustrations.CheckmarkCircle}
                width={variables.menuIconSize}
                height={variables.menuIconSize}
            />
            <View style={[styles.flex1, styles.justifyContentCenter]}>
                {title && <Text style={[styles.textStrong]}>{title}</Text>}
                {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
            </View>
            {isError && shouldShowRedDotIndicator && (
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={theme.danger}
                />
            )}
            {!isError && shouldShowGreenDotIndicator && (
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={theme.success}
                />
            )}
        </View>
    );
}

BillingBanner.displayName = 'BillingBanner';

export default BillingBanner;
