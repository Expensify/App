import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import Icon from './Icon';

type CaretWrapperProps = ChildrenProps & {
    style?: StyleProp<ViewStyle>;
    carretWidth?: number;
    carretHeight?: number;
};

function CaretWrapper({children, style, carretWidth, carretHeight}: CaretWrapperProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DownArrow'] as const);

    return (
        <View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter, style]}>
            {children}
            <Icon
                src={expensifyIcons.DownArrow}
                fill={theme.icon}
                width={carretWidth ?? variables.iconSizeExtraSmall}
                height={carretHeight ?? variables.iconSizeExtraSmall}
            />
        </View>
    );
}

export default CaretWrapper;
