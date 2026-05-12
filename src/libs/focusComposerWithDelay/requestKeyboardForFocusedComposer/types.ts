import type {InputType, Selection} from '@libs/focusComposerWithDelay/types';

type RequestKeyboardForFocusedComposer = (textInput: InputType, forcedSelectionRange?: Selection) => void;

export default RequestKeyboardForFocusedComposer;
