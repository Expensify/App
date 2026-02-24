import type {RefObject} from 'react';
import type {TextInput} from 'react-native';

type UseHtmlPaste = (
    textInputRef: RefObject<(HTMLTextAreaElement & TextInput) | TextInput | null>,
    preHtmlPasteCallback?: (event: ClipboardEvent) => boolean,
    isActive?: boolean,
    maxLength?: number, // Maximum length of the text input value after pasting
) => void | {
    handlePastePlainText: (event: ClipboardEvent) => void;
};

export default UseHtmlPaste;
