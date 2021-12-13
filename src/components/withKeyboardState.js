import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Keyboard} from 'react-native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const withKeyboardStatePropTypes = {
    /** Returns whether keyboard is open */
    isShown: PropTypes.bool.isRequired,
};

export default function withKeyboardState(WrappedComponent) {
    const WithKeyboardState = class extends Component {
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            return <WrappedComponent {...this.props} isShown={this.state.isShown} />;
        }
    };

    WithKeyboardState.displayName = `WithKeyboardState(${getComponentDisplayName(WrappedComponent)})`;
    WithKeyboardState.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithKeyboardState.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithKeyboardState {...props} forwardedRef={ref} />
    ));
}

export {
    withKeyboardStatePropTypes,
};
