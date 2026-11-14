import type {RefObject} from 'react';

type UseRowFocusSyncOptions = {
    /** The list's outer element, which holds its rows and its text input. */
    containerRef: RefObject<unknown>;

    /** Shows the focused row's highlight, as an arrow key does. */
    showKeyboardHighlight: () => void;

    /** Moves the focused index. -1 means no row. */
    setFocusedIndex: (index: number) => void;
};

export default UseRowFocusSyncOptions;
