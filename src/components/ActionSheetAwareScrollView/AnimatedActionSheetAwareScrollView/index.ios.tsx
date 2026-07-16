import useActionSheetAwareScrollViewRef from '@components/ActionSheetAwareScrollView/useActionSheetAwareScrollViewRef';
import useActionSheetKeyboardSpacing from '@components/ActionSheetAwareScrollView/useActionSheetKeyboardSpacing';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

import React from 'react';
import {KeyboardChatScrollView} from 'react-native-keyboard-controller';
import {useAnimatedStyle} from 'react-native-reanimated';

import type AnimatedActionSheetAwareScrollViewProps from './types';

function AnimatedActionSheetAwareScrollView({children, style, ref, ...restProps}: AnimatedActionSheetAwareScrollViewProps) {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(ref);

    const safeAreaPaddings = useSafeAreaPaddings();
    const spacing = useActionSheetKeyboardSpacing(animatedRef);
    const animatedStyle = useAnimatedStyle(() => ({
        paddingTop: spacing.get(),
    }));
    return (
        <KeyboardChatScrollView
            {...restProps}
            ref={onRef}
            style={[style, animatedStyle]}
            offset={safeAreaPaddings.paddingBottom}
            keyboardDismissMode="interactive"
        >
            {children}
        </KeyboardChatScrollView>
    );
}

export default AnimatedActionSheetAwareScrollView;
