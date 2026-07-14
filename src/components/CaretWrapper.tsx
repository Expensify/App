import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';

type CaretWrapperProps = ChildrenProps & {
    style?: StyleProp<ViewStyle>;
    caretWidth?: number;
    caretHeight?: number;
    isActive?: boolean;
};

function CaretWrapper({children, style, caretWidth, caretHeight, isActive = false}: CaretWrapperProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DownArrow']);

    return (
        <View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter, style]}>
            {children}
            <Icon
                src={expensifyIcons.DownArrow}
                fill={theme.icon}
                width={caretWidth ?? variables.iconSizeExtraSmall}
                height={caretHeight ?? variables.iconSizeExtraSmall}
                additionalStyles={isActive ? styles.flipUpsideDown : []}
            />
        </View>
    );
}

export default CaretWrapper;
