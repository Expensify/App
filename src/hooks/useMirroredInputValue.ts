/**
 * Mirrors a value stored in Onyx in local state for a controlled text input. Feeding the stored value straight to the
 * input lets a write that lands mid-typing overwrite what the user typed and move the caret, so the input shows the
 * mirror instead, which picks up outside changes to the stored value only while the input is not being edited.
 */
import {useState} from 'react';

type UseMirroredInputValueResult = {
    /** What the input shows */
    inputValue: string;

    /** Sets what the input shows, as the user types */
    setInputValue: (value: string) => void;

    /** Whether the input is being edited */
    isFocused: boolean;

    /** Starts an edit, which holds off outside changes to the stored value */
    startEditing: () => void;

    /**
     * Ends the edit. Returns what the input holds when the user changed it, and `undefined` when they left it as it
     * was, in which case the input goes back to showing the stored value.
     */
    finishEditing: () => string | undefined;
};

function useMirroredInputValue(storedValue: string): UseMirroredInputValueResult {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(storedValue);
    const [prevStoredValue, setPrevStoredValue] = useState(storedValue);
    const [valueAtFocus, setValueAtFocus] = useState<string>();

    // Synced during render rather than in an effect, to avoid a render pass that shows the stale value.
    if (storedValue !== prevStoredValue) {
        setPrevStoredValue(storedValue);
        if (!isFocused) {
            setInputValue(storedValue);
        }
    }

    const startEditing = () => {
        setIsFocused(true);
        setValueAtFocus(inputValue);
    };

    const finishEditing = () => {
        setIsFocused(false);
        if (inputValue !== valueAtFocus) {
            return inputValue;
        }
        // The stored value may have changed while the untouched input was focused, and nothing else brings it in.
        setInputValue(storedValue);
        return undefined;
    };

    return {inputValue, setInputValue, isFocused, startEditing, finishEditing};
}

export default useMirroredInputValue;
