import React from 'react';
import Reanimated, {useAnimatedStyle} from 'react-native-reanimated';

import type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent} from './types';

import {Actions, ActionSheetAwareScrollViewProvider, useActionSheetAwareScrollViewActions, useActionSheetAwareScrollViewState} from './ActionSheetAwareScrollViewContext';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';
import useActionSheetKeyboardSpacing from './useActionSheetKeyboardSpacing';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

function ActionSheetAwareScrollView({style, children, ref, ...restProps}: ActionSheetAwareScrollViewProps) {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(ref);

    const spacing = useActionSheetKeyboardSpacing(animatedRef);
    // The spacing lifts the content while a popover is open, for example to cancel the keyboard closing under it.
    // The report-actions list is chronological, so a top padding would push its rows down instead. Translating
    // keeps the list's layout and scroll offset unchanged; the parent clips the rows that move above it.
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: -spacing.get()}],
    }));

    usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});

    return (
        <Reanimated.ScrollView
            {...restProps}
            ref={onRef}
            style={[style, animatedStyle]}
        >
            {children}
        </Reanimated.ScrollView>
    );
}

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
const renderScrollComponent: RenderActionSheetAwareScrollViewComponent = (props) => {
    return <ActionSheetAwareScrollView {...props} />;
};

export {renderScrollComponent, ActionSheetAwareScrollViewProvider, Actions, useActionSheetAwareScrollViewState, useActionSheetAwareScrollViewActions};
