/**
 * Mirrors a value stored in Onyx in local state for a controlled text input. Feeding the stored value straight to the
 * input lets a write that lands mid-typing overwrite what the user typed and move the caret, so the input shows the
 * mirror instead, which picks up outside changes to the stored value until the user types in it.
 */
import {useState} from 'react';

type UseMirroredInputValueResult = {
    /** What the input shows */
    inputValue: string;

    /** Sets what the input shows, as the user types */
    setInputValue: (value: string) => void;

    /** Whether the input is being edited */
    isFocused: boolean;

    /** Starts an edit. Outside changes to the stored value are held off once the user types */
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

    // Synced during render rather than in an effect, to avoid a render pass that shows the stale value. A focused input
    // the user has not typed in yet holds no edit, so it follows the stored value too rather than show an outdated one.
    if (storedValue !== prevStoredValue) {
        setPrevStoredValue(storedValue);
        if (!isFocused || inputValue === valueAtFocus) {
            setInputValue(storedValue);
            setValueAtFocus(storedValue);
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
        // The user may have typed the value back to what it was while an outside change was held off, and nothing else brings that change in.
        setInputValue(storedValue);
        return undefined;
    };

    return {inputValue, setInputValue, isFocused, startEditing, finishEditing};
}

export default useMirroredInputValue;
