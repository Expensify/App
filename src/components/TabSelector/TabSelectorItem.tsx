import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import {SrcProps} from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';

type TabSelectorItemProps = {
    /** Function to call when onPress */
    onPress?: () => void;

    /** Icon to display on tab */
    icon?: (props: SrcProps) => React.ReactNode;

    /** Title of the tab */
    title?: string;

    /** Animated background color value for the tab button */
    backgroundColor?: string | Animated.AnimatedInterpolation<string>;

    /** Animated opacity value while the label is inactive state */
    inactiveOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Animated opacity value while the label is in active state */
    activeOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Whether this tab is active */
    isFocused?: boolean;
};

function TabSelectorItem({icon, title = '', onPress = () => {}, backgroundColor = '', activeOpacity = 0, inactiveOpacity = 1, isFocused = false}: TabSelectorItemProps) {
    const styles = useThemeStyles();
    return (
        <PressableWithFeedback
            accessibilityLabel={title}
            style={[styles.tabSelectorButton]}
            wrapperStyle={[styles.flex1]}
            onPress={onPress}
        >
            {({hovered}) => (
                <Animated.View style={[styles.tabSelectorButton, StyleSheet.absoluteFill, styles.tabBackground(hovered, isFocused, backgroundColor)]}>
                    <TabIcon
                        icon={icon}
                        activeOpacity={styles.tabOpacity(hovered, isFocused, activeOpacity, inactiveOpacity).opacity}
                        inactiveOpacity={styles.tabOpacity(hovered, isFocused, inactiveOpacity, activeOpacity).opacity}
                    />
                    <TabLabel
                        title={title}
                        activeOpacity={styles.tabOpacity(hovered, isFocused, activeOpacity, inactiveOpacity).opacity}
                        inactiveOpacity={styles.tabOpacity(hovered, isFocused, inactiveOpacity, activeOpacity).opacity}
                    />
                </Animated.View>
            )}
        </PressableWithFeedback>
    );
}

TabSelectorItem.displayName = 'TabSelectorItem';

export default TabSelectorItem;
