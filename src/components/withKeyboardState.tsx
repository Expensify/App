import type {ReactElement, RefObject} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {KeyboardEvents, useKeyboardHandler} from 'react-native-keyboard-controller';
import {runOnJS} from 'react-native-reanimated';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import getKeyboardHeight from '@libs/getKeyboardHeight';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
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
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    useEffect(() => {
        if (!isWeb) {
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
        }

        // Web platform: Use window.visualViewport and focus/blur events
        const handleViewportResize = () => {
            if (!window.visualViewport) {
                setKeyboardHeight(0);
                setIsKeyboardActive(false);
                return;
            }

            const viewportHeight = window.visualViewport.height;
            const windowHeight = window.innerHeight;
            const estimatedKeyboardHeight = windowHeight - viewportHeight;

            // Consider the keyboard shown if the viewport height is significantly reduced
            const isKeyboardLikelyShown = estimatedKeyboardHeight > 100; // Arbitrary threshold for web virtual keyboards
            setKeyboardHeight(isKeyboardLikelyShown ? estimatedKeyboardHeight : 0);
            setIsKeyboardActive(isKeyboardLikelyShown);
        };

        const handleFocus = (event: FocusEvent) => {
            // Check if the focused element is an input or textarea
            const target = event.target as HTMLElement;

            if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
                setIsKeyboardActive(true);
                handleViewportResize(); // Re-check viewport on focus
            }
        };

        const handleBlur = (event: FocusEvent) => {
            const target = event.target as HTMLElement;

            if (['INPUT', 'TEXTAREA', 'DIV'].includes(target.tagName)) {
                setIsKeyboardActive(false);
                setKeyboardHeight(0);
            }
        };

        if (isWeb) {
            // Listen to viewport changes for virtual keyboard detection
            window.visualViewport?.addEventListener('resize', handleViewportResize);
            // Listen to focus/blur events on inputs
            document.addEventListener('focus', handleFocus, true);
            document.addEventListener('blur', handleBlur, true);

            return () => {
                window.visualViewport?.removeEventListener('resize', handleViewportResize);
                document.removeEventListener('focus', handleFocus, true);
                document.removeEventListener('blur', handleBlur, true);
            };
        }
    }, [bottom, isWeb]);

    const setIsKeyboardAnimating = useCallback((isAnimating: boolean) => {
        isKeyboardAnimatingRef.current = isAnimating;
    }, []);

    useKeyboardHandler(
        {
            onStart: () => {
                'worklet';

                if (!isWeb) {
                    runOnJS(setIsKeyboardAnimating)(true);
                }
            },
            onEnd: () => {
                'worklet';

                if (!isWeb) {
                    runOnJS(setIsKeyboardAnimating)(false);
                }
            },
        },
        [isWeb],
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
