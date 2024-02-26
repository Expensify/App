import PropTypes from 'prop-types';
import type {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import React, {createContext, forwardRef, useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type KeyboardStateContextValue = {
    /** Whether the keyboard is open */
    isKeyboardShown: boolean;

    /** Height of the keyboard in pixels */
    keyboardHeight: number;
};

// TODO: Remove - left for backwards compatibility with existing components (https://github.com/Expensify/App/issues/25151)
const keyboardStatePropTypes = {
    /** Whether the keyboard is open */
    isKeyboardShown: PropTypes.bool.isRequired,

    /** Height of the keyboard in pixels */
    keyboardHeight: PropTypes.number.isRequired,
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

export default function withKeyboardState<TProps extends KeyboardStateContextValue, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof KeyboardStateContextValue> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithKeyboardState(props: Omit<TProps, keyof KeyboardStateContextValue>, ref: ForwardedRef<TRef>) {
        return (
            <KeyboardStateContext.Consumer>
                {(keyboardStateProps) => (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...keyboardStateProps}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(props as TProps)}
                        ref={ref}
                    />
                )}
            </KeyboardStateContext.Consumer>
        );
    }
    WithKeyboardState.displayName = `withKeyboardState(${getComponentDisplayName(WrappedComponent)})`;
    return forwardRef(WithKeyboardState);
}

export {KeyboardStateProvider, keyboardStatePropTypes, type KeyboardStateContextValue, KeyboardStateContext};
