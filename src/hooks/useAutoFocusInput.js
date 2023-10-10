import {useFocusEffect} from '@react-navigation/native';
import {useState, useEffect, useRef, useCallback} from 'react';
import CONST from '../CONST';

export default function useAutoFocusInput() {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [screenTransitionEnd, setScreenTransitionEnd] = useState(false);

    const inputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    useEffect(() => {
        if (!screenTransitionEnd || !isInputInitialized || !inputRef.current) {
            return;
        }
        inputRef.current.focus();
    }, [screenTransitionEnd, isInputInitialized]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                setScreenTransitionEnd(true);
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
