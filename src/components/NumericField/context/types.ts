import type {NumericEditingKeyPressEvent, NumericEditingSelection} from '@components/NumericEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';

type NumericFieldStateContextValue = {
    /** Canonical signed value owned by the root. */
    value: string;

    /** Canonical value rendered with locale digits. */
    formattedNumber: string;

    /** Selection clamped to the displayed text. */
    selection: NumericEditingSelection;

    allowNegative: boolean;

    /** Error supplied by FormProvider and rendered by the text input. */
    errorText?: string;
};

type NumericFieldActionsContextValue = {
    /** Normalizes, validates, and commits displayed text. */
    setNumber: (text: string) => void;

    /** Applies a native selection change, dropping stale events from manual updates. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Tracks forward-delete key presses for caret positioning. */
    handleKeyPress: (event: NumericEditingKeyPressEvent) => void;

    handleBlur?: BaseTextInputProps['onBlur'];

    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];

    inputRef?: ForwardedRef<BaseTextInputRef>;
};

export type {NumericFieldActionsContextValue, NumericFieldStateContextValue};
