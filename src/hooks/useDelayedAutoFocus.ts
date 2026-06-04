import {useFocusEffect} from '@react-navigation/native';
import type {RefObject} from 'react';
import {useCallback, useRef} from 'react';
import CONST from '@src/CONST';
import useIsInLandscapeMode from './useIsInLandscapeMode';

function useDelayedAutoFocus(ref: RefObject<{focus: () => void} | null>, shouldDelayAutoFocus: boolean) {
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInLandscapeMode = useIsInLandscapeMode();

    useFocusEffect(
        useCallback(() => {
            if (!shouldDelayAutoFocus || isInLandscapeMode) {
                return undefined;
            }

            focusTimeoutRef.current = setTimeout(() => {
                ref.current?.focus();
            }, CONST.ANIMATED_TRANSITION);

            return () => {
                const timeout = focusTimeoutRef.current;
                if (timeout) {
                    clearTimeout(timeout);
                    focusTimeoutRef.current = null;
                }
            };
        }, [shouldDelayAutoFocus, ref, isInLandscapeMode]),
    );
}

export default useDelayedAutoFocus;
