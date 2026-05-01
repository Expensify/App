import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';

type CardDetailsActionButtonsProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

function CardDetailsActionButtons({children, style}: CardDetailsActionButtonsProps) {
    const styles = useThemeStyles();

    return (
        <View
            style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph5, styles.pt2, styles.mb6, styles.gap2, styles.alignSelfStretch, style]}
        >
            {children}
        </View>
    );
}

export default CardDetailsActionButtons;
