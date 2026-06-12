import React, {useMemo} from 'react';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import BaseKeyboardAvoidingView from './BaseKeyboardAvoidingView';
import type {KeyboardAvoidingViewProps} from './types';

function KeyboardAvoidingView({shouldOffsetBottomSafeAreaPadding = false, keyboardVerticalOffset: keyboardVerticalOffsetProp, ...restProps}: KeyboardAvoidingViewProps) {
    const {paddingBottom} = useSafeAreaPaddings(true);

    const keyboardVerticalOffset = useMemo(
        () => (keyboardVerticalOffsetProp ?? 0) + (shouldOffsetBottomSafeAreaPadding ? -paddingBottom : 0),
        [keyboardVerticalOffsetProp, paddingBottom, shouldOffsetBottomSafeAreaPadding],
    );

    return (
        <BaseKeyboardAvoidingView
            {...restProps}
            keyboardVerticalOffset={keyboardVerticalOffset}
        />
    );
}

export default KeyboardAvoidingView;
