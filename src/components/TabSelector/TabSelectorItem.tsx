import React, {useState} from 'react';
import {Animated} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

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
    const [isHovered, setIsHovered] = useState(false);

    return (
        <AnimatedPressableWithFeedback
            accessibilityLabel={title}
            style={[styles.tabSelectorButton, styles.tabBackground(isHovered, isActive, backgroundColor), styles.userSelectNone]}
            wrapperStyle={[styles.flex1]}
            onPress={onPress}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            role={CONST.ROLE.BUTTON}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            <TabIcon
                icon={icon}
                activeOpacity={styles.tabOpacity(isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                inactiveOpacity={styles.tabOpacity(isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
            />
            <TabLabel
                title={title}
                activeOpacity={styles.tabOpacity(isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                inactiveOpacity={styles.tabOpacity(isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
            />
        </AnimatedPressableWithFeedback>
    );
}

TabSelectorItem.displayName = 'TabSelectorItem';

export default TabSelectorItem;
