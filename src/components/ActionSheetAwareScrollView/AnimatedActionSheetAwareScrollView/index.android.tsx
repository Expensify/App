import useActionSheetAwareScrollViewRef from '@components/ActionSheetAwareScrollView/useActionSheetAwareScrollViewRef';

import React from 'react';
import {KeyboardChatScrollView} from 'react-native-keyboard-controller';

import type AnimatedActionSheetAwareScrollViewProps from './types';

function AnimatedActionSheetAwareScrollView({children, ref, ...restProps}: AnimatedActionSheetAwareScrollViewProps) {
    const {onRef, animatedRef} = useActionSheetAwareScrollViewRef(ref);

    // usePreventScrollOnKeyboardInteraction({scrollViewRef: animatedRef});

    return (
        <KeyboardChatScrollView
            {...restProps}
            ref={onRef}
            // automaticallyAdjustContentInsets={false}
            // contentInsetAdjustmentBehavior="never"
            keyboardDismissMode="interactive"
        >
            {children}
        </KeyboardChatScrollView>
    );
}

export default AnimatedActionSheetAwareScrollView;
