import React, {ComponentType, createContext, ForwardedRef, forwardRef, ReactNode, useEffect, useState} from 'react';
import {Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';

type KeyboardStateContextValue = {
    /** Whether the keyboard is open */
    isKeyboardShown: boolean;
};

type KeyboardStateProviderProps = {
    /* Actual content wrapped by this component */
    children: ReactNode;
};

// TODO: Remove - left for backwards compatibility with existing components.
const keyboardStatePropTypes = {
    /** Whether the keyboard is open */
    isKeyboardShown: PropTypes.bool.isRequired,
};

const KeyboardStateContext = createContext<KeyboardStateContextValue | null>(null);

function KeyboardStateProvider(props: KeyboardStateProviderProps) {
    const {children} = props;
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

    return <KeyboardStateContext.Provider value={{isKeyboardShown}}>{children}</KeyboardStateContext.Provider>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function withKeyboardState(WrappedComponent: ComponentType<{ref: ForwardedRef<unknown>}>) {
    const WithKeyboardState = forwardRef((props: Record<string, unknown>, ref: React.ForwardedRef<unknown>) => (
        <KeyboardStateContext.Consumer>
            {(keyboardStateProps) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...keyboardStateProps}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            )}
        </KeyboardStateContext.Consumer>
    ));
    (WithKeyboardState as unknown as {displayName: string}).displayName = `withKeyboardState(${getComponentDisplayName(WrappedComponent as ComponentType)})`;
    return WithKeyboardState;
}

export {KeyboardStateProvider, keyboardStatePropTypes, type KeyboardStateContextValue, KeyboardStateContext};
