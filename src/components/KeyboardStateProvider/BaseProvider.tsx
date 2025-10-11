import React, {createContext, useMemo} from 'react';
import type {ReactElement} from 'react';
import type {BaseKeyboardStateProviderProps, KeyboardStateContextValue} from './type';

const KeyboardStateContext = createContext<KeyboardStateContextValue>({
    isKeyboardShown: false,
    isKeyboardActive: false,
    keyboardHeight: 0,
    keyboardActiveHeight: 0,
    isKeyboardAnimatingRef: {current: false},
});

function BaseKeyboardStateProvider({children, keyboardHeight, keyboardActiveHeight, isKeyboardActive, isKeyboardAnimatingRef}: BaseKeyboardStateProviderProps): ReactElement {
    const contextValue = useMemo(
        () => ({
            keyboardHeight,
            keyboardActiveHeight,
            isKeyboardShown: keyboardHeight !== 0,
            isKeyboardAnimatingRef,
            isKeyboardActive,
        }),
        [keyboardHeight, keyboardActiveHeight, isKeyboardActive, isKeyboardAnimatingRef],
    );

    return <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>;
}

BaseKeyboardStateProvider.displayName = 'BaseKeyboardStateProvider';

export type {KeyboardStateContextValue};
export {BaseKeyboardStateProvider, KeyboardStateContext};
