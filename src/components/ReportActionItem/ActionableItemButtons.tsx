import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ActionableItemButtonsProps = {
    children: React.ReactNode;
    layout?: 'horizontal' | 'vertical';
    style?: StyleProp<ViewStyle>;
};

function ActionableItemButtons({children, layout, style}: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const layoutStyle = layout === 'horizontal' ? styles.flexRow : [styles.flexColumn, styles.alignItemsStart];

    return <View style={[styles.gap2, styles.mt2, layoutStyle, style]}>{children}</View>;
}

export default ActionableItemButtons;
