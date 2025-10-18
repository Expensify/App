import React, {forwardRef} from 'react';
import Reanimated, {useAnimatedStyle, useComposedEventHandler} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewHandle, ActionSheetAwareScrollViewProps} from './types';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';
import useActionSheetKeyboardSpacing from './useActionSheetKeyboardSpacing';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

const ActionSheetAwareScrollView = forwardRef<ActionSheetAwareScrollViewHandle, ActionSheetAwareScrollViewProps>(({style, children, onScroll: onScrollProp, ...restProps}, forwardedRef) => {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(forwardedRef);

    const spacing = useActionSheetKeyboardSpacing(animatedRef);
    const animatedStyle = useAnimatedStyle(() => ({
        paddingTop: spacing.get(),
    }));

    const preventScrollOnKeyboardInteraction = usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});
    const onScroll = useComposedEventHandler([preventScrollOnKeyboardInteraction, onScrollProp ?? null]);

    return (
        <Reanimated.ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
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
