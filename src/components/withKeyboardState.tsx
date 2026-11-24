import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import getKeyboardHeight from '@libs/getKeyboardHeight';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ReactElement, RefObject} from 'react';

import React, {createContext, useEffect, useRef, useState} from 'react';
import {KeyboardEvents, useKeyboardHandler} from 'react-native-keyboard-controller';
import {scheduleOnRN} from 'react-native-worklets';

type KeyboardStateContextValue = {
    isKeyboardShown: boolean;

    /** Whether the keyboard is animating or shown */
    isKeyboardActive: boolean;

    /** Height of the keyboard in pixels */
    keyboardHeight: number;

    /** Future or present height of the keyboard in pixels. Available together with isKeyboardActive. */
    keyboardActiveHeight: number;

    isKeyboardAnimatingRef: RefObject<boolean>;
};

const KeyboardStateContext = createContext<KeyboardStateContextValue>({
    isKeyboardShown: false,
    isKeyboardActive: false,
    keyboardHeight: 0,
    keyboardActiveHeight: 0,
    isKeyboardAnimatingRef: {current: false},
});

/**
 * Whether the keyboard is shown, kept in a ref whose identity never changes. The value of KeyboardStateContext changes on
 * every keyboard event and re-renders all of its consumers, so code that only reads the value in callbacks uses this instead.
 */
const KeyboardShownRefContext = createContext<RefObject<boolean>>({current: false});

function KeyboardStateProvider({children}: ChildrenProps): ReactElement | null {
    const {bottom} = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardActiveHeight, setKeyboardActiveHeight] = useState(0);
    const isKeyboardAnimatingRef = useRef(false);
    const isKeyboardShownRef = useRef(false);
    const [isKeyboardActive, setIsKeyboardActive] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = KeyboardEvents.addListener('keyboardDidShow', (e) => {
            const height = getKeyboardHeight(e.height, bottom);
            isKeyboardShownRef.current = height !== 0;
            setKeyboardHeight(height);
            setIsKeyboardActive(true);
        });
        const keyboardDidHideListener = KeyboardEvents.addListener('keyboardDidHide', () => {
            isKeyboardShownRef.current = false;
            setKeyboardHeight(0);
            setIsKeyboardActive(false);
            // Sometimes 'keyboardWillHide' is not called (popover closed when keyboard is open), in this case we don't want stale keyboardActiveHeight value
            setKeyboardActiveHeight(0);
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

    const setIsKeyboardAnimating = (isAnimating: boolean) => {
        isKeyboardAnimatingRef.current = isAnimating;
    };

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

    const contextValue = {
        keyboardHeight,
        keyboardActiveHeight,
        isKeyboardShown: keyboardHeight !== 0,
        isKeyboardAnimatingRef,
        isKeyboardActive,
    };
    return (
        <KeyboardShownRefContext.Provider value={isKeyboardShownRef}>
            <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>
        </KeyboardShownRefContext.Provider>
    );
}

export type {KeyboardStateContextValue};
export {KeyboardStateProvider, KeyboardStateContext, KeyboardShownRefContext};
