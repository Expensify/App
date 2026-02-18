import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, StyleSheet, View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type TabLabelProps = {
    /** Title of the tab */
    title?: string;

    /** Animated opacity value while the label is in inactive state */
    inactiveOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Animated opacity value while the label is in active state */
    activeOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Whether an icon is present - used to conditionally apply margin */
    hasIcon?: boolean;
};

function TabLabel({title = '', activeOpacity = 0, inactiveOpacity = 1, hasIcon = false}: TabLabelProps) {
    const styles = useThemeStyles();
    return (
        <View>
            <Animated.View style={[{opacity: activeOpacity}]}>
                <Text style={styles.tabText(true, hasIcon)}>{title}</Text>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, {opacity: inactiveOpacity}]}>
                <Text style={styles.tabText(false, hasIcon)}>{title}</Text>
            </Animated.View>
        </View>
    );
}

export default TabLabel;
