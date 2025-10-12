// The action sheet is only used on native platforms (iOS and Android)
// On all other platforms, the action sheet is implemented using the Animated.ScrollView
import React, {forwardRef} from 'react';
import Reanimated, {useComposedEventHandler} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewHandle, ActionSheetAwareScrollViewProps} from './types';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

const ActionSheetAwareScrollView = forwardRef<ActionSheetAwareScrollViewHandle, ActionSheetAwareScrollViewProps>(({onScroll: onScrollProp, ...restProps}, ref) => {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(ref);

    const {onScroll: onScrollInternal} = usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});
    const onScroll = useComposedEventHandler([onScrollInternal, onScrollProp ?? null]);

    return (
        <Reanimated.ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={onRef}
            onScroll={onScroll}
        >
            {restProps.children}
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

function renderScrollComponent(props: ActionSheetAwareScrollViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
