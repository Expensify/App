import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactElement, ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import CaretWrapper from './CaretWrapper';
import Text from './Text';

type MoneyRequestHeaderStatusBarProps = {
    /** Icon displayed in badge */
    icon: ReactNode;

    /** Banner Description */
    description: string | ReactElement;

    shouldStyleFlexGrow?: boolean;

    /** Shows a chevron after the description, for a bar that opens the report history */
    shouldShowCaret?: boolean;
};

function MoneyRequestHeaderStatusBar({icon, description, shouldStyleFlexGrow = true, shouldShowCaret = false}: MoneyRequestHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const message = (
        <View style={[styles.flexShrink1]}>
            <Text style={[styles.textLabelSupporting]}>{description}</Text>
        </View>
    );

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, shouldStyleFlexGrow && styles.flexGrow1, styles.overflowHidden, styles.headerStatusBarContainer]}>
            <View style={styles.mr2}>{icon}</View>
            {shouldShowCaret ? <CaretWrapper style={styles.flexShrink1}>{message}</CaretWrapper> : message}
        </View>
    );
}

export default MoneyRequestHeaderStatusBar;

export type {MoneyRequestHeaderStatusBarProps};
