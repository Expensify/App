import React, {useCallback} from 'react';
import Reanimated, {useAnimatedRef, useAnimatedStyle, useComposedEventHandler} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewProps} from './types';
import useActionSheetKeyboardSpacing from './useActionSheetKeyboardSpacing';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

function ActionSheetAwareScrollView({style, children, onScroll: onScrollProp, ref, ...props}: ActionSheetAwareScrollViewProps) {
    const scrollViewAnimatedRef = useAnimatedRef<Reanimated.ScrollView>();

    const onRef = useCallback(
        (assignedRef: Reanimated.ScrollView) => {
            if (typeof ref === 'function') {
                ref(assignedRef);
            } else if (ref) {
                // eslint-disable-next-line no-param-reassign
                ref.current = assignedRef;
            }

            scrollViewAnimatedRef(assignedRef);
        },
        [ref, scrollViewAnimatedRef],
    );

    const spacing = useActionSheetKeyboardSpacing(scrollViewAnimatedRef);
    const animatedStyle = useAnimatedStyle(() => ({
        paddingTop: spacing.get(),
    }));

    const {onScroll: onScrollInternal} = usePreventScrollOnKeyboardInteraction({scrollViewRef: scrollViewAnimatedRef});
    const onScroll = useComposedEventHandler([onScrollInternal, onScrollProp ?? null]);

    return (
        <Reanimated.ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={onRef}
            onScroll={onScroll}
            style={[style, animatedStyle]}
        >
            {children}
        </Reanimated.ScrollView>
    );
}

export default ActionSheetAwareScrollView;

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
const renderScrollComponent = (props: ActionSheetAwareScrollViewProps) => {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
};

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
