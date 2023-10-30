import {useContext} from 'react';
import {KeyboardStateContext} from '@components/withKeyboardState';

/**
 * Hook for getting current state of keyboard
 * whether or not the keyboard is open
 * @returns {Object}
 */
export default function useKeyboardState() {
    return useContext(KeyboardStateContext);
}
