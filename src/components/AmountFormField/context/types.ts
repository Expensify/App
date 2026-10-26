import type {AmountEditingKeyPressEvent, AmountEditingSelection} from '@components/AmountEditingController/types';

type AmountFormFieldStateContextValue = {
    /** Canonical signed value owned by the root. */
    value: string;

    /** Canonical value rendered with locale digits. */
    formattedNumber: string;

    /** Selection clamped to the displayed text. */
    selection: AmountEditingSelection;

    allowNegative: boolean;

    /** Error supplied by FormProvider and rendered by the text input. */
    errorText?: string;
};

type AmountFormFieldActionsContextValue = {
    /** Normalizes, validates, and commits displayed text. */
    setNumber: (text: string) => void;

    /** Toggles the sign of the value, shifting the caret with the sign it adds or removes. */
    toggleSign: () => void;

    /** Applies a native selection change, dropping stale events from manual updates. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Tracks forward-delete key presses for caret positioning. */
    handleKeyPress: (event: AmountEditingKeyPressEvent) => void;
};

export type {AmountFormFieldActionsContextValue, AmountFormFieldStateContextValue};
