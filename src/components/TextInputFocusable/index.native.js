import React from 'react';
import {TextInput} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';

/**
 * On native layers we like to have the Text Input not focused so the user can read new chats without they keyboard in
 * the way of the view
 */

const propTypes = {
    // If the input should clear, it actually gets intercepted instead of .clear()
    shouldClear: PropTypes.bool,

    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,

    // When the input has cleared whoever owns this input should know about it
    onClear: PropTypes.func,
};

const defaultProps = {
    shouldClear: false,
    onClear: () => {},
};

class TextInputFocusable extends React.Component {
    componentDidMount() {
        if (this.props.forwardedRef && _.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.textInput);
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.shouldClear && this.props.shouldClear) {
            this.textInput.clear();
            this.props.onClear();
        }
    }

    render() {
        return (
            <TextInput
                ref={el => this.textInput = el}
                maxHeight={116}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...this.props}
            />
        );
    }
}

TextInputFocusable.displayName = 'TextInputFocusable';
TextInputFocusable.propTypes = propTypes;
TextInputFocusable.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputFocusable {...props} forwardedRef={ref} />
));
