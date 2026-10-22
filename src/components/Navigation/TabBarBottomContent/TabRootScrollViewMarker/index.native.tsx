import useThemeStyles from '@hooks/useThemeStyles';

import type {ScrollViewProps} from 'react-native';

import React from 'react';
// FlashList's default scroll component is React Native's Animated.ScrollView, not Reanimated's.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import {ScrollViewMarker} from 'react-native-screens/experimental';

import type TabRootScrollViewMarkerProps from './types';

/**
 * A second tap on the focused native tab scrolls the tab's content to the top. Without a marker, react-native-screens
 * scrolls the first scroll view it finds by following each view's first child, which on a screen with a horizontal
 * selector above its list is the selector. The marker has to be the scroll view's direct native parent.
 */
function TabRootScrollViewMarker({children}: TabRootScrollViewMarkerProps) {
    const styles = useThemeStyles();

    return <ScrollViewMarker style={styles.flex1}>{children}</ScrollViewMarker>;
}

/**
 * For a FlashList's `renderScrollComponent`, which replaces the list's own ScrollView rather than wrapping it. It renders
 * the list's default scroll component, Animated.ScrollView. FlashList passes the ref among the props, so it reaches it.
 */
function renderTabRootScrollComponent(props: ScrollViewProps) {
    return (
        <TabRootScrollViewMarker>
            <Animated.ScrollView {...props} />
        </TabRootScrollViewMarker>
    );
}

export default TabRootScrollViewMarker;
export {renderTabRootScrollComponent};
