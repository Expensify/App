import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';

type CaretWrapperProps = ChildrenProps & {
    style?: StyleProp<ViewStyle>;
};

function CaretWrapper({children, style}: CaretWrapperProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter, style]}>
            {children}
            <Icon
                src={Expensicons.DownArrow}
                fill={theme.icon}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
            />
        </View>
    );
}

export default CaretWrapper;
