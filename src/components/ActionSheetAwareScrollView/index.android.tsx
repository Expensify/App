import React from 'react';
import {KeyboardChatScrollView} from 'react-native-keyboard-controller';
import Reanimated from 'react-native-reanimated';

import type {
    ActionSheetAwareKeyboardScrollViewProps,
    ActionSheetAwareScrollViewProps,
    RenderActionSheetAwareKeyboardScrollViewComponent,
    RenderActionSheetAwareScrollViewComponent,
} from './types';

import {Actions, ActionSheetAwareScrollViewProvider, useActionSheetAwareScrollViewActions, useActionSheetAwareScrollViewState} from './ActionSheetAwareScrollViewContext';
import useActionSheetAwareScrollViewRef from './useActionSheetAwareScrollViewRef';
import usePreventScrollOnKeyboardInteraction from './usePreventScrollOnKeyboardInteraction';

function ActionSheetAwareScrollView({style, children, ref, ...restProps}: ActionSheetAwareScrollViewProps) {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(ref);

    usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});

    return (
        <Reanimated.ScrollView
            {...restProps}
            ref={onRef}
            style={style}
        >
            {children}
        </Reanimated.ScrollView>
    );
}

function ActionSheetAwareKeyboardScrollView({style, children, inverted, ref, ...restProps}: ActionSheetAwareKeyboardScrollViewProps) {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(ref);

    usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});

    return (
        <KeyboardChatScrollView
            {...restProps}
            ref={onRef}
            style={style}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            inverted={inverted}
            keyboardDismissMode="interactive"
            keyboardLiftBehavior="never"
        >
            {children}
        </KeyboardChatScrollView>
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

const renderInvertedScrollComponent: RenderActionSheetAwareKeyboardScrollViewComponent = (props) => {
    return (
        <ActionSheetAwareKeyboardScrollView
            {...props}
            inverted
        />
    );
};

export {renderScrollComponent, renderInvertedScrollComponent, ActionSheetAwareScrollViewProvider, Actions, useActionSheetAwareScrollViewState, useActionSheetAwareScrollViewActions};
