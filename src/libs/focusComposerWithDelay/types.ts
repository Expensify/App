import type {TextInput} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

type Selection = {
    start: number;
    end: number;
    positionX?: number;
    positionY?: number;
};

type FocusComposerWithDelay = (shouldDelay?: boolean, forcedSelectionRange?: Selection, forceKeyboardIfAlreadyFocused?: boolean) => Promise<void>;

type InputType = TextInput | HTMLTextAreaElement | BaseTextInputRef;

export type {Selection, FocusComposerWithDelay, InputType};
