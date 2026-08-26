import type {NumberInputKeyPressEvent, NumberInputSelection} from '@components/NumberInput/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {BlurEvent} from 'react-native';

type NumberFormStateContextValue = {
    /** The canonical signed value owned by the root. */
    value: string;

    /**
     * The `value` prop exactly as passed to the root, before any internal editing state. The decimals-change logic
     * reads this the way the legacy component read its own `number` prop, so an intentionally empty field is left alone.
     */
    externalValue: string;

    /** The text the composed input displays: the canonical value rendered with locale digits. */
    formattedNumber: string;

    /** Whether the canonical value is negative. */
    isNegative: boolean;

    /** The selection to render, clamped to the displayed text. */
    selection: NumberInputSelection;

    /** Whether negative values are allowed. */
    allowNegative: boolean;

    /** Error supplied by FormProvider. Rendered inline by the text input, which owns the label and error slots. */
    errorText?: string;
};

type NumberFormActionsContextValue = {
    /** Normalizes, validates, and commits the text displayed by the composed input. */
    setNumber: (text: string) => void;

    /** Replaces the canonical value without validation or notification and moves the caret to the end. */
    updateNumber: (value: string) => void;

    /** Returns the canonical signed value. */
    getNumber: () => string;

    /** Collapses the selection onto its end. */
    clearSelection: () => void;

    /** Applies a native selection change, dropping the stale event emitted alongside a manual update. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Tracks forward-delete key presses. */
    handleKeyPress: (event: NumberInputKeyPressEvent) => void;

    /** Forwards blur to the root (InputWrapper) callback. */
    handleBlur: (event: BlurEvent) => void;

    /** Submit callback supplied by InputWrapper. */
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];

    /** Reference to the underlying text input, supplied by InputWrapper. */
    inputRef?: ForwardedRef<BaseTextInputRef>;
};

export type {NumberFormActionsContextValue, NumberFormStateContextValue};
