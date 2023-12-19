import {MutableRefObject} from 'react';
import {TextInput} from 'react-native';

type UseHtmlPaste = (
    textInputRef: MutableRefObject<
        | ((HTMLTextAreaElement & TextInput) & {
              isFocused?: () => boolean;
          })
        | null
    >,
    checkComposerVisibility?: () => boolean,
    isUnmountedOnBlur?: boolean,
) => void;

export default UseHtmlPaste;
