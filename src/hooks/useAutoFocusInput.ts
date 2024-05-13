import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager} from 'react-native';
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

    useEffect(() => {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current || !isSplashHidden) {
            return;
        }
        const focusTaskHandle = InteractionManager.runAfterInteractions(() => {
            inputRef.current?.focus();
            setIsScreenTransitionEnded(false);
        });

        return () => {
            focusTaskHandle.cancel();
        };
    }, [isScreenTransitionEnded, isInputInitialized, isSplashHidden]);

    useFocusEffect(
        useCallback(() => {
            const timeoutRef = setTimeout(() => {
                setIsScreenTransitionEnded(true);
            }, CONST.ANIMATED_TRANSITION);
            return () => {
                setIsScreenTransitionEnded(false);
                clearTimeout(timeoutRef);
            };
        }, []),
    );

    const inputCallbackRef = useCallback((ref: TextInput | null) => {
        inputRef.current = ref;
        setIsInputInitialized(true);
    }, []);

    return {inputCallbackRef};
}
