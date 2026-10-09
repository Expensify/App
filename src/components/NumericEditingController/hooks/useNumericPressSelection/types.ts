import type {RefObject} from 'react';

type UseNumericPressSelectionParams<THandler = ((...args: any[]) => void) | undefined> = {
    /** The controlled text input whose caret is read on press. */
    inputRef: RefObject<unknown>;

    /** Applies the caret offsets to the editing controller's selection. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Caller press handler, called after the selection sync. */
    onPress?: THandler;
};

export default UseNumericPressSelectionParams;
