import React from 'react';
import {TextInput} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';

const propTypes = {
    // Styles to apply to the text input when it has focus
    // eslint-disable-next-line react/forbid-prop-types
    styleFocusIn: PropTypes.any,

    // Styles to apply to the text input when it does not have focus
    // eslint-disable-next-line react/forbid-prop-types
    styleFocusOut: PropTypes.any,
};
const defaultProps = {
    styleFocusIn: null,
    styleFocusOut: null,
};

class TextInputWithFocusStyles extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            style: this.props.styleFocusOut,
        };
    }

    render() {
        // Make full objects out of both the style coming from props, and the style we have in the state
        const propStyles = !_.isArray(this.props.style)
            ? this.props.style
            : _.reduce(this.props.style, (finalStyles, s) => ({
                ...finalStyles,
                ...s
            }), {});
        const stateStyles = !_.isArray(this.state.style)
            ? this.state.style
            : _.reduce(this.state.style, (finalStyles, s) => ({
                ...finalStyles,
                ...s
            }), {});

        // Merge the two styles together
        const mergedStyles = _.extend(propStyles, stateStyles);

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
                style={mergedStyles}
                onFocus={() => {
                    this.setState({style: this.props.styleFocusIn});
                    this.props.onFocus();
                }}
                onBlur={() => {
                    this.setState({style: this.props.styleFocusOut});
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

export default React.forwardRef((props, ref) => {
    return <TextInputWithFocusStyles {...props} forwardedRef={ref} />
});
