import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';

import variables from '@styles/variables';

import type {TextInputKeyPressEvent, TextInputSubmitEditingEvent} from 'react-native';

import React from 'react';

import type {BaseTextInputProps} from './types';

import BaseTextInputImplementation from './implementation';

/**
 * A single-line input cannot wrap - on web it renders as `<input>` and on native as `UITextField` /
 * a single-line `EditText`, none of which have a wrapping mode. Wrapping therefore requires the
 * multiline rendering path, which brings newline behaviors a single-line value must not have.
 *
 * `autoGrowSingleLine` bundles the growth with those behaviors turned back off, so the input looks
 * like a growing text box but still behaves like the single-line field it replaces:
 * - grows with the content up to `variables.textInputAutoGrowMaxHeight`, then scrolls internally
 * - the return key submits and blurs rather than inserting a line break, including on touch devices
 *   (see `computeComponentSpecificRegistrationParams` in `Form/InputWrapper`)
 * - Shift+Enter submits too, since a line break is never a valid value here
 *
 * Pass `useAutoFocusInput(true)` when the input is focused automatically, so the caret lands after an existing value
 * instead of before it.
 */
function BaseTextInput({ref, autoGrowSingleLine = false, ...props}: BaseTextInputProps) {
    /**
     * react-native-web only treats Enter *without* modifiers as a submit, so Shift+Enter bypasses
     * `submitBehavior` entirely and would insert a line break. Submit instead, which is what Enter with or
     * without Shift does in a single-line input. Only web hands this handler a keyboard event carrying the
     * modifier state and a working `preventDefault`, so a line break typed on native with a hardware keyboard
     * drops out here and is left for the consumer to sanitize when the value is saved.
     */
    const submitOnShiftEnter = (event: TextInputKeyPressEvent | KeyboardEvent) => {
        if (!('key' in event) || event.key !== 'Enter' || !event.shiftKey || isEnterWhileComposition(event)) {
            return;
        }

        event.preventDefault();

        // The submit handler only needs to know that the input was submitted, it ignores the event payload.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        props.onSubmitEditing?.(event as unknown as TextInputSubmitEditingEvent);
    };

    const handleKeyPress = (event: TextInputKeyPressEvent) => {
        props.onKeyPress?.(event);
        submitOnShiftEnter(event);
    };

    return (
        <BaseTextInputImplementation
            // eslint-disable-next-line react/jsx-props-no-spreading
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

BaseTextInput.displayName = 'BaseTextInput';

export default BaseTextInput;
