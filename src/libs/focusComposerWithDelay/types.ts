import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ComponentRef} from 'react';
import type {TextInput} from 'react-native';

type Selection = {
    start: number;
    end: number;
    positionX?: number;
    positionY?: number;
};

type FocusComposerWithDelay = (shouldDelay?: boolean, forcedSelectionRange?: Selection, forceKeyboardIfAlreadyFocused?: boolean) => Promise<void>;

type InputType = BaseTextInputRef | ComponentRef<typeof TextInput> | HTMLTextAreaElement;

export type {Selection, FocusComposerWithDelay, InputType};
