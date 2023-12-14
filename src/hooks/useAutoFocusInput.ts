import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {InteractionManager, TextInput} from 'react-native';
import CONST from '@src/CONST';
import * as Expensify from '@src/Expensify';

type UseAutoFocusInput = {
    inputCallbackRef: (ref: TextInput | null) => void;
};

export default function useAutoFocusInput(): UseAutoFocusInput {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);

    // @ts-expect-error TODO: Remove this when Expensify.js is migrated.
    const {isSplashHidden} = useContext(Expensify.SplashScreenHiddenContext);

    const inputRef = useRef<TextInput | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current || !isSplashHidden) {
            return;
        }
        InteractionManager.runAfterInteractions(() => {
            inputRef.current?.focus();
            setIsScreenTransitionEnded(false);
        });
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

    const inputCallbackRef = (ref: TextInput | null) => {
        inputRef.current = ref;
        setIsInputInitialized(true);
    };

    return {inputCallbackRef};
}
