import {useFocusEffect} from '@react-navigation/native';
import type {RefObject} from 'react';
import {useCallback, useRef} from 'react';
import CONST from '@src/CONST';

function useDelayedAutoFocus(ref: RefObject<{focus: () => void} | null>, shouldDelayAutoFocus: boolean) {
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!shouldDelayAutoFocus) {
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
        }, [shouldDelayAutoFocus, ref]),
    );
}

export default useDelayedAutoFocus;
