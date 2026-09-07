import type {NumericEditingKeyPressEvent, NumericEditingSelection} from '@components/NumericEditingController/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {RefObject} from 'react';

type NumericInputStateContextValue = {
    /** Canonical value rendered with locale digits. */
    formattedNumber: string;

    /** Selection clamped to the displayed text. */
    selection: NumericEditingSelection;

    /** Underlying text input, filled in by the text input primitive and read by focus handling and the web caret sync. */
    inputRef: RefObject<BaseTextInputRef | null>;
};

type NumericInputActionsContextValue = {
    /** Normalizes, validates, and commits displayed text. */
    setNumber: (text: string) => void;

    /** Places the caret at the selection end, clearing any highlighted range. */
    clearSelection: () => void;

    /** Applies a native selection change, dropping stale events from manual updates. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Tracks forward-delete key presses for caret positioning. */
    handleKeyPress: (event: NumericEditingKeyPressEvent) => void;

    /** Focuses the underlying text input. */
    focusInput: () => void;
};

export type {NumericInputActionsContextValue, NumericInputStateContextValue};
