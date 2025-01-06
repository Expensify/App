import type {ReactElement} from 'react';
import React, {createContext, useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type KeyboardStateContextValue = {
    /** Whether the keyboard is open */
    isKeyboardShown: boolean;

    /** Height of the keyboard in pixels */
    keyboardHeight: number;
};

const KeyboardStateContext = createContext<KeyboardStateContextValue>({
    isKeyboardShown: false,
    keyboardHeight: 0,
});

function KeyboardStateProvider({children}: ChildrenProps): ReactElement | null {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const contextValue = useMemo(
        () => ({
            keyboardHeight,
            isKeyboardShown: keyboardHeight !== 0,
        }),
        [keyboardHeight],
    );
    return <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>;
}

export type {KeyboardStateContextValue};
export {KeyboardStateProvider, KeyboardStateContext};
