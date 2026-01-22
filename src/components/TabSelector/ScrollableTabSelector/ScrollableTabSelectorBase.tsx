import React, {useContext, useState} from 'react';
import ScrollView from '@components/ScrollView';
import getBackgroundColor from '@components/TabSelector/getBackground';
import getOpacity from '@components/TabSelector/getOpacity';
import type {TabSelectorBaseProps} from '@components/TabSelector/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {ScrollableTabSelectorContext} from './ScrollableTabSelectorContext';
import ScrollableTabSelectorItem from './ScrollableTabSelectorItem';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

/**
 * Navigation-agnostic tab selector UI that renders a row of ScrollableTabSelectorItem components.
 *
 * This component owns the shared layout, width/position measurements, and animation helpers
 * (getOpacity / getBackgroundColor). It is reused by both navigation-based TabSelector and
 * inline tab selectors like SplitExpensePage.
 */
function ScrollableTabSelectorBase({tabs, activeTabKey, onTabPress = () => {}, position, shouldShowLabelWhenInactive = true, equalWidth = false}: TabSelectorBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const routesLength = tabs.length;

    const defaultAffectedAnimatedTabs = Array.from({length: routesLength}, (_v, i) => i);
    const [affectedAnimatedTabs, setAffectedAnimatedTabs] = useState(defaultAffectedAnimatedTabs);

    const activeIndex = tabs.findIndex((tab) => tab.key === activeTabKey);

    const {containerRef, onContainerLayout, onContainerScroll} = useContext(ScrollableTabSelectorContext);

    return (
        <ScrollView
            scrollEventThrottle={MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
            onLayout={onContainerLayout}
            onScroll={onContainerScroll}
            ref={containerRef}
            style={styles.scrollableTabSelector}
            contentContainerStyle={{
                paddingBottom: 12,
                paddingHorizontal: 20,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            {tabs.map((tab, index) => {
                const isActive = index === activeIndex;
                const activeOpacity = getOpacity({
                    routesLength,
                    tabIndex: index,
                    active: true,
                    affectedTabs: affectedAnimatedTabs,
                    position,
                    isActive,
                });
                const inactiveOpacity = getOpacity({
                    routesLength,
                    tabIndex: index,
                    active: false,
                    affectedTabs: affectedAnimatedTabs,
                    position,
                    isActive,
                });
                const backgroundColor = getBackgroundColor({
                    routesLength,
                    tabIndex: index,
                    affectedTabs: affectedAnimatedTabs,
                    theme,
                    position,
                    isActive,
                });

                const handlePress = () => {
                    if (isActive) {
                        return;
                    }

                    setAffectedAnimatedTabs([activeIndex, index]);
                    onTabPress(tab.key);
                };

                return (
                    <ScrollableTabSelectorItem
                        key={tab.key}
                        tabKey={tab.key}
                        icon={tab.icon}
                        title={tab.title}
                        onPress={handlePress}
                        activeOpacity={activeOpacity}
                        inactiveOpacity={inactiveOpacity}
                        backgroundColor={backgroundColor}
                        isActive={isActive}
                        testID={tab.testID}
                        shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                        equalWidth={equalWidth}
                    />
                );
            })}
        </ScrollView>
    );
}

ScrollableTabSelectorBase.displayName = 'ScrollableTabSelectorBase';

export default ScrollableTabSelectorBase;
