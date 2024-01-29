import React from 'react';
import type {NativeSyntheticEvent, TextInputKeyPressEventData, TextInputSelectionChangeEventData} from 'react-native';

type SuggestionsRef = {
    getSuggestions: () => void;
    resetSuggestions: () => void;
    triggerHotkeyActions: (event: NativeSyntheticEvent<TextInputKeyPressEventData> | KeyboardEvent) => boolean;
    onSelectionChange: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;
    updateShouldShowSuggestionMenuToFalse: () => void;
    setShouldBlockSuggestionCalc: () => void;
};

const suggestionsRef = React.createRef<SuggestionsRef>();

function resetSuggestions() {
    if (!suggestionsRef.current) {
        return;
    }

    suggestionsRef.current.resetSuggestions();
}

function triggerHotkeyActions(event: NativeSyntheticEvent<TextInputKeyPressEventData> | KeyboardEvent): boolean {
    if (!suggestionsRef.current) {
        return false;
    }

    return suggestionsRef.current.triggerHotkeyActions(event);
}

function updateShouldShowSuggestionMenuToFalse() {
    if (!suggestionsRef.current) {
        return;
    }

    suggestionsRef.current.updateShouldShowSuggestionMenuToFalse();
}

function onSelectionChange(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) {
    if (!suggestionsRef.current) {
        return;
    }

    suggestionsRef.current.onSelectionChange(event);
}

export {suggestionsRef, resetSuggestions, triggerHotkeyActions, onSelectionChange, updateShouldShowSuggestionMenuToFalse};

// eslint-disable-next-line import/prefer-default-export
export type {SuggestionsRef};
