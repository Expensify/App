import type {NumericEditingKeyPressEvent, NumericEditingSelection} from '@components/NumericEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';

type NumericFieldStateContextValue = {
    /** The canonical signed value owned by the root. */
    value: string;

    /** The text the composed input displays: the canonical value rendered with locale digits. */
    formattedNumber: string;

    /** The selection to render, clamped to the displayed text. */
    selection: NumericEditingSelection;

    /** Whether negative values are allowed. */
    allowNegative: boolean;

    /** Error supplied by FormProvider. Rendered inline by the text input, which owns the label and error slots. */
    errorText?: string;
};

type NumericFieldActionsContextValue = {
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
    handleKeyPress: (event: NumericEditingKeyPressEvent) => void;

    /** Blur callback supplied by InputWrapper. */
    handleBlur?: BaseTextInputProps['onBlur'];

    /** Submit callback supplied by InputWrapper. */
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];

    /** Reference to the underlying text input, supplied by InputWrapper. */
    inputRef?: ForwardedRef<BaseTextInputRef>;
};

export type {NumericFieldActionsContextValue, NumericFieldStateContextValue};
