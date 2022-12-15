/* eslint-disable react/no-unused-state */
import React, {forwardRef, createContext} from 'react';
import PropTypes from 'prop-types';
import {Keyboard} from 'react-native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const KeyboardStateContext = createContext(null);
const keyboardStatePropTypes = {
    /** Whether or not the keyboard is open */
    isShown: PropTypes.bool.isRequired,
};

const keyboardStateProviderPropTypes = {
    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

class KeyboardStateProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isShown: false,
        };
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                this.setState({isShown: true});
            },
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                this.setState({isShown: false});
            },
        );
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    render() {
        return (
            <KeyboardStateContext.Provider value={this.state}>
                {this.props.children}
            </KeyboardStateContext.Provider>
        );
    }
}

KeyboardStateProvider.propTypes = keyboardStateProviderPropTypes;

/**
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
export default function withKeyboardState(WrappedComponent) {
    const WithKeyboardState = forwardRef((props, ref) => (
        <KeyboardStateContext.Consumer>
            {keyboardStateProps => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <WrappedComponent {...keyboardStateProps} {...props} ref={ref} />
            )}
        </KeyboardStateContext.Consumer>
    ));

    WithKeyboardState.displayName = `withKeyboardState(${getComponentDisplayName(WrappedComponent)})`;
    return WithKeyboardState;
}

export {
    KeyboardStateProvider,
    keyboardStatePropTypes,
};
