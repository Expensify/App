import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import type {View, TextInput} from 'react-native';
import {InteractionManager} from 'react-native';
import CONST from '@src/CONST';
import * as Expensify from '@src/Expensify';

type FocusRef = View | TextInput | null
type UseAutoFocusInput = {
    inputCallbackRef: (ref: FocusRef) => void;
};

export default function useAutoFocusInput(): UseAutoFocusInput {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);

    const {isSplashHidden} = useContext(Expensify.SplashScreenHiddenContext);

    const inputRef = useRef<FocusRef>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            focusTimeoutRef.current = setTimeout(() => {
                setIsScreenTransitionEnded(true);
            }, CONST.ANIMATED_TRANSITION);
            return () => {
                setIsScreenTransitionEnded(false);
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    const inputCallbackRef = (ref: FocusRef) => {
        inputRef.current = ref;
        if (isInputInitialized) {
            return;
        }
        setIsInputInitialized(true);
    };

    return {inputCallbackRef};
}
