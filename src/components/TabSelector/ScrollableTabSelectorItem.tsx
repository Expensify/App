import React, {useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, Platform} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';
import type {TabSelectorItemProps} from './types';

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

function ScrollableTabSelectorItem({
    icon,
    title = '',
    onPress = () => {},
    backgroundColor = '',
    activeOpacity = 0,
    inactiveOpacity = 1,
    isActive = false,
    shouldShowLabelWhenInactive = true,
    testID,
    equalWidth = false,
    scrollViewRef,
    parentX,
    parentWidth,
}: TabSelectorItemProps & {scrollViewRef: React.RefObject<RNScrollView | null>; parentX: number; parentWidth: number}) {
    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);

    const childRef = useRef<HTMLDivElement | View | null>(null);
    const [x, setX] = useState(0);
    const [width, setWidth] = useState(0);

    const scrollToTab = (animated = true) => {
        if (Platform.OS === 'web' && childRef.current && 'scrollIntoView' in childRef.current) {
            childRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
            return;
        }

        const leftSideCut = parentX > x;
        const rightSideCut = x + width >= parentX + parentWidth - 20;
        if (!leftSideCut && !rightSideCut) {
            return;
        }

        if (rightSideCut) {
            const rightSideCutLength = x + width - (parentWidth + parentX);
            scrollViewRef.current?.scrollTo({x: parentX + rightSideCutLength + 20, animated});
            return;
        }

        scrollViewRef.current?.scrollTo({x: x - 20, animated});
    };

    useEffect(() => {
        if (!parentWidth || !isActive) {
            return;
        }

        scrollToTab(false);
    }, [parentWidth, isActive]);

    return (
        <AnimatedPressableWithFeedback
            ref={childRef}
            accessibilityLabel={title}
            style={[styles.tabSelectorButton, styles.tabBackground(isHovered, isActive, backgroundColor), styles.userSelectNone]}
            wrapperStyle={[equalWidth ? styles.flex1 : styles.flexGrow1]}
            onPress={() => {
                scrollToTab();
                onPress();
            }}
            onWrapperLayout={(event) => {
                setX(event.nativeEvent.layout.x);
                setWidth(event.nativeEvent.layout.width);
            }}
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
