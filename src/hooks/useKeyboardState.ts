import {useContext} from 'react';
import {KeyboardStateContext, KeyboardStateContextValue} from '../components/withKeyboardState';

/**
 * Hook for getting current state of keyboard
 * whether the keyboard is open
 */
export default function useKeyboardState(): KeyboardStateContextValue | null {
    return useContext(KeyboardStateContext);
}
