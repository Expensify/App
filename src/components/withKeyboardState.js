import React, {forwardRef, createContext, useEffect, useState, useMemo} from 'react';
import {Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const KeyboardStateContext = createContext(null);
const keyboardStatePropTypes = {
    /** Whether or not the keyboard is open */
    isKeyboardShown: PropTypes.bool.isRequired,
};

const keyboardStateProviderPropTypes = {
    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

function KeyboardStateProvider(props) {
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

    const contextValue = useMemo(
        () => ({
            isKeyboardShown,
        }),
        [isKeyboardShown],
    );
    return <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>;
}

KeyboardStateProvider.propTypes = keyboardStateProviderPropTypes;

/**
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
export default function withKeyboardState(WrappedComponent) {
    const WithKeyboardState = forwardRef((props, ref) => (
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

    WithKeyboardState.displayName = `withKeyboardState(${getComponentDisplayName(WrappedComponent)})`;
    return WithKeyboardState;
}

export {KeyboardStateProvider, keyboardStatePropTypes, KeyboardStateContext};
