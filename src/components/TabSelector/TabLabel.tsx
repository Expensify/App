import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, StyleSheet, View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type TabLabelProps = {
    /** Title of the tab */
    title?: string;

    /** Animated opacity value while the label is in inactive state */
    inactiveOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Animated opacity value while the label is in active state */
    activeOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Whether an icon is present - used to conditionally apply margin */
    hasIcon?: boolean;

    /** Text style */
    textStyle?: StyleProp<TextStyle>;
};

function TabLabel({title = '', activeOpacity = 0, inactiveOpacity = 1, hasIcon = false, textStyle}: TabLabelProps) {
    const styles = useThemeStyles();
    return (
        <View style={{maxWidth: variables.tabSelectorMaxTabLabelWidth}}>
            <Animated.View style={[{opacity: activeOpacity}]}>
                <Text
                    numberOfLines={1}
                    style={[styles.tabText(true, hasIcon), textStyle]}
                >
                    {title}
                </Text>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, {opacity: inactiveOpacity}]}>
                <Text
                    numberOfLines={1}
                    style={[styles.tabText(false, hasIcon), textStyle]}
                >
                    {title}
                </Text>
            </Animated.View>
        </View>
    );
}

export default TabLabel;
