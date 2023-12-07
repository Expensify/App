import {MutableRefObject} from 'react';

type UseHtmlPaste = (
    textInputRef: MutableRefObject<
        | (HTMLInputElement & {
              isFocused?: () => boolean;
          })
        | null
    >,
    checkComposerVisibility?: () => boolean,
    isUnmountedOnBlur?: boolean,
) => void;

export default UseHtmlPaste;
