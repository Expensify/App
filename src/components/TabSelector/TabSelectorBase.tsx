import React, {useContext, useEffect, useMemo, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import CONST from '@src/CONST';
import ScrollView from '@components/ScrollView';
import getBackgroundColor from './getBackground';
import getOpacity from './getOpacity';
import TabSelectorItem from './TabSelectorItem';
import type {TabSelectorBaseProps} from './types';
import {TabSelectorContext} from './TabSelectorContext';

const MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;

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
    position,
    shouldShowLabelWhenInactive = true,
    equalWidth = false,
    shouldShowProductTrainingTooltip = false,
    renderProductTrainingTooltip,
}: TabSelectorBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const routesLength = tabs.length;

    const defaultAffectedAnimatedTabs = useMemo(() => Array.from({length: routesLength}, (_v, i) => i), [routesLength]);
    const [affectedAnimatedTabs, setAffectedAnimatedTabs] = useState(defaultAffectedAnimatedTabs);

    const {containerRef, onContainerLayout, onContainerScroll} = useContext(TabSelectorContext);
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
            scrollEventThrottle={MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
            onLayout={onContainerLayout}
            onScroll={(e) => {
                onContainerScroll(e);
                triggerScrollEvent();
            }}
            ref={containerRef}
            style={styles.scrollableTabSelector}
            contentContainerStyle={{
                flexGrow: 1,
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
                    <TabSelectorItem
                        tabKey={tab.key}
                        key={tab.key}
                        icon={tab.icon}
                        title={tab.title}
                        onPress={handlePress}
                        activeOpacity={activeOpacity}
                        inactiveOpacity={inactiveOpacity}
                        backgroundColor={backgroundColor}
                        isActive={isActive}
                        testID={tab.testID}
                        sentryLabel={tab.sentryLabel}
                        shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                        shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
                        renderProductTrainingTooltip={renderProductTrainingTooltip}
                        equalWidth={equalWidth}
                    />
                );
            })}
        </ScrollView>
    );
}

TabSelectorBase.displayName = 'TabSelectorBase';

export default TabSelectorBase;
