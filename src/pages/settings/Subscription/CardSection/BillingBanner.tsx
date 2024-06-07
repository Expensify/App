import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type BillingBannerProps = {
    title: string;
    subtitle: string;
    isError?: boolean;
    shouldShowRedDotIndicator?: boolean;
};

function BillingBanner({title, subtitle, isError, shouldShowRedDotIndicator}: BillingBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.pt4, styles.pb3, styles.ph5, styles.flexRow, styles.gap3, styles.w100, styles.alignItemsCenter, styles.hoveredComponentBG]}>
            <Icon
                src={isError ? Illustrations.CreditCardEyes : Illustrations.CheckmarkCircle}
                width={48}
                height={48}
            />
            <View style={[styles.flex1, styles.justifyContentCenter]}>
                <Text style={[styles.headerText, styles.textLarge]}>{title}</Text>
                <Text style={styles.colorMuted}>{subtitle}</Text>
            </View>
            {isError && shouldShowRedDotIndicator && (
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={theme.danger}
                />
            )}
        </View>
    );
}

BillingBanner.displayName = 'BillingBanner';

export default BillingBanner;
