import {useContext} from 'react';
import type {KeyboardStateContextValue} from '@components/withKeyboardState';
import {KeyboardStateContext} from '@components/withKeyboardState';

/**
 * Hook for getting current state of keyboard
 * whether the keyboard is open
 */
export default function useKeyboardState(): KeyboardStateContextValue {
    return useContext(KeyboardStateContext);
}
