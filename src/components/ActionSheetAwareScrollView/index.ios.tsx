import type {PropsWithChildren} from 'react';
import React, {forwardRef, useCallback, useEffect, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView, ScrollViewProps} from 'react-native';
import {InteractionManager} from 'react-native';
import Reanimated, {useAnimatedRef, useScrollViewOffset} from 'react-native-reanimated';
import {Actions, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider} from './ActionSheetAwareScrollViewContext';
import ActionSheetKeyboardSpace from './ActionSheetKeyboardSpace';
import type ActionSheetAwareScrollViewProps from './type';

const ActionSheetAwareScrollView = forwardRef<ScrollView, PropsWithChildren<ActionSheetAwareScrollViewProps>>(({isInitialData, ...props}, ref) => {
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
    const [isInitialRenderDone, setIsInitialRenderDone] = useState(!isInitialData);

    useEffect(() => {
        if (isInitialData) {
            return;
        }
        InteractionManager.runAfterInteractions(() => {
            setIsInitialRenderDone(true);
        });
    }, [isInitialData]);

    return (
        <Reanimated.ScrollView
            ref={onRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {React.Children.map(props.children, (child, index) => {
                if (index === 0 && isInitialRenderDone) {
                    return <ActionSheetKeyboardSpace position={position}>{child}</ActionSheetKeyboardSpace>;
                }
                return child;
            })}
        </Reanimated.ScrollView>
    );
});

export default ActionSheetAwareScrollView;

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
function renderScrollComponent(props: ScrollViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

export {renderScrollComponent, ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions};
