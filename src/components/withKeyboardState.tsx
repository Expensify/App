import type {MutableRefObject, ReactElement} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {KeyboardEvents, useKeyboardHandler} from 'react-native-keyboard-controller';
import {runOnJS} from 'react-native-reanimated';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import getKeyboardHeight from '@libs/getKeyboardHeight';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type KeyboardStateContextValue = {
    /** Whether the keyboard is open */
    isKeyboardShown: boolean;

    /** Height of the keyboard in pixels */
    keyboardHeight: number;

    isKeyboardAnimatingRef: MutableRefObject<boolean>;

    /** Whether the keyboard is about to show */
    isKeyboardWillShow: boolean;

    /** Whether the keyboard is about to hide */
    isKeyboardWillHide: boolean;
};

const KeyboardStateContext = createContext<KeyboardStateContextValue>({
    isKeyboardShown: false,
    keyboardHeight: 0,
    isKeyboardAnimatingRef: {current: false},
    isKeyboardWillShow: false,
    isKeyboardWillHide: false,
});

function KeyboardStateProvider({children}: ChildrenProps): ReactElement | null {
    const {bottom} = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const isKeyboardAnimatingRef = useRef(false);
    const [isKeyboardWillShow, setIsKeyboardWillShow] = useState(false);
    const [isKeyboardWillHide, setIsKeyboardWillHide] = useState(false);
    useEffect(() => {
        const keyboardDidShowListener = KeyboardEvents.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(getKeyboardHeight(e.height, bottom));
            setIsKeyboardWillShow(false);
        });
        const keyboardDidHideListener = KeyboardEvents.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
            setIsKeyboardWillHide(false);
        });
        const keyboardWillShowListener = KeyboardEvents.addListener('keyboardWillShow', () => {
            setIsKeyboardWillShow(true);
            setIsKeyboardWillHide(false);
        });
        const keyboardWillHideListener = KeyboardEvents.addListener('keyboardWillHide', () => {
            setIsKeyboardWillHide(true);
            setIsKeyboardWillShow(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, [bottom]);

    useEffect(() => {
        const keyboardDidShowListener = KeyboardEvents.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(getKeyboardHeight(e.height, bottom));
        });
        const keyboardDidHideListener = KeyboardEvents.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [bottom]);

    const setIsKeyboardAnimating = useCallback((isAnimating: boolean) => {
        isKeyboardAnimatingRef.current = isAnimating;
    }, []);

    useKeyboardHandler(
        {
            onStart: () => {
                'worklet';

                runOnJS(setIsKeyboardAnimating)(true);
            },
            onEnd: () => {
                'worklet';

                runOnJS(setIsKeyboardAnimating)(false);
            },
        },
        [],
    );

    const contextValue = useMemo(
        () => ({
            keyboardHeight,
            isKeyboardShown: keyboardHeight !== 0,
            isKeyboardAnimatingRef,
            isKeyboardWillHide,
            isKeyboardWillShow,
        }),
        [keyboardHeight, isKeyboardWillHide, isKeyboardWillShow],
    );
    return <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>;
}

export type {KeyboardStateContextValue};
export {KeyboardStateProvider, KeyboardStateContext};
