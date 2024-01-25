import type { NativeSyntheticEvent, TextInputKeyPressEventData, TextInputSelectionChangeEventData } from "react-native";

type SuggestionsRef = {
    getSuggestions: () => void;
    resetSuggestions: () => void;
    triggerHotkeyActions: (event: NativeSyntheticEvent<TextInputKeyPressEventData> | KeyboardEvent) => void;
    onSelectionChange: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;
    updateShouldShowSuggestionMenuToFalse: () => void;
    setShouldBlockSuggestionCalc: () => void;
}


// eslint-disable-next-line import/prefer-default-export
export type {SuggestionsRef};