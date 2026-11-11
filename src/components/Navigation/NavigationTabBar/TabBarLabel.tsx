import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type TabBarLabelProps = {
    label: string;
    isSelected: boolean;
    numberOfLines: number;
    style?: StyleProp<ViewStyle>;
};

/** The selected label is bold, so a hidden bold copy reserves its width and the tab keeps the same width selected or not. */
function TabBarLabel({label, isSelected, numberOfLines, style}: TabBarLabelProps) {
    const styles = useThemeStyles();
    const textStyle = [styles.textSmall, styles.textAlignCenter, styles.navigationTabBarLabel];

    return (
        <View style={[styles.flexShrink1, style]}>
            <Text
                numberOfLines={numberOfLines}
                style={[textStyle, isSelected ? styles.textBold : styles.textSupporting]}
            >
                {label}
            </Text>
            <Text
                aria-hidden
                numberOfLines={numberOfLines}
                style={[textStyle, styles.textBold, styles.navigationTabBarLabelBoldPlaceholder]}
            >
                {label}
            </Text>
        </View>
    );
}

export default TabBarLabel;
