import type {MutableRefObject} from 'react';
import type {TextInput} from 'react-native';

export type WithSelectionRestoreAbility = {
    restoreSelectionPosition?: () => void;
};

type UseHtmlPaste = (
    textInputRef: MutableRefObject<(HTMLTextAreaElement & TextInput & WithSelectionRestoreAbility) | (TextInput & WithSelectionRestoreAbility) | null>,
    preHtmlPasteCallback?: (event: ClipboardEvent) => boolean,
    removeListenerOnScreenBlur?: boolean,
    shouldRefocusAfterPaste?: boolean,
) => void;

export default UseHtmlPaste;
