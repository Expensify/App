import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

import React, {useMemo} from 'react';

import type {KeyboardAvoidingViewProps} from './types';

import BaseKeyboardAvoidingView from './BaseKeyboardAvoidingView';

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
