import {useFocusEffect} from '@react-navigation/native';
import {useState, useEffect, useRef, useCallback, useContext} from 'react';
import CONST from '../CONST';
import * as Expensify from '../Expensify';

export default function useAutoFocusInput() {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);

    const {isSplashHidden} = useContext(Expensify.SplashScreenHiddenContext);

    const inputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    useEffect(() => {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current || !isSplashHidden) {
            return;
        }
        inputRef.current.focus();
    }, [isScreenTransitionEnded, isInputInitialized, isSplashHidden]);

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
