import {KeyboardShownRefContext} from '@components/withKeyboardState';

import type {RefObject} from 'react';

import {useContext} from 'react';

/**
 * Returns a ref that tells whether the keyboard is shown. Unlike useKeyboardState, it never re-renders the caller on
 * keyboard events, so use it when the value is only read in callbacks or effects.
 */
export default function useKeyboardShownRef(): RefObject<boolean> {
    return useContext(KeyboardShownRefContext);
}
