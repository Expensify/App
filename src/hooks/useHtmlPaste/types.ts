import type {MutableRefObject} from 'react';
import type {TextInput} from 'react-native';

type UseHtmlPaste = (
    textInputRef: MutableRefObject<(HTMLTextAreaElement & TextInput) | TextInput | null>,
    preHtmlPasteCallback?: (event: ClipboardEvent) => boolean,
    removeListenerOnScreenBlur?: boolean,
    maxLength?: number, // Maximum length of the text input value after pasting
) => void;

export default UseHtmlPaste;
