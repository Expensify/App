import type {TextInput} from 'react-native';

type Selection = {
    start: number;
    end: number;
};

type FocusComposerWithDelay = (shouldDelay?: boolean, forcedSelectionRange?: Selection) => void;

type InputType = TextInput | HTMLTextAreaElement;

export type {Selection, FocusComposerWithDelay, InputType};
