import {useFocusEffect} from '@react-navigation/native';
import type {RefObject} from 'react';
import {useCallback, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';
import CONST from '@src/CONST';

/**
 * Focuses the dialog title element after the RHP transition completes (web only).
 * Mirrors the useDelayedAutoFocus pattern: useFocusEffect + ANIMATED_TRANSITION delay.
 */
function useDialogTitleFocus(titleRef: RefObject<RNText | null>, isInsideDialog: boolean) {
    const hasInitiallyFocusedRef = useRef(false);

    useFocusEffect(
        useCallback(() => {
            if (!isInsideDialog || hasInitiallyFocusedRef.current) {
                return undefined;
            }
            hasInitiallyFocusedRef.current = true;
            const timer = setTimeout(() => {
                (titleRef.current as unknown as HTMLElement)?.focus();
            }, CONST.ANIMATED_TRANSITION);
            return () => clearTimeout(timer);
        }, [isInsideDialog, titleRef]),
    );
}

export default useDialogTitleFocus;
