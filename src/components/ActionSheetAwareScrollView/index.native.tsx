import React, {forwardRef, useCallback} from 'react';
// eslint-disable-next-line no-restricted-imports
import Reanimated, {useAnimatedRef, useAnimatedStyle} from 'react-native-reanimated';
import type {AnimatedScrollView} from 'react-native-reanimated/lib/typescript/component/ScrollView';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewProps} from './types';
import useActionSheetKeyboardSpacing from './useActionSheetKeyboardSpacing';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

const ActionSheetAwareScrollView = forwardRef<AnimatedScrollView, ActionSheetAwareScrollViewProps>(({style, children, onScroll: onScrollProp, ...props}, ref) => {
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

    const {onScroll} = usePreventScrollOnKeyboardInteraction({scrollViewRef: scrollViewAnimatedRef, onScroll: onScrollProp});

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
});

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
