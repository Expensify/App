import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';
import useIsResizing from '@hooks/useIsResizing';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import getBackgroundColor from './getBackground';
import getOpacity from './getOpacity';
import TabSelectorItem from './TabSelectorItem';

type TabSelectorBaseItem = {
    /** Stable key for the tab. */
    key: string;

    /** Icon to display on the tab. */
    icon?: IconAsset;

    /** Localized title to display. */
    title: string;

    /** Test identifier used to find elements in tests. */
    testID?: string;
};

type TabSelectorBaseProps = {
    /** Tabs to render. */
    tabs: TabSelectorBaseItem[];

    /** Key of the currently active tab. */
    activeTabKey: string;

    /** Called when a tab is pressed with its key. */
    onTabPress?: (key: string) => void;

    /** Animated position from a navigator (optional). */
    position?: Animated.AnimatedInterpolation<number>;

    /** Whether to show the label when the tab is inactive. */
    shouldShowLabelWhenInactive?: boolean;

    /** Whether tabs should have equal width. */
    equalWidth?: boolean;

    /** Determines whether the product training tooltip should be displayed to the user. */
    shouldShowProductTrainingTooltip?: boolean;

    /** Function to render the content of the product training tooltip. */
    renderProductTrainingTooltip?: () => React.JSX.Element;
};

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
    const isResizing = useIsResizing();

    const routesLength = tabs.length;

    const defaultAffectedAnimatedTabs = Array.from({length: routesLength}, (_v, i) => i);
    const [affectedAnimatedTabs, setAffectedAnimatedTabs] = useState(defaultAffectedAnimatedTabs);
    const viewRef = useRef<View>(null);
    const [selectorWidth, setSelectorWidth] = useState(0);
    const [selectorX, setSelectorX] = useState(0);

    const activeIndex = tabs.findIndex((tab) => tab.key === activeTabKey);

    // After a tab change, reset affectedAnimatedTabs once the transition is done so
    // tabs settle back into the default animated state.
    useEffect(() => {
        const timerID = setTimeout(() => {
            setAffectedAnimatedTabs(defaultAffectedAnimatedTabs);
        }, CONST.ANIMATED_TRANSITION);

        return () => clearTimeout(timerID);
    }, [defaultAffectedAnimatedTabs, activeIndex]);

    const measure = () => {
        viewRef.current?.measureInWindow((x, _y, width) => {
            setSelectorX(x);
            setSelectorWidth(width);
        });
    };

    // Measure location/width after initial mount and when layout animations settle.
    useLayoutEffect(() => {
        const timerID = setTimeout(() => {
            measure();
        }, CONST.TOOLTIP_ANIMATION_DURATION);

        return () => clearTimeout(timerID);
    }, [measure]);

    // Re-measure when resizing ends so tooltips and equal-width layouts stay aligned.
    useEffect(() => {
        if (isResizing) {
            return;
        }
        measure();
    }, [measure, isResizing]);

    return (
        <View
            style={styles.tabSelector}
            ref={viewRef}
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
                        key={tab.key}
                        icon={tab.icon}
                        title={tab.title}
                        onPress={handlePress}
                        activeOpacity={activeOpacity}
                        inactiveOpacity={inactiveOpacity}
                        backgroundColor={backgroundColor}
                        isActive={isActive}
                        testID={tab.testID}
                        shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                        shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
                        renderProductTrainingTooltip={renderProductTrainingTooltip}
                        parentWidth={selectorWidth}
                        parentX={selectorX}
                        equalWidth={equalWidth}
                    />
                );
            })}
        </View>
    );
}

TabSelectorBase.displayName = 'TabSelectorBase';

export default TabSelectorBase;
export type {TabSelectorBaseItem, TabSelectorBaseProps};
