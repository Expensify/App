import PropTypes from 'prop-types';
import type {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import React, {createContext, forwardRef, useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type KeyboardStateContextValue = {
    /** Whether the keyboard is open */
    isKeyboardShown: boolean;
};

// TODO: Remove - left for backwards compatibility with existing components (https://github.com/Expensify/App/issues/25151)
const keyboardStatePropTypes = {
    /** Whether the keyboard is open */
    isKeyboardShown: PropTypes.bool.isRequired,
};

const KeyboardStateContext = createContext<KeyboardStateContextValue | null>(null);

function KeyboardStateProvider({children}: ChildrenProps): ReactElement | null {
    const [isKeyboardShown, setIsKeyboardShown] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardShown(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardShown(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const contextValue = useMemo(
        () => ({
            isKeyboardShown,
        }),
        [isKeyboardShown],
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
