import type {ReactElement, RefObject} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {KeyboardEvents, useKeyboardHandler} from 'react-native-keyboard-controller';
import {scheduleOnRN} from 'react-native-worklets';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import getKeyboardHeight from '@libs/getKeyboardHeight';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type KeyboardStateContextValue = {
    /** Whether the keyboard is open */
    isKeyboardShown: boolean;

    /** Whether the keyboard is animating or shown */
    isKeyboardActive: boolean;

    /** Height of the keyboard in pixels */
    keyboardHeight: number;

    /** Future or present height of the keyboard in pixels. Available together with isKeyboardActive. */
    keyboardActiveHeight: number;

    /** Ref to check if the keyboard is animating */
    isKeyboardAnimatingRef: RefObject<boolean>;
};

const KeyboardStateContext = createContext<KeyboardStateContextValue>({
    isKeyboardShown: false,
    isKeyboardActive: false,
    keyboardHeight: 0,
    keyboardActiveHeight: 0,
    isKeyboardAnimatingRef: {current: false},
});

function KeyboardStateProvider({children}: ChildrenProps): ReactElement | null {
    const {bottom} = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardActiveHeight, setKeyboardActiveHeight] = useState(0);
    const isKeyboardAnimatingRef = useRef(false);
    const [isKeyboardActive, setIsKeyboardActive] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = KeyboardEvents.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(getKeyboardHeight(e.height, bottom));
            setIsKeyboardActive(true);
        });
        const keyboardDidHideListener = KeyboardEvents.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
            setIsKeyboardActive(false);
        });
        const keyboardWillShowListener = KeyboardEvents.addListener('keyboardWillShow', (e) => {
            setIsKeyboardActive(true);
            setKeyboardActiveHeight(e.height);
        });
        const keyboardWillHideListener = KeyboardEvents.addListener('keyboardWillHide', () => {
            setIsKeyboardActive(false);
            setKeyboardActiveHeight(0);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, [bottom]);

    const setIsKeyboardAnimating = useCallback((isAnimating: boolean) => {
        isKeyboardAnimatingRef.current = isAnimating;
    }, []);

    useKeyboardHandler(
        {
            onStart: () => {
                'worklet';

                scheduleOnRN(setIsKeyboardAnimating, true);
            },
            onEnd: () => {
                'worklet';

                scheduleOnRN(setIsKeyboardAnimating, false);
            },
        },
        [],
    );

    const contextValue = useMemo(
        () => ({
            keyboardHeight,
            keyboardActiveHeight,
            isKeyboardShown: keyboardHeight !== 0,
            isKeyboardAnimatingRef,
            isKeyboardActive,
        }),
        [isKeyboardActive, keyboardActiveHeight, keyboardHeight],
    );
    return <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>;
}

export type {KeyboardStateContextValue};
export {KeyboardStateProvider, KeyboardStateContext};
