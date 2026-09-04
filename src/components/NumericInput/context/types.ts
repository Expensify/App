import type {NumericEditingKeyPressEvent, NumericEditingSelection} from '@components/NumericEditingController/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {RefObject} from 'react';

type NumericInputStateContextValue = {
    /** The text the composed input displays, rendered with locale digits. */
    formattedNumber: string;

    /** The selection to render, clamped to the displayed magnitude. */
    selection: NumericEditingSelection;

    /** The underlying text input, owned by the root. The text input primitive fills it in; the web caret sync reads the element from it. */
    inputRef: RefObject<BaseTextInputRef | null>;
};

type NumericInputActionsContextValue = {
    /** Normalizes, validates, and commits the value displayed by the composed input. */
    setNumber: (text: string) => void;

    /** Collapses the current selection to its end. */
    clearSelection: () => void;

    /** Applies a native selection change, dropping the stale event emitted alongside a manual update. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Tracks forward-delete key presses. */
    handleKeyPress: (event: NumericEditingKeyPressEvent) => void;

    /** Focuses the underlying text input when a layout container is clicked. */
    focusInput: () => void;
};

export type {NumericInputActionsContextValue, NumericInputStateContextValue};
