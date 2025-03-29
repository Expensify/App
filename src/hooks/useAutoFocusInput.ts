import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager} from 'react-native';
import {moveSelectionToEnd, scrollToBottom} from '@libs/InputUtils';
import CONST from '@src/CONST';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';
import useSidePane from './useSidePane';

type UseAutoFocusInput = {
    inputCallbackRef: (ref: TextInput | null) => void;
    inputRef: RefObject<TextInput | null>;
};

export default function useAutoFocusInput(isMultiline = false): UseAutoFocusInput {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);

    const {splashScreenState} = useSplashScreenStateContext();

    const inputRef = useRef<TextInput | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current || splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN) {
            return;
        }
        const focusTaskHandle = InteractionManager.runAfterInteractions(() => {
            if (inputRef.current && isMultiline) {
                moveSelectionToEnd(inputRef.current);
            }
            inputRef.current?.focus();
            setIsScreenTransitionEnded(false);
        });

        return () => {
            focusTaskHandle.cancel();
        };
    }, [isMultiline, isScreenTransitionEnded, isInputInitialized, splashScreenState]);

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

    // Trigger focus when side pane transition ends
    const {isSidePaneTransitionEnded, shouldHideSidePane} = useSidePane();
    useEffect(() => {
        if (!shouldHideSidePane) {
            return;
        }

        setIsScreenTransitionEnded(isSidePaneTransitionEnded);
    }, [isSidePaneTransitionEnded, shouldHideSidePane]);

    const inputCallbackRef = (ref: TextInput | null) => {
        inputRef.current = ref;
        if (isInputInitialized) {
            return;
        }
        if (ref && isMultiline) {
            scrollToBottom(ref);
        }
        setIsInputInitialized(true);
    };

    return {inputCallbackRef, inputRef};
}
