import React, {forwardRef} from 'react';
import type {NativePointerEvent, NativeSyntheticEvent, Role} from 'react-native';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import GenericPressable from './BaseGenericPressable';
import type {PressableRef} from './types';
import type PressableProps from './types';

function saveFocusedInput(e: NativeSyntheticEvent<NativePointerEvent>) {
    const target = e.target as unknown as EventTarget;
    if (!target) {
        return;
    }
    // If an input is clicked, it usually doesn't show a modal, so there's no need to save the focused input.
    if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
        return;
    }
    ComposerFocusManager.saveFocusedInput();
}

function WebGenericPressable({focusable = true, ...props}: PressableProps, ref: PressableRef) {
    const accessible = props.accessible ?? props.accessible === undefined ? true : props.accessible;

    return (
        <GenericPressable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onPointerDown={saveFocusedInput}
            ref={ref}
            // change native accessibility props to web accessibility props
            focusable={focusable}
            tabIndex={props.tabIndex ?? (!accessible || !focusable) ? -1 : 0}
            role={(props.accessibilityRole ?? props.role) as Role}
            id={props.nativeID}
            aria-label={props.accessibilityLabel}
            aria-labelledby={props.accessibilityLabelledBy}
            aria-valuenow={props.accessibilityValue?.now}
            aria-valuemin={props.accessibilityValue?.min}
            aria-valuemax={props.accessibilityValue?.max}
            aria-valuetext={props.accessibilityValue?.text}
            nativeID={props.nativeID}
            dataSet={{tag: 'pressable', ...(props.noDragArea && {dragArea: false}), ...props.dataSet}}
        />
    );
}

WebGenericPressable.displayName = 'WebGenericPressable';

export default forwardRef(WebGenericPressable);
