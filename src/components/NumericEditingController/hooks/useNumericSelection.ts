import type {NumericEditingKeyPressEvent, NumericEditingSelection} from '@components/NumericEditingController/types';
import {clampSelection, collapseSelection, getNewSelection, getSelectionAtOffset, isForwardDeleteKeyPress} from '@components/NumericEditingController/utils';

import shouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually';

import {useIsFocused} from '@react-navigation/native';
import {useLayoutEffect, useRef, useState} from 'react';

type UseNumericSelectionParams = {
    /** Displayed text; native selections are clamped to its length. */
    displayText: string;
};

type NumericSelectionEdit = {
    previousText: string;

    nextText: string;
};

/** Manages the caret, the forward-delete key presses steering it, and guards against stale native selection events. */
function useNumericSelection({displayText}: UseNumericSelectionParams) {
    const isFocused = useIsFocused();

    const [selection, setSelection] = useState<NumericEditingSelection>(() => getSelectionAtOffset(displayText.length));
    const [previousIsFocused, setPreviousIsFocused] = useState(isFocused);

    // Bounds early native selection events to the pending text.
    const pendingDisplayTextRef = useRef<string | undefined>(undefined);
    // Ignores stale events after manual selection updates.
    const willSelectionBeUpdatedManually = useRef(false);
    // Ignores the rejected-input event to preserve the caret.
    const willSelectionBeRestoredAfterInvalidInput = useRef(false);
    // Forward-delete removes the next character, so the caret offset stays.
    const forwardDeletePressedRef = useRef(false);

    // Collapse selection when returning to the screen.
    if (previousIsFocused !== isFocused) {
        setPreviousIsFocused(isFocused);
        if (isFocused && !previousIsFocused) {
            setSelection(collapseSelection);
        }
    }

    /** Prepares guards for a manual selection update. */
    const prepareSelectionUpdate = (nextText: string) => {
        willSelectionBeUpdatedManually.current = true;
        pendingDisplayTextRef.current = nextText;
    };

    const collapse = () => {
        setSelection(collapseSelection);
    };

    /** Moves the caret to the start after an external clear. */
    const reset = () => {
        setSelection(getSelectionAtOffset(0));
    };

    const moveToEnd = (nextText: string) => {
        prepareSelectionUpdate(nextText);
        setSelection(getSelectionAtOffset(nextText.length));
    };

    /** Tracks forward-delete key presses, which decide how the caret moves on the next edit. */
    const handleKeyPress = (event: NumericEditingKeyPressEvent) => {
        forwardDeletePressedRef.current = isForwardDeleteKeyPress(event);
    };

    /** Adjusts the caret for an edit's text-length change. */
    const syncAfterEdit = ({previousText, nextText}: NumericSelectionEdit) => {
        prepareSelectionUpdate(nextText);
        const isForwardDelete = forwardDeletePressedRef.current && previousText.length > nextText.length;
        const previousLength = isForwardDelete ? nextText.length : previousText.length;
        setSelection((currentSelection) => getNewSelection(currentSelection, previousLength, nextText.length));
    };

    /** Restores the last valid caret after a rejected edit. */
    const rejectEdit = () => {
        // Ignore the native event; React Native syncs against its last reported position.
        willSelectionBeRestoredAfterInvalidInput.current = true;
        // Shallow copy forces native selection reset: https://github.com/Expensify/App/issues/16385
        setSelection((currentSelection) => ({...currentSelection}));
    };

    const handleNativeSelectionChange = (selectionStart: number, selectionEnd: number) => {
        if (willSelectionBeRestoredAfterInvalidInput.current) {
            willSelectionBeRestoredAfterInvalidInput.current = false;
            return;
        }

        if (shouldIgnoreSelectionWhenUpdatedManually && willSelectionBeUpdatedManually.current) {
            willSelectionBeUpdatedManually.current = false;
            return;
        }

        // iOS may report selection before text renders, so use pending bounds.
        const maxSelection = pendingDisplayTextRef.current?.length ?? displayText.length;
        pendingDisplayTextRef.current = undefined;
        setSelection(clampSelection({start: selectionStart, end: selectionEnd}, maxSelection));
    };

    useLayoutEffect(() => {
        // Clear guards after the armed selection commits.
        willSelectionBeUpdatedManually.current = false;
        willSelectionBeRestoredAfterInvalidInput.current = false;
    }, [selection]);

    return {
        selection,
        collapse,
        reset,
        moveToEnd,
        syncAfterEdit,
        handleKeyPress,
        rejectEdit,
        handleNativeSelectionChange,
    };
}

export default useNumericSelection;
export type {NumericSelectionEdit, UseNumericSelectionParams};
