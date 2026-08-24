import variables from '@styles/variables';

import React from 'react';

import type {BaseTextInputProps} from './types';

import BaseTextInputImplementation from './implementation';

/**
 * Native variant of `autoGrowSingleLine`: grows the input up to `variables.textInputAutoGrowMaxHeight` then scrolls
 * internally. Native submits via `submitBehavior`/`returnKeyType` and the consumer sanitizes line breaks, so unlike
 * web there is no Shift+Enter handling and `onKeyPress` is left untouched.
 * Pass `useAutoFocusInput(true)` when auto-focusing so the caret lands after an existing value.
 */
function BaseTextInput({ref, autoGrowSingleLine = false, ...props}: BaseTextInputProps) {
    return (
        <BaseTextInputImplementation
            {...props}
            ref={ref}
            autoGrowHeight={autoGrowSingleLine || props.autoGrowHeight}
            maxAutoGrowHeight={autoGrowSingleLine ? (props.maxAutoGrowHeight ?? variables.textInputAutoGrowMaxHeight) : props.maxAutoGrowHeight}
            submitBehavior={autoGrowSingleLine ? (props.submitBehavior ?? 'blurAndSubmit') : props.submitBehavior}
            returnKeyType={autoGrowSingleLine ? (props.returnKeyType ?? 'go') : props.returnKeyType}
        />
    );
}

export default BaseTextInput;
