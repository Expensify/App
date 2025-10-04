import React, {forwardRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {AnimatedRef} from 'react-native-reanimated';
import Reanimated, {useAnimatedRef, useComposedEventHandler} from 'react-native-reanimated';
import type {AnimatedScrollView} from 'react-native-reanimated/lib/typescript/component/ScrollView';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewProps} from './types';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

const ActionSheetAwareScrollView = forwardRef<AnimatedScrollView, ActionSheetAwareScrollViewProps>(({onScroll: onScrollProp, ...props}, forwardedRef) => {
    const fallbackRef = useAnimatedRef<Reanimated.ScrollView>();
    const scrollViewRef = forwardedRef ?? fallbackRef;

    const {onScroll: onScrollInternal} = usePreventScrollOnKeyboardInteraction({scrollViewRef: scrollViewRef as AnimatedRef<Reanimated.ScrollView>});
    const onScroll = useComposedEventHandler([onScrollInternal, onScrollProp ?? null]);

    return (
        <Reanimated.ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={scrollViewRef}
            onScroll={onScroll}
        >
            {props.children}
        </Reanimated.ScrollView>
    );
});

export default ActionSheetAwareScrollView;

/**
 * The bottom spacing config for this action sheet is only used on Android and iOS. On other platforms,
 * this component will be a default Animated.ScrollView, because the onScroll handler used is from Reanimated.
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
