import React, {useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getBackgroundColor from './getBackground';
import getOpacity from './getOpacity';
import ScrollableTabSelectorItem from './ScrollableTabSelectorItem';
import type {TabSelectorBaseProps} from './types';

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

    const scrollViewRef = useRef<RNScrollView>(null);

    const [parentX, setParentX] = useState(0);
    const [parentWidth, setParentWidth] = useState(0);

    return (
        <ScrollView
            onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                setParentWidth(width);
            }}
            scrollEventThrottle={16}
            onScroll={(event) => {
                const x = event.nativeEvent.contentOffset.x;
                setParentX(x);
            }}
            ref={scrollViewRef}
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
                        icon={tab.icon}
                        title={tab.title}
                        onPress={handlePress}
                        activeOpacity={activeOpacity}
                        inactiveOpacity={inactiveOpacity}
                        backgroundColor={backgroundColor}
                        isActive={isActive}
                        scrollViewRef={scrollViewRef}
                        testID={tab.testID}
                        shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
                        equalWidth={equalWidth}
                        parentX={parentX}
                        parentWidth={parentWidth}
                    />
                );
            })}
        </ScrollView>
    );
}

ScrollableTabSelectorBase.displayName = 'ScrollableTabSelectorBase';

export default ScrollableTabSelectorBase;
