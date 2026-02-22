import {useRef} from 'react';
import type {View} from 'react-native';

/**
 * Native doesn't have DOM focusout events, so this is a no-op.
 */
function useResetFocusOnBlur() {
    return useRef<View>(null);
}

export default useResetFocusOnBlur;
