import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import CONST from '@src/CONST';

export default function useAutoFocusInput() {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);

    const inputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    useEffect(() => {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current) {
            return;
        }
        inputRef.current.focus();
    }, [isScreenTransitionEnded, isInputInitialized]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                setIsScreenTransitionEnded(true);
            }, CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []),
    );

    const inputCallbackRef = (ref) => {
        inputRef.current = ref;
        setIsInputInitialized(true);
    };

    return {inputCallbackRef};
}
