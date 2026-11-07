import {useState} from 'react';

type UseMirroredInputValueResult = {
    /** What the input shows */
    inputValue: string;

    /** Sets what the input shows, as the user types */
    setInputValue: (value: string) => void;

    /** Whether the input is being edited */
    isFocused: boolean;

    /** Marks the input as being edited, which holds off outside changes */
    markFocused: () => void;

    /** Marks the input as no longer being edited */
    markBlurred: () => void;
};

/**
 * Mirrors a value stored in Onyx in local state for a controlled text input. Feeding the stored value straight to the
 * input lets a write that lands mid-typing overwrite what the user typed and move the caret, so the input shows the
 * mirror instead, which picks up outside changes to the stored value only while the input is not being edited.
 */
function useMirroredInputValue(storedValue: string): UseMirroredInputValueResult {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(storedValue);
    const [prevStoredValue, setPrevStoredValue] = useState(storedValue);

    // Synced during render rather than in an effect, to avoid a render pass that shows the stale value.
    if (storedValue !== prevStoredValue) {
        setPrevStoredValue(storedValue);
        if (!isFocused) {
            setInputValue(storedValue);
        }
    }

    return {inputValue, setInputValue, isFocused, markFocused: () => setIsFocused(true), markBlurred: () => setIsFocused(false)};
}

export default useMirroredInputValue;
