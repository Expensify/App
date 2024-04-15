import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type MoneyRequestHeaderStatusBarProps = {
    /** Title displayed in badge */
    title: string | ReactNode;

    /** Banner Description */
    description: string;

    /** Whether we show the border bottom */
    shouldShowBorderBottom: boolean;
};

function MoneyRequestHeaderStatusBar({title, description, shouldShowBorderBottom}: MoneyRequestHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const borderBottomStyle = shouldShowBorderBottom ? styles.borderBottom : {};
    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.overflowHidden, styles.ph5, styles.pb3, borderBottomStyle]}>
            {typeof title === 'string' ? (
                <View style={[styles.moneyRequestHeaderStatusBarBadge]}>
                    <Text style={[styles.textStrong, styles.textMicroBold]}>{title}</Text>
                </View>
            ) : (
                <View style={styles.mr2}>{title}</View>
            )}
            <View style={[styles.flexShrink1]}>
                <Text style={[styles.textLabelSupporting]}>{description}</Text>
            </View>
        </View>
    );
}

MoneyRequestHeaderStatusBar.displayName = 'MoneyRequestHeaderStatusBar';

export default MoneyRequestHeaderStatusBar;
