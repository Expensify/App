import React, {forwardRef} from 'react';
import type {ScrollViewProps} from 'react-native';
import Reanimated, {useAnimatedScrollHandler, useAnimatedStyle, useComposedEventHandler} from 'react-native-reanimated';
import transformReanimatedScrollEventToRN from '@libs/transformReanimatedScrollEventToRN';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewHandle} from './types';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';
import useActionSheetKeyboardSpacing from './useActionSheetKeyboardSpacing';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

const ActionSheetAwareScrollView = forwardRef<ActionSheetAwareScrollViewHandle, ScrollViewProps>(({style, children, onScroll: onScrollProp, ...restProps}, forwardedRef) => {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(forwardedRef);

    const spacing = useActionSheetKeyboardSpacing(animatedRef);
    const animatedStyle = useAnimatedStyle(() => ({
        paddingTop: spacing.get(),
    }));

    const animatedScrollHandler = useAnimatedScrollHandler((e) => {
        if (!onScrollProp) {
            return;
        }

        const rnEvent = transformReanimatedScrollEventToRN(e);
        onScrollProp(rnEvent);
    });

    const preventScrollOnKeyboardInteraction = usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});
    const onScroll = useComposedEventHandler([preventScrollOnKeyboardInteraction, animatedScrollHandler]);

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
const renderScrollComponent = (props: ScrollViewProps) => {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
};

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
