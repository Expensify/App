/*
 * The KeyboardAvoidingView stub implementation for web and other platforms where the keyboard is handled automatically.
 */
import React, {useMemo} from 'react';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import BaseKeyboardAvoidingView from './BaseKeyboardAvoidingView';
import type {KeyboardAvoidingViewProps} from './types';

function KeyboardAvoidingView({shouldCompensateBottomSafeAreaPadding = false, keyboardVerticalOffset: keyboardVerticalOffsetProp, ...restProps}: KeyboardAvoidingViewProps) {
    const {paddingBottom} = useStyledSafeAreaInsets(true);
    const keyboardVerticalOffset = useMemo(
        () => (keyboardVerticalOffsetProp ?? 0) + (shouldCompensateBottomSafeAreaPadding ? -paddingBottom : 0),
        [keyboardVerticalOffsetProp, paddingBottom, shouldCompensateBottomSafeAreaPadding],
    );
    return (
        <BaseKeyboardAvoidingView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            keyboardVerticalOffset={keyboardVerticalOffset}
        />
    );
}

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
