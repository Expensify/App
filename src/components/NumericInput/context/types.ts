import type {NumericInputKeyPressEvent, NumericInputSelection} from '@components/NumericInputController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {BlurEvent} from 'react-native';

type NumericInputStateContextValue = {
    /** The canonical signed value owned by the root. */
    value: string;

    /**
     * The `value` prop exactly as passed to the root, before any internal editing state. The decimals-change logic
     * reads this the way the legacy component read its own `number` prop, so an intentionally empty field is left alone.
     */
    externalValue: string;

    /** The text the composed input displays: the magnitude rendered with locale digits. The minus is rendered separately. */
    formattedNumber: string;

    /** Whether the canonical value is negative. */
    isNegative: boolean;

    /** The selection to render, clamped to the displayed magnitude. */
    selection: NumericInputSelection;

    /** Whether negative values are allowed. */
    allowNegative: boolean;

    /** Error supplied by FormProvider. Rendered by the `NumericInput.Error` primitive wherever the composition places it. */
    errorText?: string;
};

type NumericInputActionsContextValue = {
    /** Normalizes, validates, and commits the magnitude displayed by the composed input, preserving the sign. */
    setNumber: (text: string) => void;

    /** Replaces the canonical signed value without validation or notification and moves the caret to the end of the magnitude. */
    updateNumber: (value: string) => void;

    /** Returns the canonical signed value. */
    getNumber: () => string;

    /** Collapses the selection onto its end. */
    clearSelection: () => void;

    /** Toggles the sign of the canonical value and notifies the parent. The displayed magnitude does not change. */
    toggleSign: () => void;

    /** Removes the negative sign from the canonical value, keeping the magnitude, and notifies the parent. */
    clearSign: () => void;

    /** Applies a native selection change, dropping the stale event emitted alongside a manual update. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Tracks forward-delete key presses. */
    handleKeyPress: (event: NumericInputKeyPressEvent) => void;

    /** Forwards blur to the root (InputWrapper) callback. */
    handleBlur: (event: BlurEvent) => void;

    /** Submit callback supplied by InputWrapper. */
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];

    /** Reference to the underlying text input, supplied by InputWrapper. */
    inputRef?: ForwardedRef<BaseTextInputRef>;
};

export type {NumericInputActionsContextValue, NumericInputStateContextValue};
