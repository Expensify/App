import type {NumericEditingKeyPressEvent, NumericEditingSelection} from '@components/NumericEditingController/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {RefObject} from 'react';

type NumericInputStateContextValue = {
    /** The canonical signed value owned by the root. */
    value: string;

    /** Canonical value rendered with locale digits. */
    formattedNumber: string;

    /** Selection clamped to the displayed text. */
    selection: NumericEditingSelection;

    /** Whether the canonical value is negative. */
    isNegative: boolean;

    /** Whether negative values are allowed. */
    allowNegative: boolean;

    /** Error supplied by FormProvider. Rendered by the `NumericInput.Error` primitive wherever the composition places it. */
    errorText?: string;

    /** Underlying text input, filled in by the text input primitive and read by focus handling and the web caret sync. */
    inputRef: RefObject<BaseTextInputRef | null>;
};

type NumericInputActionsContextValue = {
    /** Normalizes, validates, and commits displayed text. */
    setNumber: (text: string) => void;

    /** Places the caret at the selection end, clearing any highlighted range. */
    clearSelection: () => void;

    /** Toggles the sign of the canonical value and notifies the parent. */
    toggleSign: () => void;

    /** Removes the negative sign from the canonical value and notifies the parent. */
    clearSign: () => void;

    /** Applies a native selection change, dropping stale events from manual updates. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Tracks forward-delete key presses for caret positioning. */
    handleKeyPress: (event: NumericEditingKeyPressEvent) => void;

    /** Focuses the underlying text input. */
    focusInput: () => void;
};

export type {NumericInputActionsContextValue, NumericInputStateContextValue};
