import type {ComponentRef, RefObject} from 'react';
import type {TextInput} from 'react-native';

type UseHtmlPaste = (
    textInputRef: RefObject<(HTMLElement & Pick<TextInput, 'isFocused'>) | ComponentRef<typeof TextInput> | null>,
    preHtmlPasteCallback?: (event: ClipboardEvent) => boolean,
    isActive?: boolean,
    maxLength?: number, // Maximum length of the text input value after pasting
) => void | {
    handlePastePlainText: (event: ClipboardEvent) => void;
};

export default UseHtmlPaste;
