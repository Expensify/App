import React from 'react';
import {TextInput} from 'react-native';
import PropTypes from 'prop-types';

/**
 * On native layers we like to have the Text Input not focused so the user can read new chats without they keyboard in
 * the way of the view
 */

const propTypes = {
    // If the input should clear, it actually gets intercepted instead of .clear()
    shouldClear: PropTypes.bool,

    // When the input has cleared whoever owns this input should know about it
    onClear: PropTypes.func,
};

const defaultProps = {
    shouldClear: false,
    onClear: () => {},
};

class TextInputFocusable extends React.Component {
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
export default TextInputFocusable;
