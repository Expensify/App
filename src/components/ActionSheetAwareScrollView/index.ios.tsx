import type {PropsWithChildren} from 'react';
import React, {forwardRef, useCallback} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import Reanimated, {useAnimatedRef, useScrollViewOffset} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import type {ActionSheetAwareScrollViewProps, RenderScrollComponentType} from './types';
import useActionSheetKeyboardSpace from './useActionSheetKeyboardSpace';

const ActionSheetAwareScrollView = forwardRef<ScrollView, PropsWithChildren<ActionSheetAwareScrollViewProps>>(({style, children, isInvertedScrollView, ...rest}, ref) => {
    const scrollViewAnimatedRef = useAnimatedRef<Reanimated.ScrollView>();
    const position = useScrollViewOffset(scrollViewAnimatedRef);

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

    const {animatedStyle} = useActionSheetKeyboardSpace({position, isInvertedScrollView});

    return (
        <Reanimated.ScrollView
            ref={onRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
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
const renderScrollComponent: RenderScrollComponentType = (props: ActionSheetAwareScrollViewProps) => {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
};

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
