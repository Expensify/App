import type {KeyboardStateContextValue} from '@components/withKeyboardState';
import {KeyboardStateContext} from '@components/withKeyboardState';

import {useContext} from 'react';

/**
 * Hook for getting current state of keyboard
 * whether the keyboard is open
 */
export default function useKeyboardState(): KeyboardStateContextValue {
    return useContext(KeyboardStateContext);
}
