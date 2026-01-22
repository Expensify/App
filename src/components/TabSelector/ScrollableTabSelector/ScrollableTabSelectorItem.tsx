import React, {useContext, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import TabIcon from '@components/TabSelector/TabIcon';
import TabLabel from '@components/TabSelector/TabLabel';
import type {TabSelectorItemProps} from '@components/TabSelector/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {ScrollableTabSelectorContext} from './ScrollableTabSelectorContext';

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

type ScrollableTabSelectorItemProps = TabSelectorItemProps & {tabKey: string};

function ScrollableTabSelectorItem({
    icon,
    tabKey,
    title = '',
    onPress = () => {},
    backgroundColor = '',
    activeOpacity = 0,
    inactiveOpacity = 1,
    isActive = false,
    shouldShowLabelWhenInactive = true,
    testID,
    equalWidth = false,
}: ScrollableTabSelectorItemProps) {
    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);

    const {onTabLayout, registerTab, scrollToTab} = useContext(ScrollableTabSelectorContext);

    return (
        <AnimatedPressableWithFeedback
            ref={(ref: HTMLDivElement | View | null) => registerTab(tabKey, ref)}
            accessibilityLabel={title}
            style={[styles.tabSelectorButton, styles.tabBackground(isHovered, isActive, backgroundColor), styles.userSelectNone]}
            wrapperStyle={[equalWidth ? styles.flex1 : styles.flexGrow1]}
            onPress={() => {
                scrollToTab(tabKey);
                onPress();
            }}
            onWrapperLayout={(event) => onTabLayout(tabKey, event)}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            role={CONST.ROLE.BUTTON}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            testID={testID}
        >
            <TabIcon
                icon={icon}
                activeOpacity={styles.tabOpacity(isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                inactiveOpacity={styles.tabOpacity(isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
            />
            {(shouldShowLabelWhenInactive || isActive) && (
                <TabLabel
                    title={title}
                    activeOpacity={styles.tabOpacity(isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                    inactiveOpacity={styles.tabOpacity(isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
                    hasIcon={!!icon}
                />
            )}
        </AnimatedPressableWithFeedback>
    );
}

export default ScrollableTabSelectorItem;
