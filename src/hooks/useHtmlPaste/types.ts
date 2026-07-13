import type {RefObject} from 'react';
import type {TextInput} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

type UseHtmlPaste = (
    textInputRef: RefObject<(HTMLTextAreaElement & TextInput) | TextInput | null>,
    preHtmlPasteCallback?: (event: ClipboardEvent) => boolean,
    isActive?: boolean,
    maxLength?: number, // Maximum length of the text input value after pasting
    preferredSkinTone?: OnyxEntry<number | string>,
) => void | {
    handlePastePlainText: (event: ClipboardEvent) => void;
};

export default UseHtmlPaste;
