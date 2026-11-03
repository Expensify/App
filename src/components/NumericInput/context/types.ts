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

    /** Error supplied by FormProvider, placed by the layout. */
    errorText?: string;

    /** Underlying text input, filled in by the text input primitive and read by focus handling and the web caret sync. */
    inputRef: RefObject<BaseTextInputRef | null>;

    /** Whether to dynamically scale the font size down when the amount is long. */
    shouldUseDynamicFontSize?: boolean;
};

type NumericInputActionsContextValue = {
    /** Normalizes, validates, and commits displayed text. */
    setNumber: (text: string) => void;

    /** Replaces the selected range with text, or inserts it at the caret. */
    insertAtSelection: (text: string) => void;

    /** Deletes the selected range, or the character before the caret when nothing is selected. Removes the negative sign first when nothing precedes the caret. */
    deleteBackward: () => void;

    /** Places the caret at the selection end, clearing any highlighted range. */
    clearSelection: () => void;

    /** Toggles the sign of the canonical value and notifies the parent. */
    toggleSign: () => void;

    /** Applies a native selection change, dropping stale events from manual updates. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Tracks forward-delete key presses for caret positioning and clears the sign on backspace at the start. */
    handleKeyPress: (event: NumericEditingKeyPressEvent) => void;

    /** Focuses the underlying text input. */
    focusInput: () => void;

    /** Controls whether native selection change events are applied. Used by BigNumberPad backspace long press. */
    setShouldUpdateSelection: (shouldUpdate: boolean) => void;
};

export type {NumericInputActionsContextValue, NumericInputStateContextValue};
