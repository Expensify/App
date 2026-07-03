import ScrollView from '@components/ScrollView';

import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useEffect, useMemo, useState} from 'react';

import type {TabSelectorBaseProps} from './types';

import getBackgroundColor from './getBackground';
import getOpacity from './getOpacity';
import {useTabSelectorActions, useTabSelectorState} from './TabSelectorContext';
import TabSelectorItem from './TabSelectorItem';

/**
 * Navigation-agnostic tab selector UI that renders a row of TabSelectorItem components.
 *
 * This component owns the shared layout, width/position measurements, and animation helpers
 * (getOpacity / getBackgroundColor). It is reused by both navigation-based TabSelector and
 * inline tab selectors like SplitExpensePage.
 */
function TabSelectorBase({
    tabs,
    activeTabKey,
    onTabPress = () => {},
    onLongTabPress,
    onActiveTabPress = () => {},
    position,
    shouldShowLabelWhenInactive = true,
    equalWidth = false,
    contentContainerStyles,
}: TabSelectorBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const routesLength = tabs.length;

    const defaultAffectedAnimatedTabs = useMemo(() => Array.from({length: routesLength}, (_v, i) => i), [routesLength]);
    const [affectedAnimatedTabs, setAffectedAnimatedTabs] = useState(defaultAffectedAnimatedTabs);

    const {containerRef} = useTabSelectorState();
    const {onContainerLayout, onContainerScroll} = useTabSelectorActions();
    const triggerScrollEvent = useScrollEventEmitter();

    const activeIndex = tabs.findIndex((tab) => tab.key === activeTabKey);

    // After a tab change, reset affectedAnimatedTabs once the transition is done so
    // tabs settle back into the default animated state.
    useEffect(() => {
        const timerID = setTimeout(() => {
            setAffectedAnimatedTabs(defaultAffectedAnimatedTabs);
        }, CONST.ANIMATED_TRANSITION);

        return () => clearTimeout(timerID);
    }, [defaultAffectedAnimatedTabs, activeIndex]);

    return (
        <ScrollView
            scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
            onLayout={onContainerLayout}
            onScroll={(e) => {
                onContainerScroll(e);
                triggerScrollEvent();
            }}
            ref={containerRef}
            style={styles.scrollableTabSelector}
            // On iOS a horizontal ScrollView lays out its content along an unbounded main axis, so flex-1 tabs
            // (equalWidth) divide their intrinsic content width instead of the viewport. Giving the content
            // container a definite width lets the flex children split it evenly. Scoped to equalWidth so normal
            // overflowing/scrollable tab rows are not constrained.
            contentContainerStyle={[styles.tabSelectorContentContainer, equalWidth && styles.w100, contentContainerStyles]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                        onActiveTabPress(tab.key);
                        return;
                    }
                    setAffectedAnimatedTabs([activeIndex, index]);
                    onTabPress(tab.key);
                };

                return (
                    <TabSelectorItem
                        tabKey={tab.key}
                        key={tab.key}
                        icon={tab.icon}
                        title={tab.title}
                        onPress={handlePress}
                        onLongPress={onLongTabPress ? () => onLongTabPress(tab.key) : undefined}
                        activeOpacity={activeOpacity}
                        inactiveOpacity={inactiveOpacity}
                        backgroundColor={backgroundColor}
                        isActive={isActive}
                        testID={tab.testID}
                        sentryLabel={tab.sentryLabel}
                        shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                        equalWidth={equalWidth}
                        badgeText={tab.badgeText}
                        isBadgeCondensed={tab.isBadgeCondensed}
                        badgeStyles={tab.badgeStyles}
                        pendingAction={tab.pendingAction}
                        isDisabled={tab.isDisabled}
                    />
                );
            })}
        </ScrollView>
    );
}

TabSelectorBase.displayName = 'TabSelectorBase';

export default TabSelectorBase;
