import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';

import variables from '@styles/variables';

import type {TextInputKeyPressEvent, TextInputSubmitEditingEvent} from 'react-native';

import React from 'react';

import type {BaseTextInputProps} from './types';

import BaseTextInputImplementation from './implementation';

/**
 * Web/desktop variant of `autoGrowSingleLine`: grows the input up to `variables.textInputAutoGrowMaxHeight` then
 * scrolls internally, and the return key (incl. Shift+Enter) submits instead of inserting a line break. The native
 * counterpart (`index.native.tsx`) has no keypress wiring — it submits via `submitBehavior`/`returnKeyType`.
 * Pass `useAutoFocusInput(true)` when auto-focusing so the caret lands after an existing value.
 */
function BaseTextInput({ref, autoGrowSingleLine = false, ...props}: BaseTextInputProps) {
    // react-native-web treats Shift+Enter as a line break rather than a submit, so submit it manually — but only
    // when there is a submit handler, otherwise there is nothing to preventDefault for.
    const submitOnShiftEnter = (event: TextInputKeyPressEvent | KeyboardEvent) => {
        if (!('key' in event) || event.key !== 'Enter' || !event.shiftKey || isEnterWhileComposition(event) || !props.onSubmitEditing) {
            return;
        }

        event.preventDefault();

        // The submit handler ignores the event payload, so the cast is safe.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        props.onSubmitEditing(event as unknown as TextInputSubmitEditingEvent);
    };

    const handleKeyPress = (event: TextInputKeyPressEvent) => {
        props.onKeyPress?.(event);
        submitOnShiftEnter(event);
    };

    return (
        <BaseTextInputImplementation
            {...props}
            ref={ref}
            onKeyPress={autoGrowSingleLine ? handleKeyPress : props.onKeyPress}
            autoGrowHeight={autoGrowSingleLine || props.autoGrowHeight}
            maxAutoGrowHeight={autoGrowSingleLine ? (props.maxAutoGrowHeight ?? variables.textInputAutoGrowMaxHeight) : props.maxAutoGrowHeight}
            submitBehavior={autoGrowSingleLine ? (props.submitBehavior ?? 'blurAndSubmit') : props.submitBehavior}
            returnKeyType={autoGrowSingleLine ? (props.returnKeyType ?? 'go') : props.returnKeyType}
        />
    );
}

export default BaseTextInput;
