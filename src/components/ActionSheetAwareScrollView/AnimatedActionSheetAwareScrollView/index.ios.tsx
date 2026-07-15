import useActionSheetAwareScrollViewRef from '@components/ActionSheetAwareScrollView/useActionSheetAwareScrollViewRef';
import useActionSheetKeyboardSpacing from '@components/ActionSheetAwareScrollView/useActionSheetKeyboardSpacing';
import usePreventScrollOnKeyboardInteraction from '@components/ActionSheetAwareScrollView/usePreventScrollOnKeyboardInteraction';

import React from 'react';
import {KeyboardChatScrollView} from 'react-native-keyboard-controller';
import {useAnimatedStyle} from 'react-native-reanimated';

import type AnimatedActionSheetAwareScrollViewProps from './types';

function AnimatedActionSheetAwareScrollView({children, style, ref, ...restProps}: AnimatedActionSheetAwareScrollViewProps) {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(ref);

    const spacing = useActionSheetKeyboardSpacing(animatedRef);
    const animatedStyle = useAnimatedStyle(() => ({
        paddingTop: spacing.get(),
    }));
    // usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});

    return (
        <KeyboardChatScrollView
            {...restProps}
            ref={onRef}
            style={[style]}
            // automaticallyAdjustContentInsets={false}
            // contentInsetAdjustmentBehavior="never"
            keyboardDismissMode="interactive"
        >
            {children}
        </KeyboardChatScrollView>
    );
}

export default AnimatedActionSheetAwareScrollView;
