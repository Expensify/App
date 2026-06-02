// The action sheet is only used on native platforms (iOS and Android)
// On all other platforms, the action sheet is implemented using the Animated.ScrollView
import React from 'react';
import Reanimated from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import {Actions, ActionSheetAwareScrollViewProvider, useActionSheetAwareScrollViewActions, useActionSheetAwareScrollViewState} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent} from './types';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';

function ActionSheetAwareScrollView({children, ref, ...restProps}: ActionSheetAwareScrollViewProps) {
    const {onRef} = useActionSheetAwareScrollViewRef(ref);
    const styles = useThemeStyles();

    return (
        <Reanimated.ScrollView
            {...restProps}
            // On web, FlashList feeds this scroll view's content width back into its layout. When the vertical
            // scrollbar appears/disappears, the width oscillates by the scrollbar size, retriggering layout in a
            // loop until React throws "Maximum update depth exceeded" and crashes. Reserving the scrollbar gutter
            // keeps the content width stable and breaks the loop.
            style={[restProps.style, styles.scrollbarGutterStable]}
            ref={onRef}
        >
            {children}
        </Reanimated.ScrollView>
    );
}

/**
 * The bottom spacing config for this action sheet is only used on Android and iOS. On other platforms,
 * this component will be a default Reanimated.ScrollView, because the onScroll handler used is from Reanimated.
 *
 * This function should be used as renderScrollComponent prop for FlatList
 * @param {Object} props - props that will be passed to the ScrollView from FlatList
 * @returns {React.ReactElement} - ActionSheetAwareScrollView
 */

const renderScrollComponent: RenderActionSheetAwareScrollViewComponent = (props) => {
    return <ActionSheetAwareScrollView {...props} />;
};

export {renderScrollComponent, ActionSheetAwareScrollViewProvider, Actions, useActionSheetAwareScrollViewState, useActionSheetAwareScrollViewActions};
