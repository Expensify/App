import useActionSheetAwareScrollViewRef from '@components/ActionSheetAwareScrollView/useActionSheetAwareScrollViewRef';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

import React from 'react';
import {KeyboardChatScrollView} from 'react-native-keyboard-controller';

import type AnimatedActionSheetAwareScrollViewProps from './types';

function AnimatedActionSheetAwareScrollView({children, ref, ...restProps}: AnimatedActionSheetAwareScrollViewProps) {
    const {onRef} = useActionSheetAwareScrollViewRef(ref);
    const safeAreaPaddings = useSafeAreaPaddings();

    return (
        <KeyboardChatScrollView
            {...restProps}
            ref={onRef}
            offset={safeAreaPaddings.paddingBottom}
            keyboardDismissMode="interactive"
        >
            {children}
        </KeyboardChatScrollView>
    );
}

export default AnimatedActionSheetAwareScrollView;
