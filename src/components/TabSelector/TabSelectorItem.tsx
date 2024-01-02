import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import IconAsset from '@src/types/utils/IconAsset';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';

type TabSelectorItemProps = {
    /** Function to call when onPress */
    onPress?: () => void;

    /** Icon to display on tab */
    icon?: IconAsset;

    /** Title of the tab */
    title?: string;

    /** Animated background color value for the tab button */
    backgroundColor?: string | Animated.AnimatedInterpolation<string>;

    /** Animated opacity value while the tab is in inactive state */
    inactiveOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Animated opacity value while the tab is in active state */
    activeOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Whether this tab is active */
    isActive?: boolean;
};

function TabSelectorItem({icon, title = '', onPress = () => {}, backgroundColor = '', activeOpacity = 0, inactiveOpacity = 1, isActive = false}: TabSelectorItemProps) {
    const styles = useThemeStyles();
    return (
        <PressableWithFeedback
            accessibilityLabel={title}
            style={[styles.tabSelectorButton]}
            wrapperStyle={[styles.flex1]}
            onPress={onPress}
        >
            {({hovered}) => (
                <Animated.View style={[styles.tabSelectorButton, StyleSheet.absoluteFill, styles.tabBackground(hovered, isActive, backgroundColor)]}>
                    <TabIcon
                        icon={icon}
                        activeOpacity={styles.tabOpacity(hovered, isActive, activeOpacity, inactiveOpacity).opacity}
                        inactiveOpacity={styles.tabOpacity(hovered, isActive, inactiveOpacity, activeOpacity).opacity}
                    />
                    <TabLabel
                        title={title}
                        activeOpacity={styles.tabOpacity(hovered, isActive, activeOpacity, inactiveOpacity).opacity}
                        inactiveOpacity={styles.tabOpacity(hovered, isActive, inactiveOpacity, activeOpacity).opacity}
                    />
                </Animated.View>
            )}
        </PressableWithFeedback>
    );
}

TabSelectorItem.displayName = 'TabSelectorItem';

export default TabSelectorItem;
