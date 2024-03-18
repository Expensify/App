import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type MoneyRequestHeaderStatusBarProps = {
    /** Title displayed in badge */
    title: string;

    /** Banner Description */
    description: string;

    /** Whether we show the border bottom */
    shouldShowBorderBottom: boolean;

    /** Badge background color Style */
    badgeColorStyle?: StyleProp<ViewStyle>;
};

function MoneyRequestHeaderStatusBar({title, description, shouldShowBorderBottom, badgeColorStyle}: MoneyRequestHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const borderBottomStyle = shouldShowBorderBottom ? styles.borderBottom : {};
    const badgeBackgroundColorStyle = badgeColorStyle ?? styles.moneyRequestHeaderStatusBarBadgeBackground;
    const badgeTextColorStyle = badgeColorStyle ? styles.textMicroBoldDangerColor : styles.textMicroBoldColor;

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.overflowHidden, styles.ph5, styles.pb3, borderBottomStyle]}>
            <View style={[styles.moneyRequestHeaderStatusBarBadge, badgeBackgroundColorStyle]}>
                <Text style={[styles.textStrong, styles.textMicroBold, badgeTextColorStyle]}>{title}</Text>
            </View>
            <View style={[styles.flexShrink1]}>
                <Text style={[styles.textLabelSupporting]}>{description}</Text>
            </View>
        </View>
    );
}

MoneyRequestHeaderStatusBar.displayName = 'MoneyRequestHeaderStatusBar';

export default MoneyRequestHeaderStatusBar;
