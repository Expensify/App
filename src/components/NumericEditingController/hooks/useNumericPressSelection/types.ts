import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {RefObject} from 'react';

type UseNumericPressSelectionParams = {
    /** The controlled text input whose caret is read on press. */
    inputRef: RefObject<BaseTextInputRef | null>;

    /** Applies the caret offsets to the editing controller's selection. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Caller press handler, called after the selection sync. */
    onPress?: BaseTextInputProps['onPress'];
};

export default UseNumericPressSelectionParams;
