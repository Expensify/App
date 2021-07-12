import React from 'react';
import {TextInput, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';

const propTypes = {
    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func.isRequired,

    /** Styles to apply to the text input when it has focus */
    // eslint-disable-next-line react/forbid-prop-types
    styleFocusIn: PropTypes.any,

    /** Styles to apply to the text input when it does not have focus */
    // eslint-disable-next-line react/forbid-prop-types
    styleFocusOut: PropTypes.any,

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** A function to call when the input has been blurred */
    onBlur: PropTypes.func,

    /** A function to call when the input has gotten focus */
    onFocus: PropTypes.func,
};
const defaultProps = {
    styleFocusIn: null,
    styleFocusOut: null,
    style: null,
    onBlur: () => {},
    onFocus: () => {},
};

class TextInputWithFocusStyles extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isFocused: false,
        };
    }

    render() {
        // Make full objects out of both the style coming from props, and the style we have in the state
        const propStyles = StyleSheet.flatten(this.props.style);
        const focusedStyle = this.state.isFocused
            ? StyleSheet.flatten(this.props.styleFocusIn)
            : StyleSheet.flatten(this.props.styleFocusOut);

        // Merge the two styles together
        const style = StyleSheet.compose(propStyles, focusedStyle);

        // Omit the props that are used in this intermediary component and only pass down the props that
        // are necessary
        const propsToPassToTextInput = _.omit(this.props, [
            'focusInStyle',
            'focusOutStyle',
            'onFocus',
            'onBlur',
            'style',
        ]);
        return (
            <TextInput
                ref={this.props.forwardedRef}
                style={style}
                onFocus={() => {
                    this.setState({isFocused: true});
                    this.props.onFocus();
                }}
                onBlur={() => {
                    this.setState({isFocused: false});
                    this.props.onBlur();
                }}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...propsToPassToTextInput}
            />
        );
    }
}

TextInputWithFocusStyles.propTypes = propTypes;
TextInputWithFocusStyles.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputWithFocusStyles {...props} forwardedRef={ref} />
));
