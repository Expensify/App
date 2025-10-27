// The action sheet is only used on native platforms (iOS and Android)
// On all other platforms, the action sheet is implemented using the Animated.ScrollView
import React, {forwardRef} from 'react';
import Reanimated from 'react-native-reanimated';
import type {AnimatedScrollViewProps} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewHandle} from './types';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';

const ActionSheetAwareScrollView = forwardRef<ActionSheetAwareScrollViewHandle, AnimatedScrollViewProps>(({children, ...restProps}, forwardedRef) => {
    const {onRef} = useActionSheetAwareScrollViewRef(forwardedRef);

    return (
        <Reanimated.ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={onRef}
        >
            {children}
        </Reanimated.ScrollView>
    );
});

export default ActionSheetAwareScrollView;

/**
 * The bottom spacing config for this action sheet is only used on Android and iOS. On other platforms,
 * this component will be a default Reanimated.ScrollView, because the onScroll handler used is from Reanimated.
 *
 * This function should be used as renderScrollComponent prop for FlatList
 * @param {Object} props - props that will be passed to the ScrollView from FlatList
 * @returns {React.ReactElement} - ActionSheetAwareScrollView
 */

function renderScrollComponent(props: AnimatedScrollViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
