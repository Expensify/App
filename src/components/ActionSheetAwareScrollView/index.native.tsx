import React, {forwardRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import Reanimated, {useAnimatedStyle, useComposedEventHandler} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewProps} from './types';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';
import useActionSheetKeyboardSpacing from './useActionSheetKeyboardSpacing';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

const ActionSheetAwareScrollView = forwardRef<ScrollView, ActionSheetAwareScrollViewProps>(({style, children, onScroll: onScrollProp, ...restProps}, ref) => {
    const {animatedRef, onRef} = useActionSheetAwareScrollViewRef(ref);

    const spacing = useActionSheetKeyboardSpacing(animatedRef);
    const animatedStyle = useAnimatedStyle(() => ({
        paddingTop: spacing.get(),
    }));

    const {onScroll: onScrollInternal} = usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});
    const onScroll = useComposedEventHandler([onScrollInternal, onScrollProp ?? null]);

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
