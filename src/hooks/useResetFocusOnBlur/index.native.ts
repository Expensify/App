import {useRef} from 'react';
import type {View} from 'react-native';

/**
 * Native doesn't have DOM focusout events, so this is a no-op.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useResetFocusOnBlur(_setFocusedIndex: (index: number) => void) {
    return useRef<View>(null);
}

export default useResetFocusOnBlur;
