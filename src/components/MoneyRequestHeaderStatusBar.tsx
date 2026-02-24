import type {ReactElement, ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type MoneyRequestHeaderStatusBarProps = {
    /** Icon displayed in badge */
    icon: ReactNode;

    /** Banner Description */
    description: string | ReactElement;

    /** Whether we style flex grow */
    shouldStyleFlexGrow?: boolean;
};

function MoneyRequestHeaderStatusBar({icon, description, shouldStyleFlexGrow = true}: MoneyRequestHeaderStatusBarProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, shouldStyleFlexGrow && styles.flexGrow1, styles.overflowHidden, styles.headerStatusBarContainer]}>
            <View style={styles.mr2}>{icon}</View>
            <View style={[styles.flexShrink1]}>
                <Text style={[styles.textLabelSupporting]}>{description}</Text>
            </View>
        </View>
    );
}

export default MoneyRequestHeaderStatusBar;

export type {MoneyRequestHeaderStatusBarProps};
