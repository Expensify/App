import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {ReactElement} from 'react';
import {KeyboardEvents, useKeyboardHandler} from 'react-native-keyboard-controller';
import {runOnJS} from 'react-native-reanimated';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import getKeyboardHeight from '@libs/getKeyboardHeight';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {BaseKeyboardStateProvider, KeyboardStateContext} from './BaseProvider';

function KeyboardStateProvider({children}: ChildrenProps): ReactElement | null {
    const {bottom} = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardActiveHeight, setKeyboardActiveHeight] = useState(0);
    const [isKeyboardActive, setIsKeyboardActive] = useState(false);
    const isKeyboardAnimatingRef = useRef(false);

    useEffect(() => {
        const showListener = KeyboardEvents.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(getKeyboardHeight(e.height, bottom));
            setIsKeyboardActive(true);
        });
        const hideListener = KeyboardEvents.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
            setIsKeyboardActive(false);
        });
        const willShowListener = KeyboardEvents.addListener('keyboardWillShow', (e) => {
            setIsKeyboardActive(true);
            setKeyboardActiveHeight(e.height);
        });
        const willHideListener = KeyboardEvents.addListener('keyboardWillHide', () => {
            setIsKeyboardActive(false);
            setKeyboardActiveHeight(0);
        });

        return () => {
            showListener.remove();
            hideListener.remove();
            willShowListener.remove();
            willHideListener.remove();
        };
    }, [bottom]);

    const setIsKeyboardAnimating = useCallback((animating: boolean) => {
        isKeyboardAnimatingRef.current = animating;
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

    return (
        <BaseKeyboardStateProvider
            keyboardHeight={keyboardHeight}
            keyboardActiveHeight={keyboardActiveHeight}
            isKeyboardActive={isKeyboardActive}
            isKeyboardAnimatingRef={isKeyboardAnimatingRef}
        >
            {children}
        </BaseKeyboardStateProvider>
    );
}

KeyboardStateProvider.displayName = 'KeyboardStateProvider';

export {KeyboardStateProvider, KeyboardStateContext};
