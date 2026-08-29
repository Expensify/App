import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ActionableItemButtonsProps = {
    /** The buttons to lay out */
    children: React.ReactNode;

    /** Whether the buttons are laid out in a row or stacked in a column */
    layout?: 'horizontal' | 'vertical';

    /** Additional styles to apply to the container */
    style?: StyleProp<ViewStyle>;
};

function ActionableItemButtons({children, layout, style}: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const layoutStyle = layout === 'horizontal' ? styles.flexRow : [styles.flexColumn, styles.alignItemsStart];

    return <View style={[styles.gap2, styles.mt2, layoutStyle, style]}>{children}</View>;
}

export default ActionableItemButtons;
