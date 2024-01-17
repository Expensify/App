import type {MutableRefObject} from 'react';
import type {TextInput} from 'react-native';

type UseHtmlPaste = (textInputRef: MutableRefObject<(HTMLTextAreaElement & TextInput) | null>, checkComposerVisibility?: () => boolean, isUnmountedOnBlur?: boolean) => void;

export default UseHtmlPaste;
