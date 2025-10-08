import React, {useCallback} from 'react';
import Reanimated, {useAnimatedRef, useAnimatedStyle} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent} from './types';
import useActionSheetKeyboardSpacing from './useActionSheetKeyboardSpacing';

function ActionSheetAwareScrollView({style, children, ref, ...props}: ActionSheetAwareScrollViewProps) {
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

    return (
        <Reanimated.ScrollView
            ref={onRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
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
const renderScrollComponent: RenderActionSheetAwareScrollViewComponent = (props) => {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
};

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
