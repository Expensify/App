import React, {useEffect, useMemo, useState} from 'react';
import ScrollView from '@components/ScrollView';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
// eslint-disable-next-line no-restricted-imports
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import getBackgroundColor from './getBackground';
import getOpacity from './getOpacity';
import {useTabSelectorActions, useTabSelectorState} from './TabSelectorContext';
import TabSelectorItem from './TabSelectorItem';
import type {TabSelectorBaseProps, TabSelectorItemProps} from './types';

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
    shouldShowProductTrainingTooltip = false,
    renderProductTrainingTooltip,
    renderItem,
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
            contentContainerStyle={styles.tabSelectorContentContainer}
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

                const itemProps: TabSelectorItemProps = {
                    tabKey: tab.key,
                    icon: tab.icon,
                    title: tab.title,
                    onPress: handlePress,
                    onLongPress: onLongTabPress ? () => onLongTabPress(tab.key) : undefined,
                    activeOpacity,
                    inactiveOpacity,
                    backgroundColor,
                    isActive,
                    testID: tab.testID,
                    sentryLabel: tab.sentryLabel,
                    shouldShowLabelWhenInactive,
                    shouldShowProductTrainingTooltip,
                    renderProductTrainingTooltip,
                    equalWidth,
                    badgeText: tab.badgeText,
                    pendingAction: tab.pendingAction,
                    isDisabled: tab.isDisabled,
                };

                return renderItem ? (
                    <React.Fragment key={tab.key}>{renderItem(tab, itemProps)}</React.Fragment>
                ) : (
                    <TabSelectorItem
                        key={tab.key}
                        tabKey={itemProps.tabKey}
                        icon={itemProps.icon}
                        title={itemProps.title}
                        onPress={itemProps.onPress}
                        onLongPress={itemProps.onLongPress}
                        activeOpacity={itemProps.activeOpacity}
                        inactiveOpacity={itemProps.inactiveOpacity}
                        backgroundColor={itemProps.backgroundColor}
                        isActive={itemProps.isActive}
                        testID={itemProps.testID}
                        sentryLabel={itemProps.sentryLabel}
                        shouldShowLabelWhenInactive={itemProps.shouldShowLabelWhenInactive}
                        shouldShowProductTrainingTooltip={itemProps.shouldShowProductTrainingTooltip}
                        renderProductTrainingTooltip={itemProps.renderProductTrainingTooltip}
                        equalWidth={itemProps.equalWidth}
                        badgeText={itemProps.badgeText}
                        pendingAction={itemProps.pendingAction}
                        isDisabled={itemProps.isDisabled}
                    />
                );
            })}
        </ScrollView>
    );
}

TabSelectorBase.displayName = 'TabSelectorBase';

export default TabSelectorBase;
