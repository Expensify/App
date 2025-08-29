import {useContext} from 'react';
import {KeyboardStateContext} from '@components/KeyboardStateProvider';
import type {KeyboardStateContextValue} from '@components/KeyboardStateProvider/type';

/**
 * Hook for getting current state of keyboard
 * whether the keyboard is open
 */
export default function useKeyboardState(): KeyboardStateContextValue {
    return useContext(KeyboardStateContext);
}
